import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/shell.css', import.meta.url), 'utf8');

test('shell.css dimuat setelah site.css dan shell.js dimuat sebagai modul', () => {
  assert.ok(html.indexOf('assets/site.css') < html.indexOf('assets/shell.css'), 'urutan CSS salah');
  assert.ok(html.includes('<script type="module" src="assets/shell.js"></script>'));
});

test('rel ikon dan bingkai ada, tiap tautan rel menuju id yang ada', () => {
  const rail = html.match(/<nav class="rail"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(rail, 'rel tidak ada');
  assert.ok(/<div class="frame" aria-hidden="true">/.test(html), 'bingkai tidak ada');
  const ids = [...rail.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 5);
  for (const id of ids) assert.ok(new RegExp(`id="${id}"`).test(html), `rel menuju #${id} yang tidak ada`);
  for (const a of rail.matchAll(/<a [^>]*>/g)) assert.ok(/aria-label="[^"]+"/.test(a[0]), 'tautan rel tanpa aria-label');
});

test('transisi dan parallax menghormati gerak dikurangi', () => {
  const js = readFileSync(new URL('../assets/shell.js', import.meta.url), 'utf8');
  assert.ok(js.includes("prefers-reduced-motion: reduce"));
  assert.ok(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.pgx/.test(css));
});
