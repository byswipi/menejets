import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const phone = readFileSync(new URL('../assets/phone.js', import.meta.url), 'utf8');

/** Isi deklarasi dari aturan CSS yang selektornya persis `selector` (tanpa @media). */
const rule = (selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
};
const hidesElement = (decls) => /opacity:\s*0|visibility:\s*hidden|display:\s*none/.test(decls || '');

// Review Important 1: tanpa JavaScript ponsel statis harus terlihat, loader tidak boleh menggantung
test('ponsel statis terlihat secara bawaan (tanpa JavaScript atau bila app.js gagal)', () => {
  assert.ok(rule('.phone-static'), 'aturan .phone-static tidak ada');
  assert.equal(hidesElement(rule('.phone-static')), false, '.phone-static tersembunyi secara bawaan');
});

test('loader tersembunyi secara bawaan dan hanya tampil bila JS menandai is-loading', () => {
  assert.equal(hidesElement(rule('.phone-loader')), true, '.phone-loader harus tersembunyi bawaan');
  assert.ok(/\.phone-stage\.is-loading \.phone-loader\s*\{[^}]*(opacity:\s*1|visibility:\s*visible)/.test(css), 'tidak ada aturan yang menampilkan loader saat is-loading');
  assert.ok(/\.phone-stage\.is-loading \.phone-static\s*\{[^}]*(opacity:\s*0|visibility:\s*hidden)/.test(css), 'ponsel statis harus tersembunyi saat is-loading');
  assert.ok(phone.includes("classList.add('is-loading')"), 'phone.js tidak menandai is-loading');
  assert.ok(/classList\.remove\([^)]*'is-loading'/.test(phone), 'phone.js tidak melepas is-loading');
});

// Review Important 2: daftar harga tidak boleh menjadi live region
test('#price-list bukan aria-live, #nota tetap aria-live polite', () => {
  const tag = (id) => html.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))?.[0] || '';
  assert.ok(tag('price-list'), '#price-list tidak ditemukan');
  assert.ok(!/aria-live/.test(tag('price-list')), '#price-list masih aria-live');
  assert.ok(/aria-live="polite"/.test(tag('nota')), '#nota harus tetap aria-live polite');
});

// Review Important 3: huruf platform pada sel terisi harus tetap terlihat di ponsel
test('huruf platform pada sel kalender tidak disembunyikan di layar kecil', () => {
  assert.ok(!/\.cd small\s*\{[^}]*display:\s*none/.test(css), '.cd small masih display:none');
  assert.ok(/\.cd small\s*\{[^}]*font-size/.test(css), 'ukuran huruf .cd small tidak diatur');
});
