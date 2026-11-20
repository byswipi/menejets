import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES } from '../assets/data.js';
import { GREETING, formatRupiah, setQty, summarize, buildMessage, whatsappUrl } from '../assets/nota.js';

const idx = (name) => {
  const i = SERVICES.findIndex((s) => s[1] === name);
  assert.ok(i >= 0, `layanan tidak ada: ${name}`);
  return i;
};

test('formatRupiah memakai titik ribuan dan awalan Rp', () => {
  assert.equal(formatRupiah(1049000), 'Rp1.049.000');
  assert.equal(formatRupiah(8000), 'Rp8.000');
});

test('troli kosong jatuh ke kalimat sapaan, bukan pesan pesanan kosong', () => {
  assert.equal(buildMessage({}), GREETING);
  assert.equal(GREETING, 'Halo Menej Ets, saya ingin konsultasi layanan digital.');
});

test('Paket Bulanan maksimal 1, satuan tidak pernah negatif, argumen tidak diubah', () => {
  const s = idx('Starter');
  const once = setQty({}, s, 1);
  const twice = setQty(once, s, 1);
  assert.deepEqual(twice, { [s]: 1 });
  assert.deepEqual(once, { [s]: 1 }, 'argumen asli tidak boleh berubah');
  const r = idx('Video Reels 15–30 detik');
  assert.deepEqual(setQty({}, r, -1), {}, 'dikurangi dari kosong tetap kosong');
  assert.deepEqual(setQty({ [r]: 1 }, r, -1), {}, 'jumlah 0 menghapus kuncinya');
  assert.deepEqual(setQty({ [r]: 2 }, r, 1), { [r]: 3 });
});

test('summarize: total sekali bayar, bendera iklan, dan baris rincian', () => {
  const cart = { [idx('Video Reels 15–30 detik')]: 2, [idx('Setup Iklan Meta')]: 1 };
  const s = summarize(cart);
  assert.equal(s.one, 169000);
  assert.equal(s.mo, 0);
  assert.equal(s.count, 3);
  assert.equal(s.flags.ads, true);
  assert.equal(s.flags.web, false);
  assert.ok(s.lines.includes('- Video Reels 15–30 detik (per video): 2 × Rp35.000 = Rp70.000'));
});

test('buildMessage: sapaan, rincian, estimasi, dan catatan iklan', () => {
  const cart = { [idx('Video Reels 15–30 detik')]: 2, [idx('Setup Iklan Meta')]: 1 };
  const m = buildMessage(cart);
  assert.ok(m.startsWith('Halo Menej Ets, saya ingin memesan layanan berikut:'));
  assert.ok(m.includes('- Video Reels 15–30 detik (per video): 2 × Rp35.000 = Rp70.000'));
  assert.ok(m.includes('Estimasi sekali bayar: Rp169.000'));
  assert.ok(m.includes('(Budget iklan dibayarkan langsung ke Meta atau Google, tidak termasuk biaya pengelolaan)'));
  assert.ok(m.includes('Mohon informasi mengenai proses pemesanan. Terima kasih.'));
});

test('layanan bulanan dihitung per bulan, bukan sekali bayar', () => {
  const m = buildMessage({ [idx('Kelola Instagram Dasar')]: 1 });
  assert.ok(m.includes('Estimasi per bulan: Rp199.000'));
  assert.ok(!m.includes('Estimasi sekali bayar'));
});

test('layanan properti menambah catatan akun OTA dan iCal tidak instan', () => {
  const m = buildMessage({ [idx('Listing 1 Platform OTA')]: 1 });
  assert.ok(m.includes('(Properti: akun OTA milik kamu, komisi platform tidak termasuk. Sinkron kalender iCal tidak instan, bergantung jadwal tiap platform)'));
  assert.equal(summarize({ [idx('Add-on Kalender iCal')]: 1 }).flags.prop, true);
});

test('whatsappUrl meng-encode pesan ke nomor Menej Ets', () => {
  assert.equal(whatsappUrl('a b'), 'https://wa.me/628567876751?text=a%20b');
});
