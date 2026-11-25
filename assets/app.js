// Penyambung DOM situs MENEJ. Logika murni ada di data.js, nota.js, ical.js.
// Bagian statis (kartu paket, FAQ, platform) ditulis ke index.html oleh scripts/render-static.mjs.
import { ITEMS, KARYA, CALENDAR_SOURCES } from './data.js';
import { GREETING, formatRupiah, toggleItem, summarize, buildMessage, whatsappUrl } from './nota.js';
import { parseIcs, mergeDays, buildSampleIcs, platformKey, describeErrors } from './ical.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export function renderKarya() {
  const grid = $('#karya-grid');
  if (!grid) return;
  grid.innerHTML = KARYA.map((k, i) => `<button type="button" class="karya" data-demo="${i}">
    <span class="karya__img"><img src="${esc(k.img)}" alt="${esc(k.alt)}" width="640" height="400" loading="lazy" decoding="async"></span>
    <span class="karya__meta"><span class="karya__kind">0${i + 1} / ${esc(k.kind)}</span><span class="karya__name">${esc(k.name)}</span><span class="karya__go">Lihat pratinjau</span></span>
    <p>${esc(k.line)}</p></button>`).join('');
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


/** Pilih paket di tiap layanan, nota, dan chip WhatsApp. Kartu paket sudah ada di HTML (data-item, data-pick). */
export function initPicking() {
  const notaEl = $('#nota'), chip = $('#wa-chip');
  if (!notaEl || !chip) return;
  const badge = $('.wa-chip__n', chip);
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  let cart = {};

  function renderCards() {
    $$('[data-item]').forEach((card) => {
      const id = card.dataset.item, on = Boolean(cart[id]);
      card.classList.toggle('pkg--in', on);
      const btn = $('[data-pick]', card);
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('btn--primary', on);
      btn.classList.toggle('btn--ghost', !on);
      btn.innerHTML = `${on ? 'Terpilih, klik untuk batal' : 'Pilih paket'}<span class="visually-hidden"> ${esc(byId[id].label)}</span>`;
    });
  }

  function renderNota() {
    const s = summarize(cart), url = whatsappUrl(buildMessage(cart));
    notaEl.innerHTML = `<h3>Nota Pesanan</h3><p class="nota__sub">MENEJ · estimasi, bukan tagihan</p>` + (s.count
      ? Object.keys(cart).map((id) => { const i = byId[id]; return `<div class="nota__line"><div><b>${esc(i.label)}</b><small>${esc(i.unit)}</small></div><div class="nota__right"><b class="num">${formatRupiah(i.price)}</b><button type="button" class="nota__x" data-pick="${i.id}" aria-label="Hapus ${esc(i.label)}">Hapus</button></div></div>`; }).join('')
        + `<div class="nota__tot">${s.one ? `<div><span>Sekali bayar</span><span>${formatRupiah(s.one)}</span></div>` : ''}${s.mo ? `<div><span>Per bulan</span><span>${formatRupiah(s.mo)}</span></div>` : ''}</div>`
        + `<p class="nota__nb">Harga website merupakan harga awal. Budget iklan, domain, hosting, dan biaya pihak ketiga tidak termasuk. Harga akhir disepakati melalui chat.</p><a class="btn btn--primary" href="${url}" target="_blank" rel="noopener">Lanjut ke WhatsApp</a>`
      : `<p class="nota__empty">Belum ada paket yang dipilih. Pilih paket di layanan di atas untuk menyusun nota.</p>`);
    chip.href = s.count ? url : whatsappUrl(GREETING);
    badge.textContent = s.count;
    badge.hidden = !s.count;
    chip.setAttribute('aria-label', s.count ? `Chat WhatsApp MENEJ, ${s.count} paket di nota` : 'Chat WhatsApp MENEJ');
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    cart = toggleItem(cart, b.dataset.pick);
    renderCards();
    renderNota();
    if (b.closest('#nota')) $('#nota h3')?.focus?.();
    else b.focus({ preventScroll: true });
  });

  renderCards();
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
  renderKarya();
  initDemoDialog();
  initNavSpy();
  const url = whatsappUrl(GREETING);
  $$('[data-wa]').forEach((a) => { a.href = url; });
  const chip = $('#wa-chip');
  if (chip) chip.href = url;
}

initChrome();
initPicking();
initCalendar();
