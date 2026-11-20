# Rombak total UI/UX menejets.swipi.site: arah "Korporat editorial"

Tanggal: 2026-11-20. Status: menunggu persetujuan.

## Maksud dan alasan

Pemilik situs merasa tampilan sekarang "seperti main-main, tidak profesional untuk komersil, kurang rapi". Penyebabnya, menurut pengamatan kami: karakter troli dan stickman, pin peta, garis tebal 2px dengan bayangan keras ala stempel, ilustrasi kartun di tiap rak harga, dan satu file 1.200 baris yang menumpuk lima gaya 3D berbeda.

Tujuan: situs yang dibaca sebagai bisnis jasa yang serius oleh pemilik UMKM yang membukanya dari ponsel, lalu memesan lewat WhatsApp. Pemilik memilih arah A dari tiga contoh: terang, netral, tipografi tegas, grid disiplin, 3D hanya satu objek.

Skill acuan: `3d-web-experience`. Prinsipnya: 3D harus punya tujuan, ada loader, ada versi statis untuk perangkat lemah, dan seluruh pengalaman harus berjalan baik di ponsel.

## Tujuan

1. Tampilan yang konsisten dan rapi di semua bagian (satu sistem desain, satu skala spasi, satu skala huruf).
2. Satu objek 3D di hero: ponsel dengan feed Instagram, bergerak halus.
3. Semua isi tetap: layanan, harga, nota WhatsApp, kalender iCal, daftar platform, FAQ, demo karya.
4. Lebih ringan dan lebih cepat dibuka daripada sekarang, terutama di ponsel.
5. Aksesibel: kontras minimal 4,5:1, fokus terlihat, bisa dipakai dengan keyboard, hormat pada `prefers-reduced-motion`.

## Bukan tujuan

- Mengubah harga, nama layanan, atau isi FAQ (kecuali bila pemilik meminta).
- Mengubah demo klien (Alva Hills, Teduh Kopi, dst.) atau `v2.html`.
- Membangun backend baru. `api/ical.js` dipertahankan apa adanya.
- Pindah ke framework atau menambah langkah build.

## Anti-tujuan (dianggap gagal walau fungsinya jalan)

- Masih ada karakter kartun, ilustrasi bergaya mainan, atau pin dan peta dekoratif.
- Masih ada garis tebal gaya stempel atau bayangan keras (offset tanpa blur).
- Scroll yang "dibajak" (bagian setinggi ratusan vh yang menahan pengguna).
- 3D yang memperlambat halaman atau membuat ponsel panas.
- Konversi turun: tombol WhatsApp harus tetap terlihat dan mudah dijangkau.

## Batasan

- Hosting: Vercel, proyek `byswipi-menejets`, repo GitHub `byswipi/menejets`, cabang `main` = produksi, `vercel.json` memakai `cleanUrls` dan header cache `og-image.png`.
- Berkas yang harus tetap ada: `og-image.png`, `robots.txt`, `sitemap.xml`, `v2.html`, `api/ical.js`.
- Sumber situs sekarang: `index.html` pada commit `eda1e62` di repo itu.
- Bahasa: Indonesia. WhatsApp 628567876751, Instagram @menejets, email menejets@gmail.com.
- Tanpa langkah build. Boleh memuat three.js dari CDN yang sudah dipakai (jsdelivr, versi 0.170.0), dimuat malas.
- Deploy ke produksi hanya setelah pemilik menyetujui tautan pratinjau.

## Pendekatan yang dipertimbangkan

| Pendekatan | Ringkas | Kelemahan |
|---|---|---|
| 1. HTML + CSS + JS biasa tanpa build (dipilih) | `index.html`, `assets/site.css`, `assets/app.js`, `assets/phone.js` | Tidak ada komponen, tapi cukup untuk satu halaman |
| 2. Proyek Vite dengan komponen | Rapi untuk jangka panjang | Mengubah pipeline Vercel, lebih banyak risiko rusak |
| 3. React Three Fiber | Ekosistem 3D lengkap | Terlalu berat hanya untuk satu objek |

Dipilih pendekatan 1 karena deploy Vercel tidak berubah dan satu objek 3D tidak butuh kerangka kerja.

## Keputusan pemilik

- Arah visual: A, korporat editorial (terang, netral, tipografi tegas, grid disiplin, satu objek 3D).
- Cara membangun: pendekatan 1.

## Keputusan kami (bisa dikoreksi)

- **Struktur halaman:** hero, bar bukti, Layanan, Properti, Karya, Harga, Cara pesan dan ketentuan, FAQ, CTA, footer. Scroll biasa.
- **Warna:** latar putih tulang `#F6F6F3`, tinta `#0E1714`, satu aksen hijau tua `#1F3B31` dengan nada sage `#9DB5A9` untuk pengisi. Tidak ada kuning terang kecuali penanda status kecil (mis. tanggal terisi di kalender).
- **Huruf:** sans grotesk (Instrument Sans, sudah dipakai) untuk semuanya. Serif Fraunces dibuang. Angka harga memakai varian tabular.
- **Bentuk:** sudut 8px, garis 1px, bayangan lembut berblur. Tidak ada garis tebal.
- **Ikon:** ikon garis tipis seragam, bukan ilustrasi.
- **Menu harga:** tab kategori biasa, daftar kartu seragam, nota di samping (desktop) atau di bawah (ponsel). Lorong rak 3D dan troli dihapus.
- **FAQ:** akordeon. Peta kota dihapus.
- **Cara pesan dan Alasan:** langkah bernomor, bukan dunia 3D scroll.
- **Properti:** kalender iCal tampil datar dan bersih; tanggal terisi diberi warna platform plus huruf (tidak hanya warna). Panel platform yang bisa dan belum bisa iCal dipertahankan.
- **Objek 3D:** ponsel dibuat prosedural di three.js (kotak bersudut bulat, layar bertekstur kanvas yang menampilkan grid feed). Berputar pelan dan sedikit mengikuti kursor. Muncul setelah halaman interaktif.
- **Aturan 3D (skill):** loader terlihat sampai bingkai pertama; versi statis (ponsel CSS) untuk `saveData`, memori rendah, CPU 2 inti atau kurang, WebGL gagal, atau konteks hilang; berhenti merender saat di luar layar; batas DPR; hormat `prefers-reduced-motion`; bisa dipaksa dengan `?3d=1`.
- **Cabang dan pratinjau:** kerja di cabang `redesign`; Vercel membuat tautan pratinjau; produksi diganti hanya setelah persetujuan. Cara mundur: rollback deployment sebelumnya di Vercel.
- **SEO:** judul, meta, JSON-LD, og-image, sitemap dipertahankan (isi disesuaikan bila perlu).
- **Target performa (tujuan, bukan janji):** teks hero tampil tanpa menunggu three.js; JS awal kecil; three.js dimuat setelah idle.

## Fakta dari situs sekarang (hasil pemeriksaan pembangun)

- **Sumber isi:** `index.html` di `menej-ets-site/` identik byte-per-byte dengan `index.html` di repo `byswipi/menejets` pada commit `eda1e62`. Semua isi (harga, FAQ, JSON-LD, logika nota, data kalender contoh) ada di satu berkas itu. Tidak ada pelacak analitik atau piksel, jadi tidak ada yang perlu dibawa.
- **Data harga:** array `S` di skrip menu harga (kategori, nama, harga, tipe `u`/`m`/`o`/`w`, satuan, deskripsi), `NOTE`, `TAG`, dan `PK` (isi paket bulanan). Pindahkan apa adanya, jangan ubah angka.
- **Nota:** pembangun pesanan interaktif. Troli tersimpan di memori, jumlah per item, total sekali bayar dan per bulan terpisah, lalu pesan WhatsApp terisi otomatis dengan rincian dan catatan (website, iklan, otomasi AI, properti). Paket bulanan maksimal 1. Chip WhatsApp melayang selalu ada dan menampilkan jumlah item. Perilaku ini dipertahankan.
- **Kalender iCal:** `api/ical.js` menerima `GET /api/ical?u=<url>&u=<url>` (maks. 6), mengembalikan `{updated, dates:{"YYYY-MM-DD":["host"]}, errors:[{host,message}]}`. Halaman sekarang memakai 4 umpan iCal contoh yang dibuat di sisi klien dan diurai dengan pembaca iCal yang sama. Warna dan huruf platform tetap: Airbnb `#C93A55` (A), Booking.com `#1F5FA8` (B), Agoda `#6B3FB5` (G), Google Calendar `#1E7A4A` (K). Tanggal bentrok bertanda "!" dan garis merah. Legenda dan keadaan galat (tautan putus) harus ada.
- **Daftar platform:** bisa lewat iCal (Airbnb, Booking.com, Agoda, Vrbo, Expedia, Tripadvisor Rentals, Google Calendar, Outlook, Apple iCloud); belum bisa (Traveloka, Tiket.com, RedDoorz, Pegipegi).
- **Bar bukti:** hanya memakai klaim yang sudah ada di situs: konsultasi pertama gratis, mulai dari satu layanan saja, pesan lewat WhatsApp, harga terbuka mulai Rp8.000 per caption. Tidak boleh menambah angka klien, logo, atau testimoni.
- **Karya:** lima kartu (Alva Hills, Teduh Kopi, Rindang Residence, Lintas Nusa Trans, Rumble Audio Rental) yang membuka pratinjau demo dalam dialog berisi iframe dengan tombol "Tab baru". Kartu baru berbentuk teks: nama, kategori, satu baris deskripsi, tanpa gambar baru. Tautan demo tetap.
- **Alasan:** empat poin yang sudah ada (harga terbuka, satu tim satu kontak, AI untuk produksi tim untuk arah, bayar sesuai kebutuhan) menjadi bagian "Cara pesan dan alasan".
- **Pratinjau Vercel:** proyek terhubung ke Git dan SSO protection aktif untuk pratinjau, jadi tautan pratinjau cabang `redesign` hanya terbuka bila pemilik masuk ke Vercel.
- **Warna sage:** hanya untuk isian non-teks, supaya kontras 4,5:1 terpenuhi.
- **Perangkat acuan:** Safari iOS dan Chrome Android kelas menengah. Ambang versi statis seperti di atas.

## Diserahkan ke pembangun

- Ukuran, spasi, dan skala huruf pastinya.
- Cara menggambar layar ponsel di kanvas dan detail geometri.
- Urutan komponen di tiap bagian dan teks mikro (selama harga dan isi tidak berubah).
- Struktur CSS dan penamaan kelas.
- Pengujian visual di ponsel dan desktop.
