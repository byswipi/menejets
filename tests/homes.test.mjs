import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('homes/index.html', 'utf8');
const js = readFileSync('homes/app.js', 'utf8');

test('Menej Homes: aset dimuat dari /homes/, tidak bentrok dengan situs utama', () => {
  for (const p of ['app.css', 'app.js', 'scene.js', 'favicon.svg']) {
    assert.ok(html.includes(`/homes/${p}`), `${p} harus dimuat dari /homes/`);
    assert.ok(existsSync(`homes/${p}`), `${p} hilang`);
  }
  assert.ok(!/(?:src|href)="\/(?:app\.css|app\.js|scene\.js|favicon\.svg)"/.test(html));
});

test('Menej Homes: semua logo yang dirujuk ada', () => {
  assert.ok(!js.includes('"/logos/'), 'jalur /logos/ lama masih ada');
  for (const f of ['agoda', 'airbnb', 'booking', 'instagram', 'threads-w', 'tiket', 'tiktok-go', 'tiktok-w', 'tiktok', 'traveloka', 'trip']) {
    assert.ok(existsSync(`homes/logos/${f}.png`), `${f}.png hilang`);
  }
});

test('sitemap memuat /homes', () => {
  assert.ok(readFileSync('sitemap.xml', 'utf8').includes('https://menej.site/homes'));
});
