import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SERVICES, ITEMS, FAQ } from '../assets/data.js';
import { formatRupiah } from '../assets/nota.js';
import { render } from '../scripts/render-static.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ---------- SEO ----------
test('title 50–60 karakter dan memuat kata kunci utama', () => {
  const title = text(html.match(/<title>([^<]*)<\/title>/)[1]);
  assert.ok(title.length >= 50 && title.length <= 60, `panjang title ${title.length}: ${title}`);
  assert.ok(/Instagram/i.test(title) && /Website/i.test(title), title);
});

test('meta description 140–160 karakter, memuat kata kunci dan ajakan', () => {
  const d = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(d.length >= 140 && d.length <= 160, `panjang description ${d.length}: ${d}`);
  assert.ok(/Instagram/i.test(d) && /listing/i.test(d), d);
  assert.ok(/konsultasi/i.test(d), 'tanpa ajakan konsultasi');
});

test('canonical, Open Graph, dan og:image ada', () => {
  assert.ok(html.includes('<link rel="canonical" href="https://menej.site/">'));
  for (const p of ['og:title', 'og:description', 'og:image', 'og:type']) assert.ok(html.includes(`property="${p}"`), p);
  const ogTitle = html.match(/property="og:title" content="([^"]*)"/)[1];
  assert.ok(ogTitle.length <= 70, ogTitle);
});

test('tepat satu H1 yang memuat kata kunci', () => {
  const h1s = html.match(/<h1[\s>]/g) || [];
  assert.equal(h1s.length, 1);
  assert.ok(/Instagram/i.test(text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1])));
});

test('H2 tiap layanan sama dengan judul di data dan terhubung ke bagiannya', () => {
  for (const s of SERVICES) {
    const m = html.match(new RegExp(`<section[^>]*id="${s.id}"[^>]*aria-labelledby="h-${s.id}"`));
    assert.ok(m, `bagian #${s.id} tidak ada`);
    const h2 = html.match(new RegExp(`<h2 id="h-${s.id}">([\\s\\S]*?)</h2>`));
    assert.ok(h2, `h2 #h-${s.id} tidak ada`);
    assert.equal(text(h2[1]), s.title);
  }
});

test('JSON-LD valid: Organization dan FAQPage yang sama dengan FAQ yang tampil', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = blocks.find((b) => b['@type'] === 'FAQPage');
  assert.ok(blocks.some((b) => b['@type'] === 'Organization'));
  assert.ok(faq, 'FAQPage tidak ada');
  assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), FAQ);
});

// ---------- isi layanan ----------
test('tiap bagian layanan memuat lead, butir "kamu dapat", dan catatan dari data', () => {
  for (const s of SERVICES) {
    const sec = html.match(new RegExp(`<section[^>]*id="${s.id}"[\\s\\S]*?</section>`))[0];
    const t = text(sec);
    assert.ok(t.includes(s.lead), `${s.id}: lead tidak ada`);
    for (const g of s.gets) assert.ok(t.includes(g), `${s.id}: butir hilang: ${g}`);
    assert.ok(t.includes(s.note), `${s.id}: catatan hilang`);
  }
});

test('tiap paket punya kartu dengan harga, satuan, isi, dan tombol pilih sendiri', () => {
  for (const i of ITEMS) {
    const cards = html.match(new RegExp(`<article class="pkg[^"]*" data-item="${i.id}">[\\s\\S]*?</article>`, 'g')) || [];
    assert.equal(cards.length, 1, `${i.id}: harus ada tepat 1 kartu`);
    const t = text(cards[0]);
    assert.ok(t.includes(formatRupiah(i.price)), `${i.id}: harga tidak tampil`);
    assert.ok(t.includes(i.unit), `${i.id}: satuan tidak tampil`);
    for (const f of i.features) assert.ok(t.includes(f), `${i.id}: fitur hilang: ${f}`);
    assert.equal((cards[0].match(new RegExp(`data-pick="${i.id}"`, 'g')) || []).length, 1, `${i.id}: tombol pilih`);
  }
  const ids = [...html.matchAll(/data-pick="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, ITEMS.length, 'ada tombol pilih yang tidak punya paket');
});

test('FAQ statis di HTML memuat semua pertanyaan dan jawaban', () => {
  for (const [q, a] of FAQ) assert.ok(html.includes(`<summary>${esc(q)}</summary><p>${esc(a)}</p>`), `FAQ hilang: ${q}`);
});

test('bagian nota dan tautan nav menuju id yang ada', () => {
  assert.ok(/id="nota"/.test(html));
  const nav = html.match(/<nav class="nav__links"[\s\S]*?<\/nav>/)[0];
  for (const [, id] of nav.matchAll(/href="#([^"]+)"/g)) assert.ok(new RegExp(`id="${id}"`).test(html), `nav menuju #${id} yang tidak ada`);
  for (const s of SERVICES) assert.ok(nav.includes(`href="#${s.id}">${s.nav}<`), `nav tanpa ${s.nav}`);
});

test('tidak ada sisa konsep harga lama', () => {
  const t = text(html.replace(/<script[\s\S]*?<\/script>/g, ''));
  for (const bad of ['per caption', 'troli', 'Rp8.000', 'Video Reels 15', 'Paket Bulanan', 'Landing Page 3D']) assert.ok(!t.includes(bad), `masih ada: ${bad}`);
});

test('bagian statis selalu sinkron dengan data (jalankan: node scripts/render-static.mjs)', () => {
  assert.equal(render(html), html);
});

// ---------- gaya Zero One ----------
test('H1 dan tiap H2 layanan memuat kata kunci miring dalam <em>', () => {
  assert.ok(/<h1[^>]*>[\s\S]*<em>[^<]+<\/em>[\s\S]*<\/h1>/.test(html), 'H1 tanpa <em>');
  for (const s of SERVICES) {
    const h2 = html.match(new RegExp(`<h2 id="h-${s.id}">([\\s\\S]*?)</h2>`))[1];
    assert.ok(h2.includes(`<em>${esc(s.em)}</em>`), `${s.id}: <em>${s.em}</em> tidak ada di H2`);
  }
});

test('hero memuat garis motif (trace) yang disembunyikan dari pembaca layar', () => {
  assert.ok(/<div class="trace" aria-hidden="true">/.test(html));
});
