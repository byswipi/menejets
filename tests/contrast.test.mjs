import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CALENDAR_SOURCES } from '../assets/data.js';

const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
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
const atLeast = (fg, bg, label) => assert.ok(ratio(fg, bg) >= 4.5, `${label}: ${fg} di atas ${bg} = ${ratio(fg, bg).toFixed(2)} (< 4,5)`);

test('token warna sesuai spec', () => {
  assert.equal(token('bg').toUpperCase(), '#F6F6F3');
  assert.equal(token('ink').toUpperCase(), '#0E1714');
  assert.equal(token('accent').toUpperCase(), '#1F3B31');
  assert.equal(token('sage').toUpperCase(), '#9DB5A9');
});

test('teks tinta dan teks redup terbaca di atas latar dan permukaan', () => {
  for (const bg of [token('bg'), token('surface')]) {
    atLeast(token('ink'), bg, 'ink');
    atLeast(token('muted'), bg, 'muted');
    atLeast(token('accent'), bg, 'accent sebagai teks');
  }
});

test('putih di atas aksen dan di atas tiap warna platform kalender', () => {
  atLeast('#FFFFFF', token('accent'), 'tombol utama');
  for (const s of CALENDAR_SOURCES) atLeast('#FFFFFF', s.c, `sel ${s.n}`);
});

test('sage tidak pernah dipakai sebagai warna teks', () => {
  assert.ok(!/(^|[^-])color:\s*var\(--sage\)/.test(css), 'ada color: var(--sage)');
  assert.ok(!/(^|[^-])color:\s*#9DB5A9/i.test(css), 'ada color: #9DB5A9');
});

test('tidak ada garis tebal gaya stempel dan tidak ada Fraunces', () => {
  assert.ok(!/border(-width)?:\s*[^;]*\b[2-9]px/.test(css.replace(/outline[^;]*;/g, '')), 'ada border >= 2px');
  assert.ok(!/Fraunces/i.test(css));
});
