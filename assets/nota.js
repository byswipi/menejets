// Logika nota dan pesan WhatsApp. Fungsi murni, dipindahkan dari skrip harga situs lama.
import { SERVICES } from './data.js';

const WA = '628567876751';
const PACKAGE_CATEGORY = 'Paket Bulanan';
const PROPERTY_CATEGORIES = ['Listing Properti', 'Kalender OTA'];

export const GREETING = 'Halo Menej Ets, saya ingin konsultasi layanan digital.';

export const formatRupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

/** Mengembalikan troli baru. Paket Bulanan maksimal 1, satuan tidak pernah di bawah 0. */
export function setQty(cart, index, delta) {
  const before = cart[index] || 0;
  const isPackage = SERVICES[index][0] === PACKAGE_CATEGORY;
  const next = isPackage ? Math.min(1, Math.max(0, before + delta)) : Math.max(0, before + delta);
  const out = { ...cart };
  if (next) out[index] = next;
  else delete out[index];
  return out;
}

export function summarize(cart) {
  let one = 0, mo = 0, count = 0;
  const flags = { web: false, ads: false, ai: false, prop: false };
  const lines = [];
  for (const key of Object.keys(cart)) {
    const [category, name, price, kind, unit] = SERVICES[key];
    const qty = cart[key];
    const sub = price * qty;
    if (kind === 'm') mo += sub; else one += sub;
    count += qty;
    if (category === 'Website') flags.web = true;
    if (category === 'Iklan Digital') flags.ads = true;
    if (category === 'Otomasi AI') flags.ai = true;
    if (PROPERTY_CATEGORIES.includes(category)) flags.prop = true;
    lines.push(`- ${name} (${unit}): ${qty} × ${formatRupiah(price)} = ${formatRupiah(sub)}`);
  }
  return { one, mo, flags, count, lines };
}

export function buildMessage(cart) {
  const s = summarize(cart);
  if (!s.count) return GREETING;
  const notes = [
    s.flags.web && '(Website: harga awal, lingkup dikonfirmasi terlebih dahulu. Domain dan hosting dibayar terpisah)',
    s.flags.ads && '(Budget iklan dibayarkan langsung ke Meta atau Google, tidak termasuk biaya pengelolaan)',
    s.flags.ai && '(Otomasi AI: wajib memiliki akun Claude Pro aktif, langganan dibayar sendiri)',
    s.flags.prop && '(Properti: akun OTA milik kamu, komisi platform tidak termasuk. Sinkron kalender iCal tidak instan, bergantung jadwal tiap platform)',
    '(Biaya pihak ketiga tidak termasuk. Harga final dikonfirmasi melalui chat)',
  ].filter(Boolean).join('\n');
  const totals = [
    s.one ? 'Estimasi sekali bayar: ' + formatRupiah(s.one) : '',
    s.mo ? 'Estimasi per bulan: ' + formatRupiah(s.mo) : '',
  ].filter(Boolean).join('\n');
  return `Halo Menej Ets, saya ingin memesan layanan berikut:\n\n${s.lines.join('\n')}\n\n${totals}\n${notes}\n\nMohon informasi mengenai proses pemesanan. Terima kasih.`;
}

export const whatsappUrl = (message) => `https://wa.me/${WA}?text=` + encodeURIComponent(message);
