import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CALENDAR_SOURCES } from '../assets/data.js';

const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
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

test('token warna gaya brutal: putih, hitam, oranye', () => {
  assert.equal(token('bg').toUpperCase(), '#FFFFFF');
  assert.equal(token('ink').toUpperCase(), '#0A0A0A');
  assert.equal(token('accent').toUpperCase(), '#FF4A00');
});

test('teks tinta dan redup terbaca di atas latar terang dan permukaan', () => {
  for (const bg of [token('bg'), token('surface')]) {
    atLeast(token('ink'), bg, 'ink');
    atLeast(token('muted'), bg, 'muted');
  }
});

test('teks pada blok gelap terbaca: putih, redup, dan oranye', () => {
  for (const bg of [token('dk-bg'), token('dk-surface')]) {
    atLeast(token('dk-ink'), bg, 'dk-ink');
    atLeast(token('dk-muted'), bg, 'dk-muted');
    atLeast(token('accent'), bg, 'oranye sebagai teks di blok gelap');
  }
});

test('tombol utama: teks hitam di atas oranye (putih di atas oranye gagal kontras)', () => {
  atLeast(token('ink'), token('accent'), 'tombol utama');
  assert.ok(ratio('#FFFFFF', token('accent')) < 4.5, 'putih di atas oranye ternyata lolos, aturan tombol bisa dilonggarkan');
});

test('putih di atas tiap warna platform kalender', () => {
  for (const s of CALENDAR_SOURCES) atLeast('#FFFFFF', s.c, `sel ${s.n}`);
});

test('gaya brutal: sudut tajam, tanpa garis tebal, huruf display dan mono dimuat', () => {
  const r = css.match(/--r:\s*(\d+)px/);
  assert.ok(r && Number(r[1]) <= 4, 'sudut harus tajam (--r <= 4px)');
  assert.ok(!/border(-width)?:\s*[^;]*\b[2-9]px/.test(css.replace(/outline[^;]*;/g, '')), 'ada border >= 2px');
  assert.ok(/--display:\s*"Anton"/.test(css), 'huruf display Anton tidak diatur');
  assert.ok(/--mono:\s*"Space Mono"/.test(css), 'huruf mono Space Mono tidak diatur');
  assert.ok(/h1[^{]*\{[^}]*font-family:\s*var\(--display\)/.test(css), 'h1 tidak memakai huruf display');
  assert.ok(html.includes('family=Anton') && html.includes('family=Space+Mono'), 'Google Fonts Anton dan Space Mono tidak dimuat');
  assert.ok(!/Fraunces/i.test(css));
});
