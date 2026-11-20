import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CALENDAR_SOURCES } from '../assets/data.js';

const siteCss = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
// shell.css menimpa token warna site.css, jadi dibaca lebih dulu.
const css = readFileSync(new URL('../assets/shell.css', import.meta.url), 'utf8') + '\n' + siteCss;
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(m, `token --${name} tidak ada di site.css`);
  return m[1];
};
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const atLeast = (fg, bg, label, min = 4.5) => assert.ok(ratio(fg, bg) >= min, `${label}: ${fg} di atas ${bg} = ${ratio(fg, bg).toFixed(2)} (< ${min})`);

test('token warna palet terang: putih lavender, biru tua, tanpa oranye lama', () => {
  assert.equal(token('bg').toUpperCase(), '#F4F3FA');
  assert.equal(token('ink').toUpperCase(), '#1E1654');
  assert.equal(token('lt-bg').toUpperCase(), '#FFFFFF');
  assert.equal(token('lt-ink').toUpperCase(), '#1E1654');
  assert.ok(!/FF4A00/i.test(css), 'oranye lama masih ada');
});

test('teks biru tua dan redup terbaca di atas latar dan permukaan', () => {
  for (const bg of [token('bg'), token('surface')]) {
    atLeast(token('ink'), bg, 'ink');
    atLeast(token('muted'), bg, 'muted');
  }
});

test('teks hitam dan redup terbaca di atas bagian putih', () => {
  for (const bg of [token('lt-bg'), token('lt-surface')]) {
    atLeast(token('lt-ink'), bg, 'lt-ink');
    atLeast(token('lt-muted'), bg, 'lt-muted');
  }
});

test('tombol utama biru tua berteks terang terbaca', () => {
  atLeast(token('bg'), token('ink'), 'tombol utama');
});

test('putih di atas tiap warna platform kalender', () => {
  for (const s of CALENDAR_SOURCES) atLeast('#FFFFFF', s.c, `sel ${s.n}`);
});

test('huruf: Figtree untuk isi dan judul, DM Serif Display miring untuk kata kunci, DM Mono untuk label', () => {
  assert.ok(/--font:\s*"Figtree"/.test(css), '--font Figtree');
  assert.ok(/--serif:\s*"DM Serif Display"/.test(css), '--serif DM Serif Display');
  assert.ok(/--mono:\s*"DM Mono"/.test(css), '--mono DM Mono');
  assert.ok(/h1, h2[^{]*\{[^}]*font-family:\s*var\(--font\)/.test(css), 'h1 dan h2 harus Figtree');
  assert.ok(/(^|\n)em[^{]*\{[^}]*font-family:\s*var\(--serif\)[^}]*font-style:\s*italic/.test(css), 'em harus serif miring');
  for (const f of ['family=Figtree', 'family=DM+Serif+Display', 'family=DM+Mono']) assert.ok(html.includes(f), `${f} tidak dimuat`);
  assert.ok(!/Anton|Space Mono|Fraunces/.test(css), 'huruf lama masih ada');
});

test('bentuk: jendela dashboard membulat, tanpa garis tebal', () => {
  const shell = readFileSync(new URL('../assets/shell.css', import.meta.url), 'utf8');
  const r = shell.match(/--r:\s*(\d+)px/);
  assert.ok(r && Number(r[1]) >= 16, 'kartu harus membulat (--r >= 16px di shell.css)');
  assert.ok(/\.frame\s*\{[^}]*border-radius/.test(shell), 'bingkai jendela tidak membulat');
  assert.ok(!/border(-width)?:\s*[^;]*\b[2-9]px/.test((css + shell).replace(/outline[^;]*;/g, '')), 'ada border >= 2px');
});
