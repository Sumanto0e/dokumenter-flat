---
name: explainer-motion-graphic
description: Bikin video explainer motion graphic (latar kertas, set dinding/lantai, objek raksasa, gerak fisik terus-menerus, tanpa subtitle) dari rekaman suara user + naskah, di Remotion. Pakai untuk explainer, video edukasi, atau motion graphic nazhak.
---

# Explainer Motion Graphic

Contoh hidup: `projects/gaji-5-juta-tanggal-10/` di repo ini (kode lengkap, aset, suara, render).
Referensi gaya: explainer Instagram (AI agents pilot, Google AI Overviews, Meta Muse Spark, Marvell). Ambil gaya geraknya, **jangan pernah pakai ungu**.

## Yang membuat gaya ini tidak terasa seperti PPT (wajib semua)
1. **Objek raksasa dan kepotong layar.** Jam setengah lingkaran di tepi kiri, gedung setinggi layar, HP sampai keluar bawah. Kamera dekat, bukan ikon kecil di tengah kanvas kosong.
2. **Set ruang.** Dinding kertas + lantai berwarna (garis horizon y≈860–940), berkas cahaya diagonal yang bergeser pelan, bayangan lembut.
3. **Shot baru tiap 3–5 detik**, tiap shot satu objek utama. Masuk/keluar dengan gerak kamera (`zoom`, geser kiri, naik, turun), bukan fade.
4. **Gerak fisik terus-menerus**: uang jatuh/menyembur dengan flip 3D (`scaleY = |cos|`), koin berputar, crane menurunkan gedung, halaman kalender dibalik, conveyor berjalan, jarum menyapu, tangan turun mengambil/menjatuhkan.
5. **Campuran aset foto PNG transparan + bentuk kode.** Aset foto hanya untuk objek yang sulit digambar (tangan, HP di tangan, dompet, tas, gedung, uang, gelas). Semua grafik, angka, kalender, jam, partikel, set, dan transisi lewat kode supaya tetap terasa "dibuat dengan coding".
6. **Tanpa subtitle** kecuali user minta. Angka penting muncul sebagai teks besar 3D (extrude) atau label/tag di dalam adegan.
7. Kamera global: beat di tiap awal kalimat (≥2,2 dtk), pindah target kecil (skala 1.00–1.07, geser ±40 px, rotasi ±1°) + drift pelan. Ambient: 6 bentuk tipis melayang (opacity ≤0,05).

## Palet default ("uang")
paper `#F4F2EC`, ink `#0D1F18`, deep `#0B3A2A`, deep2 `#14573F`, primary `#13804F`, mid `#3DB57E`, light `#A9DDBF`, pale `#DDF1E5`, amber `#F2B233`, red `#D64A3A`. Topik lain boleh ganti keluarga hue, tetap satu hue + ink.

## Pipeline
1. **Input**: rekaman per bab + naskah final yang sama persis. Tanya versi naskah kalau ragu.
2. **Audio**: ffmpeg mono 48k `highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=9`, gabung 0,5 dtk depan, 0,7 dtk antar bab, 1,5 dtk akhir.
3. **Timing kata** (`tools/align.py`): silencedetect dengan threshold adaptif, bagi waktu per suku kata (angka dieja), snap batas frasa ke jeda nyata. Dipakai hanya untuk sinkron animasi.
4. **Aset**: daftar ≤8 gambar. Jangan generate sendiri tanpa izin (kredit). Beri user prompt GPT per aset + kalimat gaya bersama, minta PNG transparan. Crop ke bbox, perkecil ke maks 1600 px. Ukur titik penting dengan numpy (area layar HP, titik jepit jari) lalu tempel overlay kode di sana. Gambar dengan latar kotak-kotak palsu: minta ulang versi transparan.
5. **Kode** (lihat proyek contoh): `Pic` (gambar terpusat), `Shot(a,b,inn,out,push)`, `Room`, `Bills(burst|rain|stream)`, `Extrude`, `BigClock`, `FlipCal(f 0..9)`, `Conveyor`, `Tag` (label harga berayun), `Stamp`, `PhoneScreen`. Semua animasi dipicu `cue(bab, kata, n)`; cue yang tidak ketemu harus melempar error.
6. **Kalender balik halaman**: pakai nilai kontinu `f`, halaman `n+1` diam lalu terlipat ke atas memperlihatkan `n+2`. Jangan pakai `t % 1` yang tidak sinkron dengan pergantian hari.
7. **Cek**: `tools/stills.mjs` (bundle sekali) di 12–22 titik, scale 0.5, gabung grid, lihat. Cek teks kepotong, teks keluar layar HP, objek bertabrakan, aset bermasalah (mis. simbol $ di koin foto → tutup/ganti dengan koin kode).
8. **Preview dulu**: render 30–40 dtk pertama, kirim, tunggu persetujuan. Baru render penuh (`--concurrency=2 --crf=20 --x264-preset=veryfast`, ±50 menit per 6 menit di 2 core). Tunggu di giliran yang sama; proses background mati setelah balasan selesai.
9. **Verifikasi**: durasi = audio, ada audio, beberapa frame acak dilihat.

## Jangan
- Ungu. Maskot/karakter kalau user tidak minta.
- Ikon kecil di tengah kanvas kosong, fade-in-diam-fade-out.
- Subtitle bawah gaya TV.
- Angka yang tidak ada di naskah/sumber.
