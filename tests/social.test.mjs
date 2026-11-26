import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('social/index.html', 'utf8');

test('Menej Social: aset dimuat dari /social/ dan file ada', () => {
  for (const p of ['app.css', 'app.js', 'scene.js', 'favicon.svg']) {
    assert.ok(html.includes(`/social/${p}`), `${p} harus dimuat dari /social/`);
    assert.ok(existsSync(`social/${p}`), `${p} hilang`);
  }
});

test('Menej Social: tiga halaman dan harga sama dengan situs utama', () => {
  for (const id of ['v-beranda', 'v-harga', 'v-kontak']) assert.ok(html.includes(`id="${id}"`));
  for (const p of ['349000', '699000', '1199000']) assert.ok(html.includes(`data-base="${p}"`));
  for (const p of ['value="349000"', 'value="599000"']) assert.ok(html.includes(p));
});

test('sitemap memuat /social', () => {
  assert.ok(readFileSync('sitemap.xml', 'utf8').includes('https://menej.site/social'));
});
