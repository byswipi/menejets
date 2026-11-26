import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('web/index.html', 'utf8');

test('Menej Web: aset dimuat dari /web/ dan file ada', () => {
  for (const p of ['app.css', 'app.js', 'scene.js', 'favicon.svg']) {
    assert.ok(html.includes(`/web/${p}`), `${p} harus dimuat dari /web/`);
    assert.ok(existsSync(`web/${p}`), `${p} hilang`);
  }
});

test('Menej Web: tiga halaman dan gambar karya ada', () => {
  for (const id of ['v-beranda', 'v-harga', 'v-kontak']) assert.ok(html.includes(`id="${id}"`));
  for (const m of html.matchAll(/src="\/(assets\/karya\/[^"]+)"/g)) assert.ok(existsSync(m[1]), `${m[1]} hilang`);
});

test('Menej Web: harga sama dengan situs utama', () => {
  for (const p of ['299000', '599000', '899000']) assert.ok(html.includes(`data-base="${p}"`));
});

test('sitemap memuat /web', () => {
  assert.ok(readFileSync('sitemap.xml', 'utf8').includes('https://menej.site/web'));
});
