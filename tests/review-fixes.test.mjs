import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

/** Isi deklarasi dari aturan CSS yang selektornya persis `selector` (tanpa @media). */
const rule = (selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
};
const hidesElement = (decls) => /opacity:\s*0|visibility:\s*hidden|display:\s*none/.test(decls || '');

// Review Important 2: kartu paket tidak boleh menjadi live region, hanya nota yang diumumkan
test('kartu paket bukan aria-live, #nota tetap aria-live polite', () => {
  const tag = (id) => html.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))?.[0] || '';
  const live = [...html.matchAll(/<[^>]*aria-live[^>]*>/g)].map((m) => m[0]);
  assert.ok(/aria-live="polite"/.test(tag('nota')), '#nota harus tetap aria-live polite');
  for (const tagText of live) assert.ok(!/class="pkg/.test(tagText), `live region pada kartu paket: ${tagText}`);
  assert.ok(!/aria-live/.test(html.match(/<section[^>]*id="instagram"[^>]*>/)[0]));
});

// Review Important 3: huruf platform pada sel terisi harus tetap terlihat di ponsel
test('huruf platform pada sel kalender tidak disembunyikan di layar kecil', () => {
  assert.ok(!/\.cd small\s*\{[^}]*display:\s*none/.test(css), '.cd small masih display:none');
  assert.ok(/\.cd small\s*\{[^}]*font(-size)?:/.test(css), 'ukuran huruf .cd small tidak diatur');
});
