// Lapisan jendela dashboard: transisi bagian (naik dari bawah, bukan gulir), penanda rel, dan parallax.
// Berdiri sendiri: situs tetap jalan bila file ini gagal dimuat (tautan #id jatuh ke gulir biasa).

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bagian halaman mana yang termasuk item rel mana. */
export const GROUP = {
  hero: 'hero', instagram: 'instagram', iklan: 'instagram', website: 'instagram', properti: 'instagram', otomasi: 'instagram',
  karya: 'karya', pesan: 'pesan', cara: 'pesan', faq: 'faq', kontak: 'kontak',
};

/* ---------- transisi bagian ---------- */
let busy = false;

function cleanClone(root) {
  root.removeAttribute('id');
  $$('[id]', root).forEach((e) => e.removeAttribute('id'));
  $$('canvas, iframe, dialog', root).forEach((e) => e.remove());
  $$('img', root).forEach((i) => { i.loading = 'eager'; });
  $$('.phone-stage', root).forEach((s) => { s.classList.remove('is-ready', 'is-loading'); s.classList.add('is-static'); });
  $$('[data-par]', root).forEach((e) => { e.style.translate = ''; });
}

function bgOf(el) {
  const c = getComputedStyle(el).backgroundColor;
  return c && c !== 'rgba(0, 0, 0, 0)' ? c : getComputedStyle(document.body).backgroundColor;
}

export function go(id) {
  const t = document.getElementById(id);
  if (!t || busy) return;
  const y = id === 'hero' ? 0 : Math.round(t.getBoundingClientRect().top + scrollY);
  const jump = () => {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    scrollTo(0, y);
    root.style.scrollBehavior = '';
    history.replaceState(null, '', '#' + id);
    t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
    tick();
  };
  if (reduce || Math.abs(y - scrollY) < 8) { jump(); return; }

  busy = true;
  const ov = document.createElement('div');
  ov.className = 'pgx';
  ov.setAttribute('aria-hidden', 'true');
  ov.inert = true;
  ov.style.background = bgOf(t);
  const inner = document.createElement('div');
  inner.className = 'pgx__in';
  const clone = t.cloneNode(true);
  cleanClone(clone);
  inner.appendChild(clone);
  ov.appendChild(inner);
  const dim = document.createElement('div');
  dim.className = 'pgx-dim';
  document.body.append(dim, ov);
  ov.getBoundingClientRect();
  requestAnimationFrame(() => { ov.classList.add('in'); dim.classList.add('in'); });

  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    jump();
    requestAnimationFrame(() => requestAnimationFrame(() => { ov.remove(); dim.remove(); busy = false; }));
  };
  ov.addEventListener('transitionend', (e) => { if (e.target === ov && e.propertyName === 'transform') done(); });
  setTimeout(done, 1300);
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.classList.contains('skip')) return;
  const id = a.getAttribute('href').slice(1);
  if (!id || !document.getElementById(id)) return;
  e.preventDefault();
  go(id);
});

/* ---------- penanda rel dan parallax ---------- */
const railLinks = $$('.rail a[data-rail]');
let secs = [];
let par = [];

function collect() {
  secs = [['hero', $('#hero')], ['hero', $('.strip')], ['hero', $('.band')], ...Object.keys(GROUP).map((id) => [GROUP[id], document.getElementById(id)])].filter(([, el]) => el);
  par = $$('[data-par]').map((el) => ({ el, k: parseFloat(el.dataset.par) || 0, clamp: 0 }));
  [['.band h2', 0.05], ['.cta h2', 0.06], ['.svc__head h2', 0.03]].forEach(([sel, k]) => $$(sel).forEach((el) => par.push({ el, k, clamp: 0 })));
  $$('.karya__img').forEach((box) => { const img = $('img', box); if (img) par.push({ el: img, box, k: -0.08, clamp: 0.035 }); });
}

let queued = false;
function tick() {
  queued = false;
  const vh = innerHeight;
  let cur = 'hero';
  for (const [g, el] of secs) {
    const r = el.getBoundingClientRect();
    if (r.top <= vh * 0.4 && r.bottom > vh * 0.4) { cur = g; break; }
    if (r.bottom <= vh * 0.4) cur = g;
  }
  railLinks.forEach((a) => a.setAttribute('aria-current', String(a.dataset.rail === cur)));
  if (reduce) return;
  for (const p of par) {
    const ref = (p.box || p.el).getBoundingClientRect();
    if (ref.bottom < -300 || ref.top > vh + 300) continue;
    let v = -(ref.top + ref.height / 2 - vh / 2) * p.k;
    if (p.clamp) { const m = ref.height * p.clamp; v = Math.max(-m, Math.min(m, v)); }
    p.el.style.translate = `0 ${v.toFixed(1)}px`;
  }
}
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };

collect();
tick();
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', queue);
