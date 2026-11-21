// Data situs: layanan, paket, FAQ. Konsep harga per paket (bukan per butir).
// kind: m = per bulan, o = sekali bayar, w = harga awal website (lingkup dikonfirmasi lewat chat).
// groups: paket dalam satu kelompok saling meniadakan; addon = tambahan yang berdiri sendiri.

export const SERVICES = [
  {
    id: 'instagram', nav: 'Instagram', eyebrow: 'Kelola Instagram',
    title: 'Jasa kelola Instagram UMKM: Reels dan carousel rutin',
    em: 'Reels dan carousel rutin',
    lead: 'Akun Instagram usahamu tampil rutin tanpa kamu repot. Kami buat kontennya, jadwalkan, dan unggah.',
    gets: ['Reels dan carousel siap tayang', 'Caption, hashtag, dan jadwal posting', 'Kami yang mengunggah ke akunmu'],
    note: 'Konten dibuat dengan bantuan AI, arahan dan keputusan akhir tetap tim kami. Foto dan video produk dari kamu.',
  },
  {
    id: 'iklan', nav: 'Iklan', eyebrow: 'Iklan Digital',
    title: 'Jasa iklan Meta dan Google untuk UMKM',
    em: 'Meta dan Google',
    lead: 'Iklan Instagram, Facebook, dan pencarian Google disiapkan dan dikelola supaya usahamu ditemukan calon pembeli.',
    gets: ['Setup akun iklan dan target audiens', 'Iklan dikelola dan dioptimasi tiap bulan', 'Laporan hasil yang mudah dibaca'],
    note: 'Budget iklan dibayar langsung ke Meta atau Google. Tanpa jaminan hasil.',
  },
  {
    id: 'website', nav: 'Website', eyebrow: 'Website',
    title: 'Jasa pembuatan website UMKM yang siap dipakai jualan',
    em: 'siap dipakai jualan',
    lead: 'Dari satu halaman sampai toko online, rapi di ponsel dan terhubung ke WhatsApp.',
    gets: ['Tampilan rapi di ponsel dan laptop', 'Tombol WhatsApp dan form kontak', 'SEO dasar supaya mudah ditemukan'],
    note: 'Harga awal, lingkup dikonfirmasi lewat chat. Domain dan hosting dibayar terpisah.',
  },
  {
    id: 'properti', nav: 'Properti', eyebrow: 'Listing properti dan kalender OTA',
    title: 'Jasa listing Airbnb dan Booking.com, kalender satu pintu',
    em: 'kalender satu pintu',
    lead: 'Listing vila, kost, atau rumah sewa dirapikan di beberapa platform, kalendernya digabung di websitemu.',
    gets: ['Judul, deskripsi, foto, dan harga disusun rapi', 'Tampil di Airbnb, Booking.com, Agoda, Traveloka', 'Kalender iCal digabung di website (add-on)'],
    note: 'Akun OTA tetap milikmu. Komisi platform tidak termasuk. Tanpa jaminan okupansi. Sinkron iCal tidak instan.',
  },
  {
    id: 'otomasi', nav: 'Otomasi AI', eyebrow: 'Otomasi AI',
    title: 'Otomasi konten AI: ide, naskah, dan caption lebih cepat',
    em: 'lebih cepat',
    lead: 'Alur kerja AI disiapkan di akun Claude Pro milikmu, supaya kamu bisa membuat konten sendiri dengan cepat.',
    gets: ['Alur kerja AI siap pakai', 'Ide, naskah, dan caption dalam satu alur', 'Panduan singkat cara memakainya'],
    note: 'Wajib akun Claude Pro aktif, langganan dibayar sendiri. Biaya pihak ketiga terpisah.',
  },
];

export const ITEMS = [
  { id: 'ig-mulai', service: 'instagram', name: 'Mulai', label: 'Kelola Instagram Mulai', price: 349000, kind: 'm', unit: 'per bulan', groups: ['ig'],
    features: ['4 Reels dan 4 Carousel', 'Caption siap posting dan riset hashtag', 'Jadwal dan unggah', '1× revisi per bulan'] },
  { id: 'ig-tumbuh', service: 'instagram', name: 'Tumbuh', label: 'Kelola Instagram Tumbuh', price: 699000, kind: 'm', unit: 'per bulan', groups: ['ig'], badge: 'Paling seimbang',
    features: ['8 Reels dan 8 Carousel', 'Kalender konten bulanan', 'Penataan profil, caption, hashtag, jadwal, unggah', 'Evaluasi bulanan', '2× revisi per bulan'] },
  { id: 'ig-pro', service: 'instagram', name: 'Pro', label: 'Kelola Instagram Pro', price: 1199000, kind: 'm', unit: 'per bulan', groups: ['ig'],
    features: ['12 Reels dan 12 Carousel', 'Strategi dan kalender konten', 'Balas komentar dan DM', 'Laporan performa bulanan', '3× revisi per bulan'] },

  { id: 'ads-meta', service: 'iklan', name: 'Iklan Meta', label: 'Iklan Meta', price: 349000, kind: 'm', unit: 'per bulan', groups: ['ads'],
    features: ['Iklan Instagram dan Facebook', 'Setup awal sudah termasuk', 'Hingga 2 kampanye aktif', 'Laporan bulanan'] },
  { id: 'ads-meta-google', service: 'iklan', name: 'Meta + Google', label: 'Iklan Meta + Google', price: 599000, kind: 'm', unit: 'per bulan', groups: ['ads'], badge: 'Paling lengkap',
    features: ['Iklan Meta plus Google Ads pencarian', 'Setup awal sudah termasuk', 'Hingga 3 kampanye aktif', 'Optimasi mingguan dan laporan bulanan'] },

  { id: 'web-landing', service: 'website', name: 'Landing Page', label: 'Website Landing Page', price: 299000, kind: 'w', unit: 'harga awal, sekali bayar', groups: ['web'],
    features: ['1 halaman info usaha', 'Tombol WhatsApp', 'Rapi di ponsel', 'SEO dasar'] },
  { id: 'web-bisnis', service: 'website', name: 'Website Bisnis', label: 'Website Bisnis', price: 599000, kind: 'w', unit: 'harga awal, sekali bayar', groups: ['web'], badge: 'Paling seimbang',
    features: ['WordPress hingga 5 halaman', 'Form kontak dan tombol WhatsApp', 'Halaman layanan dan galeri', 'SEO dasar'] },
  { id: 'web-toko', service: 'website', name: 'Toko Online', label: 'Website Toko Online', price: 899000, kind: 'w', unit: 'harga awal, sekali bayar', groups: ['web'],
    features: ['WooCommerce: katalog, keranjang, checkout', 'Hingga 5 produk awal', 'Form kontak dan tombol WhatsApp', 'SEO dasar'] },

  { id: 'prop-1', service: 'properti', name: 'Listing 1 Platform', label: 'Listing 1 Platform OTA', price: 229000, kind: 'o', unit: 'per platform, sekali bayar', groups: ['listing'],
    features: ['1 properti di 1 platform pilihanmu', 'Judul, deskripsi, dan fasilitas', 'Urutan foto, harga, dan aturan menginap'] },
  { id: 'prop-4', service: 'properti', name: 'Listing 4 Platform', label: 'Listing 4 Platform OTA', price: 850000, kind: 'o', unit: 'sekali bayar', groups: ['listing'],
    features: ['1 properti di Airbnb, Booking.com, Agoda, Traveloka', 'Teks dan foto konsisten di semua platform', 'Harga dan aturan menginap disusun sama'] },
  { id: 'prop-ig', service: 'properti', name: 'Listing + Instagram', label: 'Listing 4 Platform OTA + Instagram Mulai', price: 1099000, kind: 'o', unit: 'sekali bayar', groups: ['listing', 'ig'], badge: 'Hemat Rp100.000',
    features: ['Listing 4 platform', '1 bulan Instagram Mulai: 4 Reels dan 4 Carousel', 'Caption, hashtag, jadwal, dan unggah'] },
  { id: 'prop-ical', service: 'properti', name: 'Add-on Kalender iCal', label: 'Add-on Kalender iCal', price: 90000, kind: 'o', unit: 'sekali bayar, fitur tambahan website', groups: [], addon: true,
    features: ['Gabungkan iCal dari semua platform yang punya iCal', 'Tanggal terisi otomatis tertutup di website', 'Untuk 1 properti, butuh website'] },
  { id: 'prop-kelola', service: 'properti', name: 'Kelola Listing dan Harga', label: 'Kelola Listing dan Harga', price: 249000, kind: 'm', unit: 'per bulan, per properti', groups: [], addon: true,
    features: ['Pembaruan harga musiman dan foto', 'Balasan ulasan dan cek kalender', 'Tanpa komunikasi tamu dan operasional'] },

  { id: 'ai-setup', service: 'otomasi', name: 'Setup Otomasi Konten AI', label: 'Setup Otomasi Konten AI', price: 499000, kind: 'o', unit: 'sekali bayar', groups: [],
    features: ['Alur kerja AI di akun Claude Pro milikmu', 'Ide, naskah, dan caption', 'Panduan singkat pemakaian'] },
];

export const FAQ = [
  ['Bisa pesan satu layanan saja?', 'Bisa. Tiap layanan dijual sebagai paket sendiri, jadi kamu boleh mulai dari satu saja dan menambah nanti.'],
  ['Bagaimana cara memesan?', 'Pilih paket di tiap layanan, nota terisi otomatis, lalu kirim lewat WhatsApp. Kalau masih ragu, boleh ngobrol dulu sebelum memesan.'],
  ['Apa saja isi paket Kelola Instagram?', 'Reels dan carousel sesuai paket, lengkap dengan caption, hashtag, jadwal, dan unggah. Paket Mulai 4 Reels dan 4 Carousel, Tumbuh 8 dan 8, Pro 12 dan 12 per bulan.'],
  ['Apakah konten dibuat oleh AI?', 'AI membantu mempercepat produksi. Arahan kreatif, pemilihan hasil, dan keputusan strategis tetap kami pegang.'],
  ['Apakah budget iklan sudah termasuk?', 'Belum. Budget iklan dibayar langsung ke Meta atau Google. Biaya dari kami untuk penyiapan dan pengelolaan iklan.'],
  ['Apakah website sudah termasuk domain dan hosting?', 'Belum. Domain, hosting, dan plugin berbayar dihitung terpisah, kecuali kita sepakati lain.'],
  ['Apa bedanya paket Listing + Instagram dengan membeli terpisah?', 'Paket ini menggabungkan Listing 4 platform dan paket Instagram Mulai dalam satu harga, hemat Rp100.000 dibanding membeli terpisah.'],
  ['Platform apa saja yang bisa dihubungkan ke kalender?', 'Yang menyediakan tautan iCal: Airbnb, Booking.com, Agoda, Vrbo, Expedia, Tripadvisor Rentals, Google Calendar, Outlook, dan Apple iCloud. Traveloka, Tiket.com, RedDoorz, dan Pegipegi belum, jadi kalendernya tidak bisa kami tarik lewat iCal. Ketersediaan iCal bisa berbeda per jenis akun, jadi kami cek dulu sebelum kamu membayar.'],
  ['Apakah kalender OTA langsung sinkron?', 'Belum langsung. Kalender digabung lewat tautan iCal, dan tiap platform memperbarui tautannya sendiri, kadang butuh beberapa jam. Karena itu bentrok tanggal tetap mungkin. Untuk usaha dengan banyak pesanan, kami sarankan channel manager.'],
  ['Apa itu Setup Otomasi AI?', 'Kami menyiapkan alur kerja AI di akun Claude Pro milikmu untuk ide, naskah, dan caption. Biayanya Rp499.000 sekali bayar. Akun Claude Pro harus aktif dan langganannya kamu bayar sendiri.'],
  ['Apakah memesan lewat nota berarti membayar?', 'Belum. Nota hanya merangkum pesananmu ke pesan WhatsApp. Harga akhir kami konfirmasi lewat chat sebelum kamu setuju.'],
  ['Apakah ada jaminan hasil?', 'Kami tidak menjamin penjualan, hasil iklan, atau okupansi. Yang kami pastikan, layanan dikerjakan sesuai isi paket yang disepakati.'],
];

export const PLATFORMS = {
  ok: ['Airbnb', 'Booking.com', 'Agoda', 'Vrbo', 'Expedia', 'Tripadvisor Rentals', 'Google Calendar', 'Outlook', 'Apple iCloud'],
  no: ['Traveloka', 'Tiket.com', 'RedDoorz', 'Pegipegi'],
};

export const KARYA = [
  { name: 'Alva Hills', kind: 'Vila keluarga', line: 'Dau, Malang. Vila keluarga dekat Batu, dengan cek tanggal.', url: 'https://alva-hills.vercel.app', img: 'assets/karya/alva-hills.jpg', alt: 'Cuplikan situs Alva Hills: vila keluarga di Malang dengan tombol cek tanggal.' },
  { name: 'Teduh Kopi', kind: 'Kedai kopi', line: 'Bandung. Secangkir tenang, dari biji ke meja.', url: 'https://menej-cafe.vercel.app', img: 'assets/karya/teduh-kopi.jpg', alt: 'Cuplikan situs Teduh Kopi: kedai kopi dengan dunia 3D isometrik berwarna hangat.' },
  { name: 'Rindang Residence', kind: 'Properti', line: 'Bogor. Pulang ke rumah yang asri, dengan booking survei.', url: 'https://menej-properti.vercel.app', img: 'assets/karya/rindang-residence.jpg', alt: 'Cuplikan situs Rindang Residence: perumahan dengan peta 3D rumah dan taman.' },
  { name: 'Lintas Nusa Trans', kind: 'Logistik', line: 'Barang aman, sampai tepat waktu.', url: 'https://menej-rent-truck.vercel.app', img: 'assets/karya/lintas-nusa-trans.jpg', alt: 'Cuplikan situs Lintas Nusa Trans: jasa trucking dengan jalan dan gudang 3D.' },
  { name: 'Rumble Audio Rental', kind: 'Sewa alat', line: 'Sound system yang bikin pesta hidup.', url: 'https://menej-rent-audio.vercel.app', img: 'assets/karya/rumble-audio-rental.jpg', alt: 'Cuplikan situs Rumble Audio Rental: sewa sound system dengan panggung dan lampu 3D.' },
  { name: 'Bintang Florist Express', kind: 'Toko bunga', line: 'Surabaya dan Jakarta. Papan bunga yang tepat, tiba tepat waktu.', url: 'https://bintang-florist-express-home.vercel.app', img: 'assets/karya/bintang-florist-express.jpg', alt: 'Ilustrasi situs Bintang Florist Express: papan bunga dengan tombol pesan dan estimasi kirim 3 jam.' },
];

export const CALENDAR_SOURCES = [
  { k: 'A', n: 'Airbnb', c: '#C93A55' },
  { k: 'B', n: 'Booking.com', c: '#1F5FA8' },
  { k: 'G', n: 'Agoda', c: '#6B3FB5' },
  { k: 'K', n: 'Google Calendar', c: '#1E7A4A' },
];
