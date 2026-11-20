# Rombak UI/UX menejets.swipi.site (korporat editorial) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti seluruh tampilan situs dengan sistem desain korporat editorial berisi satu objek 3D (ponsel) di hero, tanpa mengubah harga, isi, nota WhatsApp, kalender iCal, atau `api/ical.js`.

**Architecture:** Situs statis tanpa build. Logika murni (data harga, nota, parser iCal, keputusan versi statis 3D) dipisah ke modul ES kecil yang diuji dengan `node --test`. `app.js` hanya menyambungkan modul ke DOM. three.js dimuat malas dari CDN hanya oleh `phone.js`.

**Tech Stack:** HTML, CSS, JavaScript ES modules, three.js 0.170.0 (jsdelivr), Node 20+ untuk `node --test`, Vercel (deploy otomatis dari Git).

**Spec:** `docs/superpowers/specs/2026-11-20-redesign-korporat-design.md` (di `/Users/abizar/Desktop/menej-ets/menej-ets-site/`). Pelaksana membaca spec dan rencana ini.

## Global Constraints

- Bahasa situs: Indonesia. WhatsApp `628567876751`, Instagram `@menejets`, email `menejets@gmail.com`.
- Tanpa langkah build. three.js hanya dari `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`, dimuat malas setelah halaman interaktif.
- Palet: latar `#F6F6F3`, tinta `#0E1714`, aksen `#1F3B31`, sage `#9DB5A9` hanya untuk isian non-teks. Tanpa kuning terang kecuali penanda status kecil kalender.
- Huruf: Instrument Sans untuk semuanya. Fraunces dibuang. Angka harga memakai `font-variant-numeric: tabular-nums`.
- Bentuk: sudut 8px, garis 1px, bayangan lembut berblur. Dilarang: garis tebal, bayangan offset keras, karakter atau ilustrasi kartun, pin atau peta dekoratif, scroll yang menahan pengguna (bagian setinggi ratusan vh).
- Kontras teks minimal 4,5:1. Fokus terlihat. Semua interaksi bisa lewat keyboard. Hormati `prefers-reduced-motion`.
- Harga, nama layanan, dan isi FAQ identik dengan `index.html` di commit `eda1e62` repo `byswipi/menejets`. Bar bukti hanya memakai klaim yang sudah ada: konsultasi pertama gratis, mulai dari satu layanan saja, pesan lewat WhatsApp, harga terbuka mulai Rp8.000 per caption.
- Berkas yang harus tetap ada dan tidak diubah: `og-image.png`, `robots.txt`, `sitemap.xml`, `v2.html`, `vercel.json`, `api/ical.js`.
- Kerja di cabang `redesign`. Dilarang menggabungkan ke `main` atau mendorong ke produksi tanpa persetujuan pemilik atas tautan pratinjau.
- Warna platform kalender tetap: Airbnb `#C93A55` (A), Booking.com `#1F5FA8` (B), Agoda `#6B3FB5` (G), Google Calendar `#1E7A4A` (K).

## Review Focus

1. Troli kosong: pesan WhatsApp harus jatuh ke kalimat sapaan biasa, bukan pesan pesanan kosong. (Task 2)
2. Paket Bulanan tidak boleh lebih dari 1 per item, dan item satuan tidak boleh negatif. (Task 2)
3. Berkas iCal tanpa `DTEND`, bernilai `DATE-TIME` dengan `TZID`, rentang melewati pergantian bulan, atau berisi teks sampah: tidak boleh melempar galat, dan tanggal di luar bulan ditampilkan diabaikan. (Task 3)
4. Semua tanggal sebulan terisi, atau tidak ada yang terisi: statistik dan legenda tetap benar. Tautan iCal gagal: pesan galat yang terbaca, bukan kalender kosong senyap. (Task 7)
5. WebGL gagal, konteks hilang, `saveData`, memori rendah, `prefers-reduced-motion`, atau JavaScript mati: hero tetap terbaca dan ponsel statis tampil. (Task 8)
6. Layar 320px: tidak ada scroll horizontal, teks tidak terpotong. Dialog Karya: fokus terkunci di dalam dialog dan `Escape` menutup lalu mengembalikan fokus. (Task 5, 9)

---

## Struktur berkas

Repo kerja: klon `byswipi/menejets` di `/Users/abizar/Desktop/menej-ets/menejets` (selanjutnya `REPO`), cabang `redesign`.

| Berkas | Tanggung jawab |
|---|---|
| `index.html` | Markup semua bagian, meta, JSON-LD, `noscript`, pemuatan `site.css` dan `app.js` |
| `assets/site.css` | Token desain, tata letak, komponen, keadaan fokus dan gerak |
| `assets/data.js` | Data murni: layanan, catatan kategori, isi paket, FAQ, platform, karya |
| `assets/nota.js` | Fungsi murni troli dan pesan WhatsApp |
| `assets/ical.js` | Pembaca iCal dan penggabung tanggal |
| `assets/phone.js` | Keputusan versi statis dan objek 3D ponsel |
| `assets/app.js` | Penyambung DOM: nav, harga, kalender, FAQ, dialog karya, chip WhatsApp |
| `tests/*.test.mjs` | Uji `node --test` untuk modul murni |
| `tests/contrast.test.mjs` | Uji rasio kontras token warna |

Menjalankan semua uji: `cd REPO && node --test tests/`.

---

### Task 1: Cabang, kerangka uji, dan data

**Files:**
- Create: `assets/data.js`, `tests/data.test.mjs`
- Modify: tidak ada (cabang dan klon saja)

**Interfaces:**
- Produces (`assets/data.js`, semua `export`):
  - `SERVICES: Array<[category: string, name: string, price: number, kind: 'u'|'m'|'o'|'w', unit: string, desc: string, pkgIndex?: number]>`
  - `CATEGORY_NOTES: Record<string, string>` (urutan kunci = urutan tab)
  - `PACKAGES: Array<{n:string, b?:1, tag?:string, pr:string, sv?:string, svn?:string, p:string, f:string[], x:string[]}>`
  - `FAQ: Array<[question: string, answer: string]>` (11 item)
  - `PLATFORMS: {ok: string[], no: string[]}`
  - `KARYA: Array<{name:string, kind:string, line:string, url:string}>` (5 item)
  - `CALENDAR_SOURCES: Array<{k:string, n:string, c:string}>`

- [ ] **Step 1: Klon dan buat cabang.** `git clone https://github.com/byswipi/menejets REPO && cd REPO && git checkout -b redesign`. Verifikasi: `git log --oneline -1` menampilkan `eda1e62`.
- [ ] **Step 2: Tulis uji paritas** `tests/data.test.mjs` yang membaca `git show eda1e62:index.html` (via `child_process.execFileSync`), mengekstrak literal array `S`, `NOTE`, `PK`, dan `FAQ` dengan regex lalu `new Function` pada potongan itu, dan menegaskan: `SERVICES` sama persis dengan `S` lama (panjang 29, tiap baris sama), kunci `CATEGORY_NOTES` urut sama dengan `Object.keys(NOTE)` lama, isi `PACKAGES` sama dengan `PK`, `FAQ.length === 11` dan tiap pasangan sama, `PLATFORMS.ok.length === 9`, `PLATFORMS.no` sama dengan `['Traveloka','Tiket.com','RedDoorz','Pegipegi']`, `KARYA.length === 5`.
- [ ] **Step 3: Jalankan, pastikan gagal** (`node --test tests/data.test.mjs`, galat modul tidak ada).
- [ ] **Step 4: Tulis `assets/data.js`** dengan menyalin nilai dari `index.html` lama apa adanya. `CALENDAR_SOURCES` memakai warna dan huruf dari Global Constraints. `KARYA` memakai nama, kategori, satu baris dan URL demo dari kartu lama (URL: `https://alva-hills.vercel.app`, `https://menej-cafe.vercel.app`, `https://menej-properti.vercel.app`, `https://menej-rent-truck.vercel.app`, `https://menej-rent-audio.vercel.app`).
- [ ] **Step 5: Jalankan, pastikan lulus.**
- [ ] **Step 6: Commit** `feat: data layanan dan FAQ dipisah ke modul dengan uji paritas`.

---

### Task 2: Logika nota dan pesan WhatsApp

**Files:**
- Create: `assets/nota.js`, `tests/nota.test.mjs`

**Interfaces:**
- Consumes: `SERVICES` dari `assets/data.js`.
- Produces:
  - `formatRupiah(n: number): string` → `Rp35.000`
  - `setQty(cart: Record<number,number>, index: number, delta: number): Record<number,number>` (tidak mengubah argumen; hasil baru)
  - `summarize(cart): {one:number, mo:number, flags:{web:boolean, ads:boolean, ai:boolean, prop:boolean}, count:number, lines:string[]}`
  - `buildMessage(cart): string`
  - `whatsappUrl(message: string): string` → `https://wa.me/628567876751?text=` + `encodeURIComponent(message)`
  - `GREETING = 'Halo Menej Ets, saya ingin konsultasi layanan digital.'`

- [ ] **Step 1: Tulis uji** (semua di `tests/nota.test.mjs`):
  - `formatRupiah(1049000) === 'Rp1.049.000'`.
  - `buildMessage({}) === GREETING` (Review Focus 1).
  - `setQty` pada item Paket Bulanan (cari indeksnya dengan `SERVICES.findIndex(s=>s[1]==='Starter')`) dengan delta +1 dua kali tetap 1 (Review Focus 2); delta −1 pada item bernilai 0 tetap tidak ada kuncinya.
  - Troli `{[idx('Video Reels 15–30 detik')]:2, [idx('Setup Iklan Meta')]:1}`: `summarize` menghasilkan `one === 169000`, `mo === 0`, `flags.ads === true`; `buildMessage` diawali `Halo Menej Ets, saya ingin memesan layanan berikut:`, memuat baris `- Video Reels 15–30 detik (per video): 2 × Rp35.000 = Rp70.000`, `Estimasi sekali bayar: Rp169.000`, dan catatan `(Budget iklan dibayarkan langsung ke Meta atau Google, tidak termasuk biaya pengelolaan)`.
  - Troli berisi item Kelola Instagram Dasar: `Estimasi per bulan: Rp199.000` dan tidak ada `Estimasi sekali bayar`.
  - Troli berisi `Listing 1 Platform OTA`: pesan memuat `(Properti: akun OTA milik kamu, komisi platform tidak termasuk. Sinkron kalender iCal tidak instan, bergantung jadwal tiap platform)`.
  - `whatsappUrl('a b')` berakhir `text=a%20b`.
- [ ] **Step 2: Jalankan, pastikan gagal.**
- [ ] **Step 3: Implementasikan modul** dengan memindahkan logika `calc()` dan `msg()` dari skrip "Menu harga, nota, dan pesan WhatsApp" di `index.html` lama menjadi fungsi murni berbasis argumen `cart`. Kategori "Listing Properti" dan "Kalender OTA" menyalakan `flags.prop`. Tipe `m` dijumlahkan ke `mo`, lainnya ke `one`.
- [ ] **Step 4: Jalankan, pastikan lulus. Step 5: Commit** `feat: logika nota dan pesan WhatsApp sebagai fungsi murni`.

---

### Task 3: Pembaca iCal

**Files:**
- Create: `assets/ical.js`, `tests/ical.test.mjs`

**Interfaces:**
- Produces:
  - `parseIcs(text: string): string[]` → daftar tanggal `YYYY-MM-DD` terisi (DTEND eksklusif; tanpa DTEND berarti 1 malam; nilai `DATE-TIME` diambil bagian tanggalnya; batas aman 3.700 tanggal; teks sampah → `[]`, tidak melempar).
  - `mergeDays(feeds: Array<{key:string, days:string[]}>, year:number, month:number /*0-11*/, enabled: Record<string,boolean>): {days: Record<number,string[]>, booked:number, conflicts:number, free:number}` (hanya tanggal di bulan itu; `days[d]` berisi `key` sumber aktif; konflik = lebih dari satu sumber).
  - `buildSampleIcs(year:number, month:number, ranges: Array<[number,number]>): string`

- [ ] **Step 1: Tulis uji:** DTEND eksklusif (`[3,6]` → 3,4,5); tanpa DTEND → satu hari; `DTSTART;TZID=Asia/Jakarta:20261114T140000` tetap terbaca 2026-11-14; rentang 28 Nov–3 Des hanya menghitung tanggal November pada `mergeDays(..., 2026, 10)`; teks `"bukan ical"` → `[]`; dua umpan overlap tanggal 14 → `conflicts === 1`; sumber dimatikan di `enabled` tidak dihitung; seluruh bulan terisi → `free === 0`; tidak ada umpan → `booked === 0 && free === jumlah hari`.
- [ ] **Step 2: Jalankan, gagal. Step 3: Implementasikan** memindahkan pembaca dari skrip kalender di `index.html` lama dan memperluasnya sesuai uji. **Step 4: Lulus. Step 5: Commit** `feat: pembaca iCal dan penggabung tanggal dengan uji`.

---

### Task 4: Sistem desain (token dan komponen dasar)

**Files:**
- Create: `assets/site.css`, `tests/contrast.test.mjs`

**Interfaces:**
- Produces (variabel CSS pada `:root`): `--bg:#F6F6F3`, `--ink:#0E1714`, `--accent:#1F3B31`, `--sage:#9DB5A9`, `--muted:#4A5A53`, `--line:#D9DDD9`, `--surface:#FFFFFF`, `--r:8px`, `--shadow:0 1px 2px rgba(14,23,20,.06),0 12px 32px -16px rgba(14,23,20,.18)`, skala spasi `--s1:4px … --s8:96px`, skala huruf `--t-sm:14px --t-md:16px --t-lg:20px --t-xl:clamp(28px,4vw,44px) --t-hero:clamp(34px,6vw,64px)`.
- Produces (kelas komponen): `.wrap`, `.section`, `.eyebrow`, `.btn`, `.btn--primary`, `.btn--ghost`, `.card`, `.chip`, `.nav`, `.visually-hidden`, `:focus-visible` (outline 2px `--accent`, offset 3px).

- [ ] **Step 1: Tulis `tests/contrast.test.mjs`** yang menghitung rasio kontras WCAG dari token dan menegaskan ≥ 4,5 untuk: `--ink` di atas `--bg` dan `--surface`; `--muted` di atas `--bg` dan `--surface`; putih di atas `--accent`; putih di atas tiap warna platform (4 warna Global Constraints). Tegaskan pula bahwa `--sage` TIDAK dipakai sebagai warna teks: pindai `site.css` dan gagalkan bila ada `color: var(--sage)`.
- [ ] **Step 2: Jalankan, gagal. Step 3: Tulis `site.css`** dengan token, reset, tipografi (Instrument Sans lewat Google Fonts di `index.html`), komponen dasar, blok `@media (prefers-reduced-motion: reduce)` yang mematikan transisi dan animasi, dan satu `@media (max-width:860px)` untuk tata letak ponsel. **Step 4: Lulus. Step 5: Commit** `feat: token dan komponen dasar sistem desain`.

---

### Task 5: Kerangka halaman dan bagian statis

**Files:**
- Create/replace: `index.html`, `assets/app.js` (bagian nav, FAQ, dialog karya, chip WhatsApp)
- Modify: `assets/site.css` (tata letak bagian)

**Interfaces:**
- Consumes: `FAQ`, `KARYA`, `PLATFORMS` dari `data.js`; `GREETING`, `whatsappUrl` dari `nota.js`.
- Produces (id DOM yang dipakai task berikutnya): `#hero`, `#phone-stage` (berisi `<canvas id="phone-canvas">` dan `<div class="phone-static">`), `#layanan`, `#properti`, `#cal-sources`, `#cal-board`, `#cal-stats`, `#cal-detail`, `#karya`, `#harga`, `#price-tabs`, `#price-list`, `#nota`, `#cara`, `#faq`, `#kontak`, `#wa-chip`.
- Produces: `app.js` mengekspor `initChrome(): void` (nav aktif, FAQ, dialog karya, chip).

- [ ] **Step 1:** Tulis `index.html` dengan urutan bagian dari spec: hero, bar bukti, Layanan (6 kartu kategori berisi ikon garis SVG + satu baris dari `TAG`, tiap kartu tautan ke `#harga` dengan `data-tab`), Properti (teks, tiga langkah, chip harga, panel platform dari `PLATFORMS`, wadah kalender), Karya (5 kartu teks dari `KARYA`), Harga (wadah), Cara pesan dan alasan (langkah 1–4 dan empat alasan, ketentuan layanan dari `noscript` lama), FAQ (akordeon `<details>` dari `FAQ`, dirender oleh `app.js` dan juga ditulis statis di `noscript`), CTA, footer. Pertahankan `<title>`, meta, Open Graph, JSON-LD dari versi lama; tambahkan `<link rel="modulepreload">` hanya untuk `assets/app.js`.
- [ ] **Step 2:** Implementasikan `initChrome`: tautan nav mendapat `aria-current="true"` lewat `IntersectionObserver` (rootMargin `-45% 0px -50% 0px`); dialog Karya memakai elemen `<dialog>` berisi iframe dan tombol "Tab baru", `showModal()` mengunci fokus, `Escape` menutup, fokus kembali ke kartu pembuka, `iframe.src` dikosongkan saat ditutup; chip WhatsApp (`#wa-chip`) selalu tampil dan tautannya diperbarui oleh Task 6.
- [ ] **Step 3: Verifikasi** dengan server lokal (lihat Task 9 Step 1): tidak ada galat konsol; Tab melewati nav, kartu, dan dialog dengan urutan wajar; dialog tertutup dengan `Escape` dan fokus kembali; layar 320px tanpa scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 4: Commit** `feat: kerangka halaman, nav, FAQ akordeon, dialog karya`.

---

### Task 6: Bagian Harga dan nota

**Files:**
- Modify: `assets/app.js` (ekspor `initPricing(): void`), `assets/site.css`, `index.html` (wadah sudah ada)

**Interfaces:**
- Consumes: `SERVICES`, `CATEGORY_NOTES`, `PACKAGES` dari `data.js`; `setQty`, `summarize`, `buildMessage`, `whatsappUrl`, `formatRupiah` dari `nota.js`.
- Produces: `initPricing()` mengisi `#price-tabs`, `#price-list`, `#nota`, memperbarui `href` dan lencana jumlah pada `#wa-chip`, dan mendengarkan klik `[data-tab]` dari seluruh halaman untuk berpindah tab lalu menggulir ke `#harga`.

- [ ] **Step 1:** Tab kategori sebagai `role="tablist"` dengan panah kiri/kanan; daftar layanan berupa kartu seragam (nama, harga tabular, satuan, deskripsi, rincian paket bulanan dalam `<details>`), tombol "Tambah" berubah menjadi pengatur jumlah (− n +) dengan `aria-label` memuat nama layanan; Paket Bulanan berupa tombol sakelar maksimal 1.
- [ ] **Step 2:** Nota: daftar item, total "Sekali bayar" dan "Per bulan" terpisah, catatan, tombol "Lanjut ke WhatsApp" ke `whatsappUrl(buildMessage(cart))`; troli kosong menampilkan teks "Belum ada layanan yang dipilih…" persis seperti situs lama. Area nota `aria-live="polite"`.
- [ ] **Step 3: Verifikasi di browser:** menambah "Video Reels 15–30 detik" dua kali memberi nota `Rp70.000` dan `#wa-chip` berlencana 2 dengan `href` memuat `Rp70.000` ter-encode; menambah Paket Starter dua kali tetap satu; semua 8 tab menampilkan jumlah kartu sama dengan jumlah layanan kategori itu di `SERVICES`.
- [ ] **Step 4: Commit** `feat: menu harga, nota, dan chip WhatsApp`.

---

### Task 7: Kalender iCal di bagian Properti

**Files:**
- Modify: `assets/app.js` (ekspor `initCalendar(): void`), `assets/site.css`

**Interfaces:**
- Consumes: `CALENDAR_SOURCES`, `PLATFORMS` dari `data.js`; `parseIcs`, `mergeDays`, `buildSampleIcs` dari `ical.js`.
- Produces: `initCalendar()` mengisi `#cal-sources`, `#cal-board`, `#cal-stats`, `#cal-detail`.

- [ ] **Step 1:** Kalender datar bulan berjalan (kisi 7 kolom, hari Senin pertama), umpan contoh dari `buildSampleIcs` dengan rentang `[3,6]`, `[12,15],[14,18]` (bentrok 14), `[20,23]`, `[28,30]`; chip sumber `aria-pressed` bisa dimatikan; sel terisi berwarna platform + huruf, sel bentrok bergaris merah + "!"; legenda; statistik "Malam tersedia / terisi / bentrok"; klik atau Enter pada tanggal mengisi `#cal-detail`; catatan "Contoh data. Sinkron iCal tidak instan…". Sel punya `aria-label` seperti situs lama.
- [ ] **Step 2:** Mode nyata opsional: bila ada `data-feeds` (daftar URL) pada `#cal-board`, ambil `/api/ical?u=…`, tampilkan keadaan memuat; bila `errors` tidak kosong atau permintaan gagal, tampilkan pesan "Tautan {host} belum bisa dibaca" di `#cal-detail` dan tetap render sumber yang berhasil (Review Focus 4).
- [ ] **Step 3: Verifikasi di browser:** statistik pada data contoh bulan berjalan `1` bentrok; mematikan sumber Booking.com membuat bentrok jadi `0`; Tab menjangkau sel dan Enter memilihnya.
- [ ] **Step 4: Commit** `feat: kalender iCal datar dengan legenda dan keadaan galat`.

---

### Task 8: Objek 3D ponsel, loader, dan versi statis

**Files:**
- Create: `assets/phone.js`, `tests/phone.test.mjs`
- Modify: `assets/app.js` (panggil `initPhone`), `assets/site.css`

**Interfaces:**
- Produces:
  - `shouldUseStatic(env: {search:string, saveData?:boolean, deviceMemory?:number, hardwareConcurrency?:number, reducedMotion:boolean}): boolean` — `true` bila `saveData`, atau `deviceMemory <= 2`, atau `hardwareConcurrency <= 2`, atau `reducedMotion`; selalu `false` bila `search` memuat `3d=1` (kecuali `reducedMotion`).
  - `initPhone(stage: HTMLElement, canvas: HTMLCanvasElement): Promise<'3d'|'static'>` — memuat three.js dengan `import()` dinamis setelah `requestIdleCallback` (cadangan `setTimeout 300`), menampilkan loader `.phone-loader` sampai bingkai pertama, lalu menambah kelas `is-ready` pada `stage`.

- [ ] **Step 1: Tulis `tests/phone.test.mjs`** untuk `shouldUseStatic`: `{saveData:true}` → true; `deviceMemory:2` → true; `deviceMemory:8, hardwareConcurrency:8` → false; `hardwareConcurrency:2` → true; `search:'?3d=1'` mengalahkan memori rendah; `reducedMotion:true` → true bahkan dengan `?3d=1` (Review Focus 5).
- [ ] **Step 2: Jalankan, gagal. Step 3: Implementasikan `shouldUseStatic`. Step 4: Lulus.**
- [ ] **Step 5: Implementasikan `initPhone`:** `WebGLRenderer` dengan `antialias` mati di layar < 760px dan `setPixelRatio(Math.min(devicePixelRatio, 2))` (1,25 di layar kecil); ponsel dari `RoundedBoxGeometry` sederhana (atau `ExtrudeGeometry` bila addon tidak dimuat) ditambah layar berbahan `CanvasTexture` yang menggambar grid feed (warna `--sage` dan `--ink`); rotasi pelan ± 14° dan sedikit mengikuti `pointermove` (hanya `hover:hover`); render berhenti saat di luar layar (`IntersectionObserver`) dan saat tab tersembunyi; `webglcontextlost` dan galat pembuatan renderer memicu `stage.classList.add('is-static')` dan hasil `'static'`. `.phone-static` adalah ponsel CSS dengan miring tetap dan selalu ada di DOM (tampil hanya bila `is-static`, atau sebelum `is-ready`).
- [ ] **Step 6: Verifikasi di browser:** `is-ready` muncul dalam ≤ 3 detik di desktop; tanpa WebGL (paksa dengan `?3d=0` yang membuat `initPhone` memilih statis atau dengan menimpa `getContext`) hero tetap terbaca dan `.phone-static` terlihat; teks hero tampil sebelum three.js terunduh (periksa lewat `performance.getEntriesByType('resource')` bahwa three.js baru diminta setelah `DOMContentLoaded`).
- [ ] **Step 7: Commit** `feat: ponsel 3D dengan loader dan versi statis`.

---

### Task 9: Verifikasi menyeluruh, pratinjau, dan serah terima

**Files:**
- Modify: berkas apa pun yang gagal verifikasi

- [ ] **Step 1: Server lokal.** Jalankan `preview_start` dengan konfigurasi `.claude/launch.json` yang menjalankan `python3 -m http.server` dari salinan di folder scratchpad (akses ke Desktop ditolak untuk proses server). Jika navigasi ke `localhost` ditolak, hentikan dan tanyakan pemilik; jangan memakai cara lain.
- [ ] **Step 2: Semua uji unit:** `node --test tests/` lulus.
- [ ] **Step 3: Pemeriksaan browser pada lebar 375, 768, dan 1280:** tidak ada galat konsol; `scrollWidth <= innerWidth`; tidak ada elemen dengan `border-width >= 2px` atau `box-shadow` tanpa blur (skrip penelusuran `getComputedStyle`); kontras lulus (Task 4); semua tombol punya nama aksesibel; tidak ada bagian setinggi lebih dari `150vh` kecuali daftar harga dan FAQ.
- [ ] **Step 4: Gerak dan tanpa JS:** dengan `prefers-reduced-motion` (emulasi), tidak ada animasi berjalan dan ponsel statis; dengan JavaScript mati (`noscript`), harga, FAQ, dan tautan WhatsApp tetap terbaca.
- [ ] **Step 5: Paritas isi:** skrip sekali pakai membandingkan semua angka `Rp…` di `index.html` baru dan `data.js` dengan versi lama; tidak ada harga hilang atau berubah.
- [ ] **Step 6: Dorong cabang `redesign`** (`git push -u origin redesign`), tunggu deployment pratinjau Vercel berstatus READY, laporkan tautannya (butuh login Vercel). **Dilarang** menggabungkan ke `main`.
- [ ] **Step 7: Serahkan** ke pemilik: tautan pratinjau, daftar hasil verifikasi (mana yang lulus, mana yang tidak diuji, misalnya perangkat nyata), dan pertanyaan persetujuan sebelum ke produksi.
