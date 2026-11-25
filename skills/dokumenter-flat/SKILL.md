---
name: dokumenter-flat
description: Bikin video explainer YouTube gaya dokumenter animasi flat (16:9 + potongan Shorts 9:16) dari topik ekonomi/kebiasaan, end to end, pakai youtube-agent + Motion Physics & Easing Bible.
---

# Dokumenter Flat (explainer YouTube)

Gaya: dokumenter animasi vektor flat yang serius dan bisa dipercaya. Dibuka dengan kejadian nyata + orang nyata, lalu ditarik ke penjelasan besar. Diukur dari video referensi (17 menit, 135 potongan, rata-rata ±7,5 dtk/adegan). Lebih irit dari noir studio: separuh jumlah adegan, akting karakter minim, revisi cukup ganti label.

Channel: nazhak studio (@nazhaktv), full bahasa Indonesia, niche ekonomi & kebiasaan sehari-hari.

Referensi lengkap gerak: [MOTION_PHYSICS_EASING_BIBLE.md](MOTION_PHYSICS_EASING_BIBLE.md). Bagian 5 di bawah adalah ringkasannya; kalau ragu, file lengkap yang berlaku.

## 0. Alur kerja (urut, jangan loncat)

1. **Topik dari permintaan nyata.** Pakai `youtube-agent` mode yt-viral: cari topik di YouTube Indonesia (Uplika `search_youtube_videos`, format long, period 1y) dan pilih yang punya video dengan views/subs > 5 di channel kecil. Topik = kata yang orang ketik ("kenapa gaji cepat habis", "paylater bahaya").
2. **Riset + kisah pembuka.** Cari satu kejadian nyata yang beritanya bisa dikutip (orang, tempat, tanggal). Semua angka dan kutipan wajib bersumber dan diatribusikan; jangan mengarang kutipan, nama, atau kejadian. Kalau tidak ada kisah nyata yang layak, pakai skenario yang jelas dilabeli "ilustrasi".
3. **Naskah** pakai `youtube-agent` mode yt-script (5 hook, ambil 2 terbaik). Target 8–10 menit, ±160 kata/menit (1.300–1.600 kata). Kirim naskah bersih siap rekam + daftar sumber, tunggu persetujuan user.
4. **Rekaman suara user.** Suara mentah tanpa efek. Edit jeda halus (sama dengan noir-cartoon-reels 6b): ambang relatif p90−25 dB, jeda <0,30 dtk tidak disentuh, jeda panjang dibuang tengahnya sisa 0,26/0,36/0,48 dtk, crossfade 30 ms, jeda emosional ≥0,45 dtk. Normalisasi linear ke −14 LUFS, true peak ≤ −1,5 dBTP.
5. **Word timing:** faster-whisper + model npm `@skillninja/shortmovie-telop-model-p0..p3` (npm pack, gabung part, cek sha256), `language="id"`, `word_timestamps=True`, `initial_prompt`=naskah. Snap awal kata ke hening.
6. **Storyboard + motion score** (bagian 3 & 5) sebelum ngoding.
7. **Bangun di Remotion** 1920×1080, 30 fps. Library dulu, scene belakangan.
8. **Review**: still tiap 5 dtk scale 0.25 jadi lembar kontak; perbaiki; baru render penuh (nohup, concurrency 2, crf 18) lalu kompres crf 21 + alimiter.
9. **Paket YouTube** pakai `youtube-agent`: yt-package (judul + teks thumbnail, `title.py`), yt-seo (deskripsi, 3 query target), yt-chapters (`chapters.py`, retitle tiap bab), thumbnail 1280×720.
10. **3 Shorts** dari video panjang pakai yt-shorts: stage ulang ke 9:16 (jangan crop), hook baru, loop, caption karaoke, tutup dengan "video lengkapnya di channel".

Alat youtube-agent (clone sekali per sesi): `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/Jakeschincariol/youtube-agent-skill /tmp/yt-agent`. Catatan: `hookscore.py` dikalibrasi bahasa Inggris, skornya tidak bisa dipakai untuk hook bahasa Indonesia; `title.py` aman dipakai.

## 1. Struktur naskah

- **Cold open 30–45 dtk:** kejadian nyata di tengah aksi (siapa, di mana, kapan) → satu detail aneh → pertanyaan besar ("Kenapa ini bisa terjadi?") → janji video. Tanpa intro channel, tanpa minta subscribe.
- **Kutipan orang nyata** ditampilkan sebagai kartu kutipan + name tag (nama, peran), hanya kalau bersumber.
- **Bab 4–6**, tiap bab 1,5–2,5 menit, dibuka label bab kecil dan ditutup satu kalimat pukulan.
- **Angka selalu jadi benda** ("Rp5 juta = 50 lembar merah", "1 dari 3 orang" = barisan ikon).
- **Mitos vs fakta**: minimal satu "yang orang kira" → "yang sebenarnya".
- **Bagian praktis** di akhir (checklist langkah) supaya ada nilai yang bisa dibawa pulang.
- **Penutup** memanggil ulang adegan pembuka dengan satu hal berubah + satu pertanyaan ke komentar.

## 2. Bahasa visual

- **Vektor flat**, outline tipis atau tanpa outline, bayangan flat satu tingkat. Tidak ada gradient berat, tidak ada lighting noir.
- **Karakter proporsi manusia normal** (kepala oval, rambut satu bentuk, badan meruncing, tangan-kaki berbentuk isi bukan garis). Ekspresi minim; akting lewat pose dan arah pandang. Orang nyata digambar generik + atribut (baju, profesi), bukan mirip wajahnya.
- **Satu palet per video** (mis. biru tua untuk dunia finansial malam, krem untuk rumah) + **satu warna aksen** (kuning #ffd23f) hanya untuk kata/angka kunci.
- **Label teks kecil** gaya dokumenter: KAPITAL tebal putih 40–56 px + baris kecil di bawahnya 20–24 px (mis. "TANGGAL 25 / JAKARTA SELATAN"). Muncul di dekat benda yang dimaksud, kadang dengan garis penunjuk tipis.
- **Kosakata shot** (rotasi, jangan ulang tipe sama 3× berturut):
  1. Establishing wide (kota, rumah, kantor) + tag lokasi.
  2. Karakter medium dengan benda cerita.
  3. POV / over-the-shoulder ke layar HP (UI generik, bukan aplikasi asli).
  4. Close-up benda + label penunjuk.
  5. Kartu kutipan + name tag + timer/jam kecil.
  6. Peta flat dengan pin dan label tanggal.
  7. Data: barisan ikon "1 dari 3", batang yang tumbuh, counter angka.
  8. Tanggal besar di tengah ("1998", "FEBRUARI 2025") untuk loncat waktu.
  9. Checklist langkah bernomor ("STEP 1 · ...").
  10. Ruang gelap dengan satu sumber cahaya untuk momen serius.
- **Footage/foto asli** hanya milik user atau berlisensi bebas, beri kredit kecil di pojok. Jangan ambil dari video orang lain.
- Dokumen resmi tidak ditiru seperti asli; gambarkan idenya + tag sumber.

## 3. Storyboard

Naskah → beat (1 info atau 1 emosi, 5–20 dtk) → panel. Tiap panel: ukuran & sudut, info baru (kosong = buang), gerak kamera, label/teks, transisi, audio (kata pemicu, SFX). Rata-rata **6–8 dtk/panel** (cold open boleh 3–4 dtk). Tangga ukuran: dua panel berturut tidak boleh sama ukuran dan sudut. Transisi 90% cut; dissolve/whip hanya antar bab.

## 4. Implementasi (Remotion)

- Komponen: `easing.ts` + `additive()`, `<Cam>` (drift + moves + shake, parallax per layer), `<Label title sub>`, `<QuoteCard>`, `<NameTag>`, `<LocationTag>`, `<BigDate>`, `<IconArray>`, `<Checklist>`, `<MapFlat>`, `<PhoneUI>`, `<Person pose>`, `<Grain>`, `<Vignette>`.
- Semua gerak di-timing dari word timing (`at(t) = (t - t0) * 30`), cut ±0,08 dtk sebelum kata pertama adegan.
- Font dari file lokal (@fontsource) lewat `@remotion/fonts`; jangan Google Fonts saat render.
- Chrome lokal: `--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.
- Review cepat: skrip Node `@remotion/renderer` buka browser sekali, `renderStill` banyak frame scale 0.25, susun dengan ffmpeg tile.
- SFX disintesis Python (whoosh pelan, pop label, tik jam, ka-ching), stem ±−30 LUFS. Musik hanya kalau user minta.
- Subtitle tidak dibakar ke video panjang; kirim `.srt` dari word timing. Shorts pakai caption karaoke.

## 5. Motion (ringkasan Motion Physics & Easing Bible — wajib)

**7 hukum:** (1) easing dipilih dari rasa, tidak `linear` untuk gerak utama; (2) tumpang-tindih, jangan A→berhenti→B; (3) kurva ease-IN tidak pernah oper lebih awal; (4) video selalu bergerak, nol frame mati; (5) kamera tidak pernah parkir dan geraknya BESAR; (6) tidak ada yang gerak sinkron (stagger); (7) gerak cepat ngeblur dari kecepatan, tajam saat diam.

```ts
export const clamp01=(t:number)=>Math.min(1,Math.max(0,t));
export const outQuad=(t:number)=>1-(1-t)**2;
export const outQuart=(t:number)=>1-(1-t)**4;
export const outExpo=(t:number)=>(t>=1?1:1-Math.pow(2,-10*t));
export const inQuad=(t:number)=>t*t;
export const inCubic=(t:number)=>t**3;
export const inQuint=(t:number)=>t**5;
export const inCirc=(t:number)=>1-Math.sqrt(1-t*t);
export const inOutQuad=(t:number)=>t<0.5?2*t*t:1-(-2*t+2)**2/2;
export const inOutCubic=(t:number)=>t<0.5?4*t**3:1-(-2*t+2)**3/2;
export const inOutQuint=(t:number)=>t<0.5?16*t**5:1-(-2*t+2)**5/2;
export const inOutSine=(t:number)=>-(Math.cos(Math.PI*t)-1)/2;
type Tween={start:number;dur:number;delta:number;ease:(t:number)=>number};
export const additive=(f:number,base:number,tws:Tween[])=>tws.reduce((v,tw)=>v+tw.delta*tw.ease(clamp01((f-tw.start)/tw.dur)),base);
export const after=(a:Tween,r:number)=>Math.round(a.start+a.dur*r);
```

**House style dokumenter flat (tier MEDIUM, kamera SLOW):** label/benda masuk `outExpo` 18f; gestur & panel `outQuart` 15f; keluar `inCubic` 12f; pindah A→B & kamera `inOutCubic` 21f (kamera 1,5–2,5 dtk); transisi bab `inOutQuint` 27f; stempel/benda jatuh `inCirc` 12f + squash di frame kena.

**Handoff (elemen sama):** outExpo @50%, outQuart @60%, outQuad @70%, inOutQuint @68%, inOutCubic @72%, inOutQuad @75%; semua ease-in @100% (mendarat → reaksi, keluar, atau tahan 2–6f). Elemen LAIN boleh masuk di 60–80% exit elemen yang keluar.

**Stagger:** offset 8–15% durasi item (huruf 1f, kata 2–3f, baris 3–5f, ikon 2–4f, kartu 3–5f, panel 5–8f @30fps); total sebaran ≤ 1× durasi item; jitter pakai hash berbiji, **jangan `Math.random()`**. Exit di-stagger dengan gap 60–70%. Semua properti elemen ikut delay elemen itu.

**Properti sekunder:** opacity masuk 30–40% D outQuad; blur masuk 12–24px→0 selama 50–60% D; skala 0,85–0,92→1 selama 80–100% D; rotasi settle ±2–6° selesai paling akhir; anak telat 2–4f dari induk. Skala dari 0 hanya untuk pop (ikon, badge).

**Nol frame mati:** kejadian utama tiap 0,5–1,0 dtk; setelah settle → tahanan hidup (skala merayap +1–3%, drift 3–10px searah gerak terakhir, float sinus 3–6 dtk 2–6px beda fase). Kontinuitas momentum lintas cut (keluar ke kiri → yang baru datang dari kanan bergerak ke kiri).

**Kamera = drift + moves + shake.** Drift selalu (push-in 1,00→1,05–1,10 per scene atau lateral 2–5%, roll ≤1,5°). Gerak kamera translasi ≥15–40% frame atau zoom ≥12–15% (25–60% dramatis), tumpang-tindih @65–75%. Bangun dunia 3–4× ukuran frame supaya kamera punya tujuan. Parallax: latar 0,2–0,5×, konten 1×, foreground 1,3–2×. Ikuti benda dengan `spring` damping 200 stiffness 80 (telat 4–8f).

**Motion blur:** default Metode B (blur searah dari kecepatan `vel=fn(f+0.5)-fn(f-0.5)`, `blurLen=speed*180/360`, nyala >1,5px, feGaussianBlur x-only di wrapper yang diputar ke sudut gerak); Metode A `<CameraMotionBlur shutterAngle={180} samples={clamp(ceil(maxBlur/2.5),8,32)}>` hanya untuk whip/punch-in besar. Tidak boleh blur Gaussian biasa untuk pura-pura gerak.

**Motion score** sebelum ngoding: tabel `# | Elemen | Properti | Mulai | Dur | Δ | Kurva | Alasan | Handoff`, termasuk baris drift kamera. Detektor frame mati (maxMove < 0,3px) harus kosong.

**Anti-pattern:** linear di gerak utama; A→stop→B; gerak baru di tengah ease-in; banyak elemen mulai di frame sama; `Math.random()`; kamera mini 2–5%; frame beku "biar kebaca"; terlalu banyak keluarga kurva; exit ease-in lambat; gerak cepat tanpa blur; aproksimasi bezier padahal fungsi eksak ada.

## 6. Hemat token

- Satu chat per video; buka dengan ringkasan topik + gaya.
- Bangun library komponen sekali per proyek, scene hanya menyusun komponen.
- Review: lembar kontak scale 0.25 tiap 5 dtk, bukan still satu-satu; revisi dikumpulkan sekaligus.

## 7. Cek sebelum kirim

- [ ] Topik punya bukti permintaan (hasil pencarian) dan judul memuat kata yang orang ketik; `title.py` ≥ 90.
- [ ] Cold open kejadian nyata bersumber; tidak ada kutipan/nama/angka karangan.
- [ ] Rata-rata 6–8 dtk/panel; tiap panel punya info baru; tangga ukuran dipatuhi.
- [ ] Satu palet + satu aksen; label terbaca di HP; teks di dalam frame di awal dan akhir gerak kamera.
- [ ] Motion score ada; handoff, stagger, ease-in, kamera besar, parallax, motion blur sesuai bagian 5; nol frame mati.
- [ ] Suara user mentah, jeda halus, −14 LUFS, TP ≤ −1,5.
- [ ] Paket: judul, deskripsi (2 baris pertama = jawaban query), chapters valid (00:00, ≥3, ≥10 dtk), `.srt`, thumbnail 1280×720 (≤3 kata, tidak mengulang judul), 3 Shorts 9:16.
- [ ] Akhiri dengan pertanyaan: **ship it, or change it?**
