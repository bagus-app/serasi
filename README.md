# 🌌 Serasi — Undangan Pernikahan Digital Premium

Satu codebase, banyak pernikahan. Setiap klien = satu file JSON = satu link custom.

## Stack
Astro (static) · Three.js + GSAP (langit 3D) · TypeScript · CSS murni · Cloudflare Pages

## Mulai
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produksi → dist/
```

## Struktur penting
```
src/
├── content/weddings/      # SATU JSON PER KLIEN  ← semua konten di sini
├── content.config.ts      # skema Zod (penjaga gerbang data)
├── pages/[slug].astro     # route undangan (otomatis per klien)
├── pages/index.astro      # etalase produk
├── pages/404.astro        # halaman bintang hilang
├── three/                 # engine 3D netral-data
│   ├── sky.ts             # langit, kamera, bloom, adaptif FPS
│   ├── shapes.ts          # 21 rasi + font monogram A–Z
│   └── mapper.ts          # JSON → objek 3D
├── components/scenes/     # galeri, video, dress code
├── scripts/               # reveal, countdown, wishes
└── styles/                # tokens + base (sumber kebenaran UI)
```

## Menambah klien (3 langkah)
1. Salin `src/content/weddings/arka-laras.json` → `nama-klien.json`
2. Edit isi (lihat `PANDUAN-KONTEN.md`)
3. Deploy → link `domain.com/nama-klien` hidup

Personalisasi tamu: `domain.com/nama-klien?to=Nama+Tamu`

## Fitur
- Langit 3D sinematik: kamera scroll, 21 rasi + custom inline, monogram A–Z
- Bintang doa tamu (localStorage, namespaced per klien)
- 4 tema warna: champagne · rose · sage · aurora
- Tanda kasih + salin rekening · galeri arch · video facade · dress code
- RSVP & share via WhatsApp · countdown + fase bulan
- Mobile-first, reduced-motion, auto-degrade FPS, 404 bertema

## Deploy (Cloudflare Pages)
- Build command: `npm run build`
- Output directory: `dist`

## Dokumen
- `PANDUAN-KONTEN.md` — cara mengisi JSON klien (field, shape, tema, foto)