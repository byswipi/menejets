// Penyambung DOM situs Menej Ets. Logika murni ada di data.js, nota.js, ical.js, phone.js.
import { SERVICES, CATEGORY_NOTES, CATEGORY_TAGS, PACKAGES, FAQ, KARYA, PLATFORMS, CALENDAR_SOURCES } from './data.js';
import { GREETING, formatRupiah, setQty, summarize, buildMessage, whatsappUrl } from './nota.js';
import { parseIcs, mergeDays, buildSampleIcs, platformKey, describeErrors } from './ical.js';

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

const PACKAGE_CATEGORY = 'Paket Bulanan';

export function initPricing() {
  const tabsEl = $('#price-tabs'), listEl = $('#price-list'), notaEl = $('#nota');
  if (!tabsEl || !listEl || !notaEl) return;
  const cats = Object.keys(CATEGORY_NOTES);
  let cart = {}, current = 0;

  tabsEl.innerHTML = cats.map((c, i) => `<button type="button" role="tab" id="tab-${i}" aria-controls="price-list" data-c="${i}">${esc(c)}</button>`).join('');

  function card(i) {
    const [cat, name, price, kind, unit, desc, pkg] = SERVICES[i];
    const q = cart[i] || 0, n = esc(name), isPkg = cat === PACKAGE_CATEGORY;
    const act = isPkg
      ? `<button class="btn ${q ? 'btn--primary' : 'btn--ghost'}" type="button" data-i="${i}" data-d="${q ? -1 : 1}" aria-pressed="${q ? 'true' : 'false'}">${q ? 'Keluarkan dari nota' : 'Masukkan ke nota'}<span class="visually-hidden"> ${n}</span></button>`
      : q
        ? `<div class="qty" role="group" aria-label="Jumlah ${n}"><button type="button" data-i="${i}" data-d="-1" aria-label="Kurangi ${n}">−</button><output>${q}</output><button type="button" data-i="${i}" data-d="1" aria-label="Tambah ${n}">+</button></div>`
        : `<button class="btn btn--ghost" type="button" data-i="${i}" data-d="1">Tambah<span class="visually-hidden"> ${n} ke nota</span></button>`;
    const pk = isPkg ? PACKAGES[pkg] : null;
    const det = pk ? `<details><summary>Isi paket</summary><ul>${pk.f.map((x) => `<li>${esc(x)}</li>`).join('')}${pk.x.map((x) => `<li class="muted">${esc(x)}</li>`).join('')}</ul>${pk.sv ? `<p>${esc(pk.sv)}</p>` : pk.svn ? `<p>${esc(pk.svn)}</p>` : ''}</details>` : '';
    return `<article class="pd${q ? ' pd--in' : ''}"><div class="pd__top"><h4>${n}</h4><span class="pd__price">${kind === 'w' ? 'Mulai ' : ''}${formatRupiah(price)}</span></div><span class="pd__unit">${esc(unit)}</span><p>${esc(desc)}</p>${det}<div class="pd__act">${act}</div></article>`;
  }

  function renderList() {
    const cat = cats[current];
    listEl.setAttribute('aria-labelledby', `tab-${current}`);
    listEl.innerHTML = `<div class="pd-grid">${SERVICES.map((s, i) => (s[0] === cat ? card(i) : '')).join('')}</div><p class="price-note"><b>Catatan:</b> ${esc(CATEGORY_NOTES[cat])}</p>`;
  }

  function renderTabs() {
    $$('button', tabsEl).forEach((b, i) => { b.setAttribute('aria-selected', i === current ? 'true' : 'false'); b.tabIndex = i === current ? 0 : -1; });
  }

  function renderNota() {
    const s = summarize(cart), msg = buildMessage(cart), url = whatsappUrl(msg);
    const keys = Object.keys(cart);
    notaEl.innerHTML = `<h3>Nota Pesanan</h3><p class="nota__sub">Menej Ets · estimasi, bukan tagihan</p>` + (s.count
      ? keys.map((k) => { const [, name, price, , unit] = SERVICES[k]; return `<div class="nota__line"><div><b>${esc(name)}</b><small>${formatRupiah(price)} × ${cart[k]} · ${esc(unit)}</small></div><b class="num">${formatRupiah(price * cart[k])}</b></div>`; }).join('')
        + `<div class="nota__tot">${s.one ? `<div><span>Sekali bayar</span><span>${formatRupiah(s.one)}</span></div>` : ''}${s.mo ? `<div><span>Per bulan</span><span>${formatRupiah(s.mo)}</span></div>` : ''}</div>`
        + `<p class="nota__nb">Harga website merupakan harga awal. Budget iklan, domain, hosting, dan biaya pihak ketiga tidak termasuk. Harga akhir disepakati melalui chat.</p><a class="btn btn--primary" href="${url}" target="_blank" rel="noopener">Lanjut ke WhatsApp</a>`
      : `<p class="nota__empty">Belum ada layanan yang dipilih. Masukkan layanan ke nota untuk menyusunnya.</p>`);
    const chip = $('#wa-chip'), badge = $('.wa-chip__n', chip);
    chip.href = s.count ? url : whatsappUrl(GREETING);
    badge.textContent = s.count;
    badge.hidden = !s.count;
  }

  function setTab(i) { current = i; renderTabs(); renderList(); }

  tabsEl.addEventListener('click', (e) => { const b = e.target.closest('button[data-c]'); if (b) setTab(+b.dataset.c); });
  tabsEl.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (current + step + cats.length) % cats.length;
    setTab(next);
    $(`#tab-${next}`).focus();
  });
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const i = +b.dataset.i, d = +b.dataset.d;
    cart = setQty(cart, i, d);
    renderList(); renderNota();
    (listEl.querySelector(`button[data-i="${i}"][data-d="${d}"]`) || listEl.querySelector(`button[data-i="${i}"]`))?.focus({ preventScroll: true });
  });
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-tab]');
    if (!link) return;
    const i = cats.indexOf(link.dataset.tab);
    if (i >= 0) setTab(i);
  });

  setTab(0);
  renderNota();
}


const SAMPLE_RANGES = { A: [[3, 6], [12, 15], [24, 27]], B: [[8, 11], [14, 18]], G: [[20, 23]], K: [[28, 30]] };

async function loadRealFeeds(urls) {
  const res = await fetch('/api/ical?' + urls.map((u) => 'u=' + encodeURIComponent(u)).join('&'));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const json = await res.json();
  const byHost = {};
  for (const [date, hosts] of Object.entries(json.dates || {})) for (const h of hosts) (byHost[h] ||= []).push(date);
  return { feeds: Object.entries(byHost).map(([host, days]) => ({ key: platformKey(host), days })), errors: json.errors || [] };
}

export async function initCalendar() {
  const srcEl = $('#cal-sources'), board = $('#cal-board'), statsEl = $('#cal-stats'), detailEl = $('#cal-detail');
  if (!srcEl || !board || !statsEl || !detailEl) return;
  const now = new Date(), Y = now.getFullYear(), M = now.getMonth();
  const total = new Date(Y, M + 1, 0).getDate();
  const first = (new Date(Y, M, 1).getDay() + 6) % 7;
  const month = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const enabled = Object.fromEntries(CALENDAR_SOURCES.map((s) => [s.k, true]));
  const byKey = Object.fromEntries(CALENDAR_SOURCES.map((s) => [s.k, s]));
  let feeds = CALENDAR_SOURCES.map((s) => ({ key: s.k, days: parseIcs(buildSampleIcs(Y, M, SAMPLE_RANGES[s.k])) }));
  let selected = 0, errorText = '';

  srcEl.innerHTML = CALENDAR_SOURCES.map((s) => `<button class="chip" type="button" data-k="${s.k}" aria-pressed="true" style="--c:${s.c}"><i></i>${esc(s.n)}</button>`).join('');

  const names = (keys) => keys.map((k) => byKey[k]?.n || k).join(' dan ');
  function describe(d, days) {
    if (!d) return errorText || 'Ketuk tanggal untuk melihat asal pesanannya.';
    const who = days[d] || [];
    if (!who.length) return `Tanggal ${d}: tersedia, bisa dipesan lewat WhatsApp.`;
    if (who.length > 1) return `Tanggal ${d}: bentrok. Terisi di ${names(who)}. Ini terjadi bila dua platform belum saling tahu. Kalender gabungan membantu menutup tanggalnya sebelum tamu ketiga memesan.`;
    return `Tanggal ${d}: terisi dari ${names(who)}, otomatis tertutup di website.`;
  }

  function draw() {
    const r = mergeDays(feeds, Y, M, enabled);
    const dows = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="cd cd--blank" aria-hidden="true"></span>';
    for (let d = 1; d <= total; d++) {
      const who = r.days[d] || [], conflict = who.length > 1, booked = who.length > 0;
      const label = !booked ? `${d}: tersedia` : conflict ? `${d}: bentrok, dipesan di ${names(who)}` : `${d}: terisi di ${names(who)}`;
      const cls = `cd${booked && !conflict ? ' cd--booked' : ''}${conflict ? ' cd--conflict' : ''}${selected === d ? ' cd--sel' : ''}`;
      const style = booked && !conflict ? ` style="--c:${byKey[who[0]]?.c || '#4A5A53'}"` : '';
      cells += `<button type="button" class="${cls}" data-d="${d}"${style} aria-label="${esc(label)}">${d}${booked ? `<small>${conflict ? '!' : esc(who[0])}</small>` : ''}</button>`;
    }
    const active = Object.values(enabled).filter(Boolean).length;
    board.innerHTML = `<div class="cal__head"><b>${esc(month)}</b><span>Gabungan ${active} sumber</span></div>
      <div class="cal__grid">${dows.map((w) => `<span class="cal__dow">${w}</span>`).join('')}${cells}</div>
      <p class="cal__legend"><span><i class="lg lg--free"></i>Tersedia</span><span><i class="lg lg--booked"></i>Terisi (huruf = platform)</span><span><i class="lg lg--conflict"></i>Bentrok</span></p>`;
    statsEl.innerHTML = `<div><b>${r.free}</b><small>Malam tersedia</small></div><div><b>${r.booked}</b><small>Malam terisi</small></div><div class="is-conflict"><b>${r.conflicts}</b><small>Tanggal bentrok</small></div>`;
    detailEl.textContent = describe(selected, r.days);
  }

  srcEl.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    enabled[b.dataset.k] = !enabled[b.dataset.k];
    b.setAttribute('aria-pressed', String(enabled[b.dataset.k]));
    draw();
  });
  board.addEventListener('click', (e) => {
    const c = e.target.closest('button[data-d]');
    if (!c) return;
    selected = +c.dataset.d;
    draw();
    board.querySelector(`button[data-d="${selected}"]`)?.focus({ preventScroll: true });
  });

  draw();

  /* mode nyata: <div id="cal-board" data-feeds='["https://…ics", …]'> memakai /api/ical */
  const raw = board.dataset.feeds;
  if (raw) {
    detailEl.textContent = 'Memuat kalender…';
    try {
      const urls = JSON.parse(raw);
      const real = await loadRealFeeds(urls);
      feeds = real.feeds;
      errorText = describeErrors(real.errors);
    } catch {
      feeds = [];
      errorText = 'Kalender belum bisa dimuat. Coba lagi nanti.';
    }
    draw();
  }
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
initPricing();
initCalendar();
