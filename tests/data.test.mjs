import test from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES, ITEMS, FAQ, PLATFORMS, KARYA, CALENDAR_SOURCES } from '../assets/data.js';

const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

test('lima layanan, urut: instagram, iklan, website, properti, otomasi', () => {
  assert.deepEqual(SERVICES.map((s) => s.id), ['instagram', 'iklan', 'website', 'properti', 'otomasi']);
});

test('harga paket sesuai keputusan (listing 4 platform Rp850.000 oleh pemilik)', () => {
  const expected = {
    'ig-mulai': 349000, 'ig-tumbuh': 699000, 'ig-pro': 1199000,
    'ads-meta': 349000, 'ads-meta-google': 599000,
    'web-landing': 299000, 'web-bisnis': 599000, 'web-toko': 899000,
    'prop-1': 229000, 'prop-4': 850000, 'prop-ig': 1099000,
    'prop-ical': 90000, 'prop-kelola': 249000,
    'ai-setup': 499000,
  };
  assert.deepEqual(Object.fromEntries(ITEMS.map((i) => [i.id, i.price])), expected);
});

test('paket Listing + Instagram = Listing 4 platform + Instagram Mulai dikurangi Rp100.000', () => {
  assert.equal(byId['prop-ig'].price, byId['prop-4'].price + byId['ig-mulai'].price - 100000);
});

test('jenis harga: bulanan untuk Instagram, iklan, kelola listing; website harga awal; sisanya sekali bayar', () => {
  for (const id of ['ig-mulai', 'ig-tumbuh', 'ig-pro', 'ads-meta', 'ads-meta-google', 'prop-kelola']) assert.equal(byId[id].kind, 'm', id);
  for (const id of ['web-landing', 'web-bisnis', 'web-toko']) assert.equal(byId[id].kind, 'w', id);
  for (const id of ['prop-1', 'prop-4', 'prop-ig', 'prop-ical', 'ai-setup']) assert.equal(byId[id].kind, 'o', id);
});

test('kelompok saling meniadakan: paket Instagram, dan Listing + Instagram menggantikan paket Instagram', () => {
  for (const id of ['ig-mulai', 'ig-tumbuh', 'ig-pro']) assert.ok(byId[id].groups.includes('ig'), id);
  assert.deepEqual([...byId['prop-ig'].groups].sort(), ['ig', 'listing']);
  assert.deepEqual(byId['prop-1'].groups, ['listing']);
  assert.deepEqual(byId['prop-4'].groups, ['listing']);
  assert.deepEqual(byId['prop-ical'].groups, []);
  assert.equal(byId['prop-ical'].addon, true);
  assert.equal(byId['prop-kelola'].addon, true);
});

test('isi paket Instagram menyebut jumlah Reels dan Carousel', () => {
  assert.equal(byId['ig-mulai'].features[0], '4 Reels dan 4 Carousel');
  assert.equal(byId['ig-tumbuh'].features[0], '8 Reels dan 8 Carousel');
  assert.equal(byId['ig-pro'].features[0], '12 Reels dan 12 Carousel');
  assert.ok(byId['prop-ig'].features.some((f) => f.includes('4 Reels dan 4 Carousel')));
});

test('data rapi: id unik, layanan ada, paket punya isi, teks ringkas', () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  const sid = new Set(SERVICES.map((s) => s.id));
  for (const i of ITEMS) {
    assert.ok(sid.has(i.service), `${i.id} layanan tidak dikenal`);
    assert.ok(i.name && i.unit, `${i.id} tanpa nama atau satuan`);
    assert.ok(i.features.length >= 3, `${i.id} isi kurang dari 3`);
    for (const f of i.features) assert.ok(f.length <= 70, `${i.id} fitur terlalu panjang: ${f}`);
  }
  for (const s of SERVICES) {
    assert.ok(s.gets.length >= 3 && s.gets.length <= 4, `${s.id} "kamu dapat" harus 3–4 butir`);
    for (const g of s.gets) assert.ok(g.length <= 60, `${s.id} butir terlalu panjang: ${g}`);
    assert.ok(s.lead.length <= 140, `${s.id} lead terlalu panjang`);
    assert.ok(s.nav && s.eyebrow && s.title && s.note);
    assert.ok(ITEMS.some((i) => i.service === s.id && !i.addon), `${s.id} tanpa paket utama`);
  }
});

test('judul tiap layanan memuat kata kunci pencarian', () => {
  const kw = { instagram: 'kelola Instagram', iklan: 'iklan Meta', website: 'pembuatan website', properti: 'listing Airbnb', otomasi: 'AI' };
  for (const s of SERVICES) assert.ok(s.title.toLowerCase().includes(kw[s.id].toLowerCase()), `${s.id}: "${s.title}" tanpa "${kw[s.id]}"`);
});

test('FAQ: 12 pertanyaan, tanpa sisa konsep lama', () => {
  assert.equal(FAQ.length, 12);
  for (const [q, a] of FAQ) {
    assert.ok(q.endsWith('?'), q);
    assert.ok(a.length > 20, q);
  }
  const all = JSON.stringify(FAQ);
  assert.ok(!/troli/i.test(all), 'masih menyebut troli');
  assert.ok(!/Rp8\.000|per caption|15–30|30–60/.test(all), 'masih memuat harga atau item lama');
});

test('platform, karya, dan sumber kalender tetap', () => {
  assert.equal(PLATFORMS.ok.length, 9);
  assert.deepEqual(PLATFORMS.no, ['Traveloka', 'Tiket.com', 'RedDoorz', 'Pegipegi']);
  assert.equal(KARYA.length, 5);
  assert.deepEqual(CALENDAR_SOURCES.map((s) => s.k), ['A', 'B', 'G', 'K']);
});

test('tiap paket punya label ringkas untuk pesan WhatsApp', () => {
  const labels = Object.fromEntries(ITEMS.map((i) => [i.id, i.label]));
  assert.deepEqual(labels, {
    'ig-mulai': 'Kelola Instagram Mulai', 'ig-tumbuh': 'Kelola Instagram Tumbuh', 'ig-pro': 'Kelola Instagram Pro',
    'ads-meta': 'Iklan Meta', 'ads-meta-google': 'Iklan Meta + Google',
    'web-landing': 'Website Landing Page', 'web-bisnis': 'Website Bisnis', 'web-toko': 'Website Toko Online',
    'prop-1': 'Listing 1 Platform OTA', 'prop-4': 'Listing 4 Platform OTA', 'prop-ig': 'Listing 4 Platform OTA + Instagram Mulai',
    'prop-ical': 'Add-on Kalender iCal', 'prop-kelola': 'Kelola Listing dan Harga',
    'ai-setup': 'Setup Otomasi Konten AI',
  });
});
