// Vercel Function: menggabungkan beberapa tautan iCal OTA menjadi satu daftar tanggal terisi.
// Pakai: GET /api/ical?u=<url-ical-1>&u=<url-ical-2>   (URL di-encode)
// Balasan: { dates: { "2026-11-14": ["airbnb.com","booking.com"] }, errors: [...] }
// Hanya HTTPS dan hanya host OTA/kalender yang diizinkan, supaya endpoint ini tidak bisa dipakai membaca alamat lain (SSRF).

const ALLOW = [
  "airbnb.com", "airbnb.co.id", "booking.com", "admin.booking.com", "agoda.com", "ycs.agoda.com",
  "calendar.google.com", "vrbo.com", "tiket.com", "traveloka.com",
];
const MAX_FEEDS = 6, MAX_BYTES = 1_000_000, TIMEOUT_MS = 8000;

const allowed = (h) => ALLOW.some((a) => h === a || h.endsWith("." + a));
const d2s = (d) => d.toISOString().slice(0, 10);

function parse(text) {
  const out = [];
  for (const b of text.split("BEGIN:VEVENT").slice(1)) {
    const g = (k) => (b.match(new RegExp(k + "[^:\\r\\n]*:(\\d{8})")) || [])[1];
    const a = g("DTSTART"), z = g("DTEND");
    if (!a) continue;
    const toD = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
    const s0 = toD(a), e0 = z ? toD(z) : new Date(s0.getTime() + 864e5);
    for (let x = new Date(s0); x < e0 && out.length < 3700; x.setUTCDate(x.getUTCDate() + 1)) out.push(d2s(x));
  }
  return out;
}

export default async function handler(req, res) {
  const raw = [].concat(req.query.u || []).slice(0, MAX_FEEDS);
  if (!raw.length) return res.status(400).json({ error: "Tambahkan parameter u=<url iCal>" });
  const dates = {}, errors = [];
  await Promise.all(raw.map(async (u) => {
    try {
      const url = new URL(u);
      if (url.protocol !== "https:" || !allowed(url.hostname)) throw new Error("host tidak diizinkan: " + url.hostname);
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
      const r = await fetch(url, { signal: ctl.signal, redirect: "error" });
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const text = (await r.text()).slice(0, MAX_BYTES);
      for (const day of parse(text)) (dates[day] ||= []).push(url.hostname.replace(/^(www|admin|ycs)\./, ""));
    } catch (e) {
      errors.push({ host: (() => { try { return new URL(u).hostname; } catch { return "?"; } })(), message: e.message });
    }
  }));
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  res.status(200).json({ updated: new Date().toISOString(), dates, errors });
}
