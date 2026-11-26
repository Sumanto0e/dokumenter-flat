"""Align known script to voice recordings using silence gaps.
Output words.json: [{bab, text, start, end, sentEnd}] in master-timeline seconds."""
import json, re, subprocess, sys

GAP = 0.7  # seconds of silence inserted between chapters in the master
LEAD = 0.5  # silence before chapter 1

ONES = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]

def say(n):
    n = int(n)
    if n < 10: return ONES[n]
    if n == 10: return "sepuluh"
    if n == 11: return "sebelas"
    if n < 20: return ONES[n-10] + " belas"
    if n < 100: return ONES[n//10] + " puluh" + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 200: return "seratus" + ("" if n == 100 else " " + say(n-100))
    if n < 1000: return ONES[n//100] + " ratus" + ("" if n % 100 == 0 else " " + say(n % 100))
    if n < 2000: return "seribu" + ("" if n == 1000 else " " + say(n-1000))
    return say(n//1000) + " ribu" + ("" if n % 1000 == 0 else " " + say(n % 1000))

def spoken(tok):
    t = re.sub(r'[^\w,%.-]', '', tok.replace('Rp', ''))
    t = t.strip('.,')
    m = re.fullmatch(r'(\d+)(?:,(\d+))?(%?)', t)
    if not m: return tok
    s = say(m.group(1))
    if m.group(2): s += " koma " + " ".join(ONES[int(c)] for c in m.group(2))
    if m.group(3): s += " persen"
    return s

def weight(tok):
    sp = spoken(tok).lower()
    v = len(re.findall(r'[aiueo]+', sp))
    return max(v, 1) + 0.3

def silences(path, th=-30):
    out = subprocess.run(["ffmpeg", "-i", path, "-af", f"silencedetect=noise={th}dB:d=0.18", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    if en and (not st or en[0] < st[0]): st = [0.0] + st
    return list(zip(st, en + [None] * (len(st) - len(en))))

def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True).stdout)

text = open("script.txt").read()
babs = [b.strip() for b in re.split(r'^#\d+\s*$', text, flags=re.M) if b.strip()]
allw, offset, chapters = [], LEAD, []
for i, body in enumerate(babs, 1):
    path = f"n{i}.wav"
    D = dur(path)
    npunct = len(re.findall(r'[.,:?!"](\s|$)', body))
    best = None
    for th in (-36, -33, -30, -28, -26, -24):
        cand = silences(path, th)
        score = abs(len(cand) - npunct * 0.8)
        if best is None or score < best[0]: best = (score, cand, th)
    print("  th", best[2], "gaps", len(best[1]), "punct", npunct)
    sil = [(s, e if e is not None else D) for s, e in best[1]]
    # speech intervals
    speech, t = [], 0.0
    for s, e in sil:
        if s > t + 0.05: speech.append((t, s))
        t = max(t, e)
    if t < D - 0.05: speech.append((t, D))
    toks = body.split()
    ws = [weight(x) for x in toks]
    total_w = sum(ws)
    total_sp = sum(e - s for s, e in speech)
    def sp2real(x):
        acc = 0.0
        for s, e in speech:
            if x <= acc + (e - s) + 1e-9: return s + (x - acc)
            acc += e - s
        return speech[-1][1]
    # proportional speech-time position of each token
    cum, pos = 0.0, []
    for w in ws:
        pos.append((cum / total_w * total_sp, (cum + w) / total_w * total_sp)); cum += w
    words = [{"text": tk, "s": sp2real(a + 0.001), "e": sp2real(b - 0.001)} for tk, (a, b) in zip(toks, pos)]
    # snap phrase boundaries to the nearest real gap, keeping order
    gaps = [(s, e) for s, e in sil if s > 0.1 and e < D - 0.1]
    last_t = 0.0
    anchors = [(0, speech[0][0])]
    for k, w in enumerate(words[:-1]):
        if re.search(r'[.,:?!"]$', w["text"]):
            pred = w["e"]
            best = None
            for s, e in gaps:
                if s > last_t and abs(s - pred) < 1.2 and (best is None or abs(s - pred) < abs(best[0] - pred)):
                    best = (s, e)
            if best:
                anchors.append((k + 1, best[1])); last_t = best[1]
                w["_end"] = best[0]
    anchors.append((len(words), speech[-1][1]))
    # re-distribute inside anchors
    for (a, ta), (b, tb) in zip(anchors, anchors[1:]):
        seg = words[a:b]
        if not seg: continue
        end_t = seg[-1].get("_end", tb)
        segw = ws[a:b]; sw = sum(segw); c = 0.0
        for w, wt in zip(seg, segw):
            w["s"] = ta + (end_t - ta) * c / sw; c += wt
            w["e"] = ta + (end_t - ta) * c / sw
    for w in words:
        allw.append({"bab": i, "text": w["text"], "start": round(w["s"] + offset, 3), "end": round(w["e"] + offset, 3),
                     "brk": bool(re.search(r'[.?!:]"?$', w["text"]))})
    chapters.append({"bab": i, "start": round(offset, 3), "end": round(offset + D, 3)})
    print(f"bab {i}: {D:.1f}s tokens={len(toks)} anchors={len(anchors)-2}")
    offset += D + GAP
json.dump({"words": allw, "chapters": chapters, "total": round(offset - GAP + 1.5, 3), "lead": LEAD, "gap": GAP},
          open("words.json", "w"), ensure_ascii=False, indent=1)
print("total", offset)
