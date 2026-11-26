# Gaji 5 Juta Habis Tanggal 10, Ke Mana Perginya?

Video explainer long-form nazhak studio (1920×1080, 30 fps, 6:02), dibangun dengan kode di Remotion 4.
Gaya: kertas + set dinding/lantai, objek raksasa yang kepotong layar, partikel uang 3D-flip, ganti shot tiap 3–5 detik, tanpa subtitle.

## Isi folder

| Path | Isi |
|---|---|
| `render/gaji-5-juta-tanggal-10.mp4` | Hasil render final (dikompres CRF 25 agar < 100 MB) |
| `audio/raw/bab_1..9.aac` | Rekaman suara asli per bab |
| `public/vo.wav` | Suara gabungan (loudnorm -16 LUFS, jeda 0,7 dtk antar bab) |
| `public/img/` | 10 aset PNG transparan (tangan+HP, tangan mencubit, dompet, tas, gedung, uang, gelas kopi, tangan+uang tunai) |
| `public/fonts/`, `public/grain.png` | Font Inter + tekstur grain |
| `src/words.json` | Timing per kata (hasil `tools/align.py`) |
| `src/v2.tsx` | Sistem visual: `Pic`, `Shot`, `Room`, `Bills`, `Extrude`, `BigClock`, `FlipCal`, `Conveyor` + Bab 1 |
| `src/v3.tsx` | Bab 2–9 |
| `src/Main.tsx` | Latar, flip gelap, kamera beat, ambient, band transisi antar bab, audio |
| `src/lib.tsx`, `src/components.tsx` | Palet, `cue()`, easing, komponen SVG |
| `src/Scenes.tsx` | Daftar bab + `darkWindows()` (bab versi lama masih ada di file ini, tidak dipakai) |
| `tools/script.txt` | Naskah final per bab |
| `tools/align.py` | Alignment naskah → timing kata dari jeda di rekaman (tanpa model ASR) |
| `tools/stills.mjs`, `tools/grid.py` | Render frame uji di detik tertentu + gabung jadi grid |

## Pakai

```bash
npm install
# cek frame
node tools/stills.mjs 10 45 120 && python3 tools/grid.py out/grid.png 10 45 120
# render penuh (±50 menit di 2 core)
npx remotion render src/index.tsx Gaji out/final.mp4 --concurrency=2 --crf=20 --x264-preset=veryfast --audio-codec=aac
```

Tambah `--browser-executable=/usr/bin/google-chrome` kalau Chrome headless Remotion tidak bisa diunduh.

## Ulang alignment suara

```bash
cd tools
for i in 1 2 3 4 5 6 7 8 9; do ffmpeg -y -i ../audio/raw/bab_$i.aac -ac 1 -ar 48000 -af "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9" n$i.wav; done
python3 align.py   # menulis words.json, salin ke ../src/words.json
```

## Catatan

- Caption tidak dipakai; timing kata hanya untuk menyinkronkan animasi ke ucapan.
- `hand_cash.png` memuat gambar uang Rp100.000 asli.
- Belum ada musik/SFX.
