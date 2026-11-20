// Pembaca iCal minimal dan penggabung tanggal terisi. Fungsi murni.
const MAX_DAYS = 3700;
const DAY_MS = 864e5;
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const toDate = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
const field = (block, name) => {
  const m = block.match(new RegExp(`^${name}[^:\\r\\n]*:(\\d{8})`, 'm'));
  return m ? m[1] : null;
};

/** Daftar tanggal terisi (YYYY-MM-DD). DTEND eksklusif; tanpa DTEND dihitung satu malam. */
export function parseIcs(text) {
  const out = [];
  if (typeof text !== 'string') return out;
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const start = field(block, 'DTSTART');
    if (!start) continue;
    const from = toDate(start);
    const end = field(block, 'DTEND');
    const to = end ? toDate(end) : new Date(from.getTime() + DAY_MS);
    for (let d = new Date(from); d < to && out.length < MAX_DAYS; d.setUTCDate(d.getUTCDate() + 1)) out.push(iso(d));
  }
  return out;
}

/**
 * Menggabungkan umpan untuk satu bulan (month 0-11). Sumber dengan enabled[key] === false dilewati.
 * days[d] berisi kunci sumber; konflik = lebih dari satu sumber pada tanggal yang sama.
 */
export function mergeDays(feeds, year, month, enabled = {}) {
  const days = {};
  for (const { key, days: list } of feeds) {
    if (enabled[key] === false) continue;
    for (const s of list) {
      const [y, m, d] = s.split('-').map(Number);
      if (y !== year || m - 1 !== month) continue;
      const bucket = (days[d] ||= []);
      if (!bucket.includes(key)) bucket.push(key);
    }
  }
  const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const booked = Object.keys(days).length;
  const conflicts = Object.values(days).filter((v) => v.length > 1).length;
  return { days, booked, conflicts, free: total - booked };
}

/** iCal contoh untuk demo: ranges berisi pasangan [hari mulai, hari akhir eksklusif] pada bulan itu. */
export function buildSampleIcs(year, month, ranges) {
  const f = (d) => iso(new Date(Date.UTC(year, month, d))).replaceAll('-', '');
  const events = ranges
    .map(([a, b], i) => `BEGIN:VEVENT\r\nUID:contoh-${i}@menejets\r\nDTSTART;VALUE=DATE:${f(a)}\r\nDTEND;VALUE=DATE:${f(b)}\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\n`)
    .join('');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}END:VCALENDAR`;
}

const PLATFORM_KEYS = [['airbnb', 'A'], ['booking', 'B'], ['agoda', 'G'], ['google', 'K']];

/** Huruf platform untuk host dari /api/ical; selain OTA yang dikenal dipakai huruf pertama host. */
export function platformKey(host) {
  const hit = PLATFORM_KEYS.find(([name]) => host.includes(name));
  return hit ? hit[1] : host[0].toUpperCase();
}

/** Kalimat galat untuk umpan yang gagal dibaca; string kosong bila semuanya berhasil. */
export function describeErrors(errors) {
  const hosts = (errors || []).map((e) => e.host);
  if (!hosts.length) return '';
  const list = hosts.length > 1 ? `${hosts.slice(0, -1).join(', ')} dan ${hosts[hosts.length - 1]}` : hosts[0];
  return `Tautan ${list} belum bisa dibaca.`;
}
