// Mengisi bagian statis index.html dari assets/data.js supaya terbaca mesin pencari tanpa JavaScript.
// Pemakaian: node scripts/render-static.mjs   (uji tests/html.test.mjs memastikan hasilnya selalu mutakhir)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SERVICES, ITEMS, FAQ, PLATFORMS } from '../assets/data.js';
import { formatRupiah } from '../assets/nota.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function card(i) {
  const cls = `pkg${i.badge ? ' pkg--hl' : ''}${i.addon ? ' pkg--addon' : ''}`;
  return `<article class="${cls}" data-item="${i.id}">
        <header><h3>${esc(i.name)}</h3>${i.badge ? `<span class="pkg__badge">${esc(i.badge)}</span>` : ''}</header>
        <p class="pkg__price"><b class="price">${formatRupiah(i.price)}</b> <span>${esc(i.unit)}</span></p>
        <ul>${i.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <button class="btn btn--ghost" type="button" data-pick="${i.id}" aria-pressed="false">Pilih paket<span class="visually-hidden"> ${esc(i.label)}</span></button>
      </article>`;
}

function packages(serviceId) {
  const own = ITEMS.filter((i) => i.service === serviceId);
  const main = own.filter((i) => !i.addon), add = own.filter((i) => i.addon);
  return `<div class="pkgs">
      ${main.map(card).join('\n      ')}
    </div>${add.length ? `
    <h3 class="pkgs__title">Tambahan</h3>
    <div class="pkgs pkgs--addons">
      ${add.map(card).join('\n      ')}
    </div>` : ''}`;
}

const headHtml = (s) => `<div class="svc__head">
      <div><span class="eyebrow">${esc(s.eyebrow)}</span><h2 id="h-${s.id}">${esc(s.title)}</h2><p class="svc__lead">${esc(s.lead)}</p></div>
      <ul class="gets" aria-label="Yang kamu dapat">${s.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
    </div>`;

const noteHtml = (s) => `<p class="svc__note">${esc(s.note)}</p>`;

const faqHtml = () => FAQ.map(([q, a]) => `<details class="faq__item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n      ');

const platformsHtml = () => `<div class="card platforms__ok"><h3>Bisa diintegrasi lewat iCal <small>Add-on website Rp90.000, semua platform ini</small></h3>
      <ul>${PLATFORMS.ok.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="card platforms__no"><h3>Belum bisa lewat iCal <small>listing tetap kami buat</small></h3>
      <ul>${PLATFORMS.no.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <p>Kalender platform ini tidak ditarik otomatis. Untuk usaha dengan banyak pesanan, kami sarankan channel manager. Ketersediaan iCal bisa berbeda per jenis akun, jadi kami cek dulu sebelum kamu membayar.</p></div>`;

const faqLd = () => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
}).replace(/</g, '\\u003c')}</script>`;

function swap(html, name, content) {
  const re = new RegExp(`(<!--${name}-->)[\\s\\S]*?(<!--/${name}-->)`);
  if (!re.test(html)) throw new Error(`penanda <!--${name}--> tidak ada di index.html`);
  return html.replace(re, (_, a, b) => `${a}\n    ${content}\n    ${b}`);
}

export function render(html) {
  let out = html;
  for (const s of SERVICES) {
    out = swap(out, `head:${s.id}`, headHtml(s));
    out = swap(out, `pkgs:${s.id}`, packages(s.id));
    out = swap(out, `note:${s.id}`, noteHtml(s));
  }
  out = swap(out, 'faq', faqHtml());
  out = swap(out, 'platforms', platformsHtml());
  out = swap(out, 'ld-faq', faqLd());
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = fileURLToPath(new URL('../index.html', import.meta.url));
  const before = readFileSync(file, 'utf8');
  const after = render(before);
  writeFileSync(file, after);
  console.log(before === after ? 'index.html sudah mutakhir' : 'index.html diperbarui dari data.js');
}
