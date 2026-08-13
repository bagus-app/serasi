# PANDUAN KONTEN — Langit yang Sama

Satu file JSON = satu pernikahan = satu link.
Tanpa menyentuh kode apa pun.

## Lokasi file
src/content/weddings/<slug>.json

## Menambah klien baru (3 langkah)
1. Salin `arka-laras.json` → ganti nama jadi `nama-klien.json`
2. Ubah isinya sesuai panduan di bawah
3. Simpan → link `domain.com/nama-klien` hidup otomatis

Klien TIDAK tampil di halaman depan (privasi).
Bagikan link langsung, atau link personal: `domain.com/nama-klien?to=Nama+Tamu`

---

## PANDUAN PER FIELD

### slug
Alamat URL. Huruf kecil, angka, tanda `-`. Contoh: "putri-adit".

### couple
- nick  : [nama panggilan dia, nama panggilan dia] — tampil besar di pembuka
- full  : nama lengkap keduanya — untuk SEO/OG
- monogram : format "X · Y" — tampil di dial & footer.
  CATATAN V1: rasi penutup menggambar huruf dengan optimal untuk A dan L;
  huruf lain memakai bentuk terdekat (alfabet penuh = roadmap).

### tagline
Satu kalimat puitis di bawah nama. Maks ~60 karakter agar elegan.

### date
- iso     : "2026-06-20T08:00:00+07:00"  ← WAJIB sertakan zona waktu
- display : "20 Juni 2026"               ← tampil di halaman
- day     : "Sabtu"                      ← tampil di dial

### venue
- name    : nama gedung
- address : alamat lengkap (dipakai juga untuk tautan kalender)
- maps    : link Google Maps lengkap, contoh:
            "https://maps.google.com/?q=Nama+Gedung+Kota"

### events (1–3 acara)
- name  : "Akad Nikah" / "Resepsi" / "Ngunduh Mantu"
- time  : teks tampilan, contoh "08.00 – 10.00 WIB"
- start : ISO mulai  ← untuk tombol "Simpan Tanggal"
- end   : ISO selesai

### memories — shape

PRESET (21): book, letter, ring, gate,
heart, umbrella, coffee, music, plane, mountain, boat, key, moon,
star5, infinity, tulip,
crux, orion, cassiopeia, lyra, big-dipper.

CUSTOM (paket Sultan) — gambar rasi sendiri:
"shape": { "points": [[0,1.5],[−1,−1],[1,−1]], "edges": [[0,1],[1,2],[2,0]] }
Aturan custom: koordinat disarankan dalam rentang [−2, 2];
edges merujuk index points; edge yang tidak valid dilewati otomatis (aman).

### gifts (0–n rekening) — tampil di seksi "Tanda Kasih" (Step B)
- bank   : "BCA" / "Mandiri" / "Dana"
- number : tulis SEPERTI ingin ditampilkan, spasi boleh: "1234 5678 90"
- holder : nama pemilik rekening
Boleh lebih dari satu; tombol salin disediakan otomatis.
Contoh dua rekening:
"gifts": [
  { "bank": "BCA",    "number": "1234 5678 90", "holder": "Arka Pradipta" },
  { "bank": "Mandiri","number": "9876 5432 10", "holder": "Laras Ayudia" }
]

### contact.whatsapp
Format internasional TANPA +, spasi, atau strip: "62812xxxxxxx".
Dipakai tombol "Hadir" & "Doa dari Jauh".

### share (opsional)
- title / text : teks tombol bagikan & preview. Dipakai penuh mulai Fase 6.

---

## FIELD YANG BELUM AKTIF (roadmap, jangan diisi dulu)
- theme    : preset warna ("champagne" | "rose" | "sage" | "aurora") → Step B
- gallery  : daftar foto → Step C
- video    : { "youtubeId": "xxxx" } → Step C
- dresscode: teks dress code → Step C

## Kesalahan yang langsung ditolak skema (build error = ketahuan sebelum tayang)
- memories lebih dari 6 atau kurang dari 1
- shape di luar daftar
- maps bukan URL
- field wajib hilang

## Aturan emas
1. Tanggal selalu berzona waktu (+07:00 dst).
2. Text kenangan max 2–3 kalimat — langit yang bercerita, bukan paragraf.
3. Satu klien = satu file. Jangan edit file klien lain.