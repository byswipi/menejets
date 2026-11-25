import test from 'node:test';
import assert from 'node:assert/strict';
import { GREETING, formatRupiah, toggleItem, summarize, buildMessage, whatsappUrl } from '../assets/nota.js';

const pick = (...ids) => ids.reduce((cart, id) => toggleItem(cart, id), {});

test('formatRupiah memakai titik ribuan dan awalan Rp', () => {
  assert.equal(formatRupiah(1199000), 'Rp1.199.000');
  assert.equal(formatRupiah(90000), 'Rp90.000');
});

test('troli kosong jatuh ke kalimat sapaan, bukan pesan pesanan kosong', () => {
  assert.equal(buildMessage({}), GREETING);
  assert.equal(GREETING, 'Halo MENEJ, saya ingin konsultasi layanan digital.');
});

test('toggleItem memilih lalu melepas paket, tanpa mengubah argumen', () => {
  const empty = {};
  const one = toggleItem(empty, 'ig-mulai');
  assert.deepEqual(one, { 'ig-mulai': 1 });
  assert.deepEqual(empty, {});
  assert.deepEqual(toggleItem(one, 'ig-mulai'), {});
});

test('id yang tidak dikenal diabaikan', () => {
  assert.deepEqual(toggleItem({ 'ig-pro': 1 }, 'tidak-ada'), { 'ig-pro': 1 });
});

test('paket dalam satu kelompok saling meniadakan', () => {
  assert.deepEqual(pick('ig-mulai', 'ig-pro'), { 'ig-pro': 1 });
  assert.deepEqual(pick('prop-1', 'prop-4'), { 'prop-4': 1 });
  assert.deepEqual(pick('web-landing', 'web-toko'), { 'web-toko': 1 });
});

test('Listing + Instagram menggantikan paket Instagram dan listing lain, dan sebaliknya', () => {
  assert.deepEqual(pick('ig-tumbuh', 'prop-4', 'prop-ig'), { 'prop-ig': 1 });
  assert.deepEqual(pick('prop-ig', 'ig-pro'), { 'ig-pro': 1 });
  assert.deepEqual(pick('prop-ig', 'prop-4'), { 'prop-4': 1 });
});

test('add-on berdiri sendiri dan tidak meniadakan paket lain', () => {
  assert.deepEqual(pick('prop-4', 'prop-ical', 'prop-kelola'), { 'prop-4': 1, 'prop-ical': 1, 'prop-kelola': 1 });
});

test('layanan berbeda boleh dipilih bersamaan', () => {
  assert.deepEqual(pick('ig-mulai', 'ads-meta', 'web-landing', 'ai-setup'), { 'ig-mulai': 1, 'ads-meta': 1, 'web-landing': 1, 'ai-setup': 1 });
});

test('summarize: total sekali bayar dan bulanan terpisah, bendera, baris rincian', () => {
  const s = summarize(pick('ig-tumbuh', 'web-landing'));
  assert.equal(s.mo, 699000);
  assert.equal(s.one, 299000);
  assert.equal(s.count, 2);
  assert.equal(s.flags.web, true);
  assert.equal(s.flags.ads, false);
  assert.ok(s.lines.includes('- Kelola Instagram Tumbuh (per bulan): Rp699.000'));
  assert.ok(s.lines.includes('- Website Landing Page (harga awal, sekali bayar): Rp299.000'));
});

test('bendera iklan, otomasi, dan properti menyala dari layanannya', () => {
  assert.equal(summarize(pick('ads-meta')).flags.ads, true);
  assert.equal(summarize(pick('ai-setup')).flags.ai, true);
  assert.equal(summarize(pick('prop-ical')).flags.prop, true);
  assert.equal(summarize(pick('prop-ig')).flags.prop, true);
});

test('buildMessage: sapaan, rincian, estimasi, penutup', () => {
  const m = buildMessage(pick('ig-tumbuh', 'ads-meta'));
  assert.ok(m.startsWith('Halo MENEJ, saya ingin memesan paket berikut:'));
  assert.ok(m.includes('- Kelola Instagram Tumbuh (per bulan): Rp699.000'));
  assert.ok(m.includes('- Iklan Meta (per bulan): Rp349.000'));
  assert.ok(m.includes('Estimasi per bulan: Rp1.048.000'));
  assert.ok(!m.includes('Estimasi sekali bayar'));
  assert.ok(m.includes('(Budget iklan dibayarkan langsung ke Meta atau Google, tidak termasuk biaya pengelolaan)'));
  assert.ok(m.includes('Mohon informasi mengenai proses pemesanan. Terima kasih.'));
});

test('buildMessage: paket sekali bayar tanpa baris per bulan, catatan properti dan website', () => {
  const m = buildMessage(pick('prop-4', 'prop-ical', 'web-bisnis'));
  assert.ok(m.includes('Estimasi sekali bayar: Rp1.539.000'));
  assert.ok(!m.includes('Estimasi per bulan'));
  assert.ok(m.includes('(Properti: akun OTA milik kamu, komisi platform tidak termasuk. Sinkron kalender iCal tidak instan, bergantung jadwal tiap platform)'));
  assert.ok(m.includes('(Website: harga awal, lingkup dikonfirmasi terlebih dahulu. Domain dan hosting dibayar terpisah)'));
});

test('whatsappUrl meng-encode pesan ke nomor MENEJ', () => {
  assert.equal(whatsappUrl('a b'), 'https://wa.me/628567876751?text=a%20b');
});
