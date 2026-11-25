// Logika nota dan pesan WhatsApp untuk konsep harga per paket. Fungsi murni.
import { ITEMS } from './data.js';

const WA = '628567876751';
export const GREETING = 'Halo MENEJ, saya ingin konsultasi layanan digital.';

const ITEM = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const formatRupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

/**
 * Memilih atau melepas satu paket. Memilih paket meniadakan paket lain yang sekelompok
 * (mis. Instagram Mulai dan Pro, atau Listing + Instagram dengan paket Instagram). Mengembalikan keranjang baru.
 */
export function toggleItem(cart, id) {
  const item = ITEM[id];
  if (!item) return cart;
  const next = { ...cart };
  if (next[id]) { delete next[id]; return next; }
  for (const other of Object.keys(next)) {
    if (ITEM[other].groups.some((g) => item.groups.includes(g))) delete next[other];
  }
  next[id] = 1;
  return next;
}

export function summarize(cart) {
  let one = 0, mo = 0;
  const flags = { web: false, ads: false, ai: false, prop: false };
  const lines = [];
  const serviceFlag = { website: 'web', iklan: 'ads', otomasi: 'ai', properti: 'prop' };
  for (const id of Object.keys(cart)) {
    const item = ITEM[id];
    if (item.kind === 'm') mo += item.price; else one += item.price;
    if (serviceFlag[item.service]) flags[serviceFlag[item.service]] = true;
    lines.push(`- ${item.label} (${item.unit}): ${formatRupiah(item.price)}`);
  }
  return { one, mo, flags, count: Object.keys(cart).length, lines };
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
  return `Halo MENEJ, saya ingin memesan paket berikut:\n\n${s.lines.join('\n')}\n\n${totals}\n${notes}\n\nMohon informasi mengenai proses pemesanan. Terima kasih.`;
}

export const whatsappUrl = (message) => `https://wa.me/${WA}?text=` + encodeURIComponent(message);
