// Penyambung DOM situs Menej Ets. Logika murni ada di data.js, nota.js, ical.js, phone.js.
import { SERVICES, CATEGORY_TAGS, FAQ, KARYA, PLATFORMS } from './data.js';
import { GREETING, formatRupiah, whatsappUrl } from './nota.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const ICONS = {
  'Konten AI': '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>',
  'Kelola Instagram': '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17" cy="7" r=".8"/>',
  'Iklan Digital': '<path d="M4 13V9l11-4v12L4 13z"/><path d="M7 14l1.4 5h2.2L9.8 15.6"/><path d="M18.5 9.5a3.5 3.5 0 0 1 0 5"/>',
  'Website': '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".6"/>',
  'Otomasi AI': '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/><circle cx="12" cy="12" r="2.5"/>',
  'Listing Properti': '<path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
  'Kalender OTA': '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>',
  'Paket Bulanan': '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 13l9 5 9-5"/>',
};

export function renderServices() {
  const grid = $('#svc-grid');
  if (!grid) return;
  grid.innerHTML = Object.keys(CATEGORY_TAGS).map((cat) => {
    const min = Math.min(...SERVICES.filter((s) => s[0] === cat).map((s) => s[2]));
    return `<a class="svc card" href="#harga" data-tab="${esc(cat)}">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[cat] || ''}</svg>
      <h3>${esc(cat)}</h3><p>${esc(CATEGORY_TAGS[cat])}</p>
      <span class="svc__from">Mulai <b class="price">${formatRupiah(min)}</b></span></a>`;
  }).join('');
}

export function renderPlatforms() {
  const box = $('#platforms');
  if (!box) return;
  box.innerHTML = `
    <div class="card platforms__ok"><h3>Bisa diintegrasi lewat iCal <small>Add-on website Rp90.000, semua platform ini</small></h3>
      <ul>${PLATFORMS.ok.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="card platforms__no"><h3>Belum bisa lewat iCal <small>listing tetap kami buat</small></h3>
      <ul>${PLATFORMS.no.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <p>Kalender platform ini tidak ditarik otomatis. Untuk usaha dengan banyak pesanan, kami sarankan channel manager. Ketersediaan iCal bisa berbeda per jenis akun, jadi kami cek dulu sebelum kamu membayar.</p></div>`;
}

export function renderFaq() {
  const box = $('#faq-list');
  if (!box) return;
  box.innerHTML = FAQ.map(([q, a]) => `<details class="faq__item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
}

export function renderKarya() {
  const grid = $('#karya-grid');
  if (!grid) return;
  grid.innerHTML = KARYA.map((k, i) => `<button type="button" class="karya card" data-demo="${i}">
    <span class="eyebrow">${esc(k.kind)}</span><h3>${esc(k.name)}</h3><p>${esc(k.line)}</p><span class="karya__go">Lihat pratinjau</span></button>`).join('');
}

function initDemoDialog() {
  const dlg = $('#demo-dialog'), frame = $('#demo-frame');
  if (!dlg) return;
  let opener = null;
  const close = () => { if (dlg.open) dlg.close(); };
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-demo]');
    if (card) {
      const k = KARYA[+card.dataset.demo];
      opener = card;
      $('#demo-title').textContent = `${k.name} · ${k.url.replace('https://', '')}`;
      $('#demo-open').href = k.url;
      frame.title = `Pratinjau ${k.name}`;
      frame.src = k.url;
      dlg.showModal();
      $('#demo-close').focus();
    } else if (e.target === dlg) close();
  });
  $('#demo-close').addEventListener('click', close);
  dlg.addEventListener('close', () => { frame.src = 'about:blank'; if (opener) opener.focus(); });
}

function initNavSpy() {
  const links = $$('.nav__links a'), targets = links.map((a) => $(a.getAttribute('href')));
  if (!('IntersectionObserver' in window)) return;
  targets.forEach((t) => t && new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a, i) => a.setAttribute('aria-current', targets[i] === en.target ? 'true' : 'false'));
    });
  }, { rootMargin: '-45% 0px -50% 0px' }).observe(t));
}

export function initChrome() {
  renderServices();
  renderPlatforms();
  renderFaq();
  renderKarya();
  initDemoDialog();
  initNavSpy();
  const url = whatsappUrl(GREETING);
  $$('[data-wa]').forEach((a) => { a.href = url; });
  const chip = $('#wa-chip');
  if (chip) chip.href = url;
}

initChrome();
