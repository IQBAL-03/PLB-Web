# SISPERPUS - Sistem Informasi Perpustakaan Sekolah

Sistem informasi dan katalog perpustakaan sekolah digital berbasis web yang dirancang untuk mempermudah siswa, guru, dan pustakawan dalam menjelajahi koleksi buku, mencari referensi akademik, serta melakukan peminjaman buku mandiri.

Proyek ini dibangun dengan arsitektur frontend modular berbasis JavaScript ES Modules dan framework styling Tailwind CSS v4.

---

## Fitur Utama

- **Katalog Buku & Filter Interaktif:** Menampilkan koleksi buku sekolah berdasarkan kategori (Fiksi dan Sastra, Sains dan Teknologi, Sejarah dan Biografi, Pengembangan Diri, Buku Referensi).
- **Pencarian Cepat:** Pencarian instan berdasarkan judul buku, nama pengarang, maupun topik dengan pintasan keyboard `/`.
- **Buku Sorotan Pekan Ini:** Informasi buku pilihan mingguan lengkap dengan sinopsis, nomor rak fisik, dan ulasan pembaca.
- **Peminjaman Mandiri:** Formulir peminjaman buku berbasis Nomor Induk Siswa (NIS) tanpa antre dengan batasan durasi 7 hari kerja.
- **Pengadaan Baru (Segera Hadir):** Informasi buku yang sedang dalam proses pengadaan dan katalogisasi oleh perpustakaan.
- **Tampilan Responsif:** Antarmuka mobile-first yang dioptimalkan untuk perangkat ponsel pintar, tablet, maupun layar desktop.

---

## Struktur Direktori

Arsitektur kode diorganisasi berdasarkan domain fitur (*feature-driven*) tanpa berkas monolitik:

```text
.
├── index.html                           # Halaman utama aplikasi perpustakaan
├── package.json                         # Konfigurasi dependensi dan skrip build
├── vercel.json                          # Konfigurasi perutean dan header deployment
├── src/
│   └── input.css                        # Berkas input Tailwind CSS dan tema visual
├── css/
│   └── tailwind.css                     # Berkas CSS terkompilasi siap saji
└── js/
    ├── main.js                          # Titik masuk utama aplikasi (bootstrap)
    ├── core/
    │   ├── events.js                    # Event bus untuk komunikasi antar modul
    │   └── state.js                     # Pengelola status filter dan peminjaman
    ├── data/
    │   └── library-data.js              # Basis data koleksi buku perpustakaan
    ├── utils/
    │   ├── dom.js                       # Utilitas manipulasi DOM dan sanitasi
    │   └── toast.js                     # Sistem notifikasi interaktif
    └── features/
        ├── navigation/
        │   └── navigation.js            # Kontrol navigasi dan menu drawer mobile
        ├── spotlight/
        │   └── spotlight.view.js        # Komponen tampilan buku sorotan utama
        ├── catalog/
        │   ├── catalog.view.js          # Render grid kartu buku dan chip filter
        │   └── catalog.controller.js    # Logika pencarian dan pemilihan kategori
        └── modal/
            ├── book-modal.view.js       # Tampilan detail buku dan form pinjam
            └── book-modal.controller.js # Pengendali aksi konfirmasi peminjaman
```

---

## Persyaratan Sistem

- Node.js versi 18.x atau lebih baru
- npm versi 9.x atau lebih baru

---

## Panduan Instalasi dan Pengembangan Lokal

1. **Pasang Dependensi:**
   ```bash
   npm install
   ```

2. **Kompilasi Styling (Mode Pengembangan):**
   Jalankan watcher untuk memperbarui CSS secara otomatis saat berkas HTML atau JS diubah:
   ```bash
   npm run dev
   ```

3. **Kompilasi Styling Produksi (Minified):**
   ```bash
   npm run build
   ```

4. **Menjalankan Web:**
   Buka berkas `index.html` langsung di peramban web atau gunakan ekstensi web server lokal seperti Live Server.

---

## Deployment ke Vercel

Aplikasi ini dapat langsung di-deploy ke Vercel sebagai static web application:

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `.` (root direktori)

Kompilasi CSS akan dijalankan secara otomatis oleh Vercel pada tahapan build sebelum situs dipublikasikan.

---

## Tata Tertib dan Ketentuan Perpustakaan

- Siswa wajib menggunakan Nomor Induk Siswa (NIS) yang valid saat meminjam buku.
- Batas maksimal peminjaman adalah 2 buku per siswa selama 7 hari kerja.
- Perpanjangan masa peminjaman dapat dikoordinasikan langsung ke petugas pustakawan di Gedung Literasi Lantai 2.
