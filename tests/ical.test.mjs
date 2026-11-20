import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIcs, mergeDays, buildSampleIcs } from '../assets/ical.js';

const ev = (start, end, startParams = ';VALUE=DATE') =>
  `BEGIN:VEVENT\r\nUID:x\r\nDTSTART${startParams}:${start}\r\n${end ? `DTEND;VALUE=DATE:${end}\r\n` : ''}SUMMARY:Reserved\r\nEND:VEVENT\r\n`;
const cal = (...events) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events.join('')}END:VCALENDAR`;

test('DTEND bersifat eksklusif: 3 sampai 6 Nov berarti malam 3, 4, 5', () => {
  assert.deepEqual(parseIcs(cal(ev('20261103', '20261106'))), ['2026-11-03', '2026-11-04', '2026-11-05']);
});

test('tanpa DTEND dihitung satu malam', () => {
  assert.deepEqual(parseIcs(cal(ev('20261110', null))), ['2026-11-10']);
});

test('DTSTART bertipe DATE-TIME dengan TZID tetap terbaca tanggalnya', () => {
  assert.deepEqual(parseIcs(cal(ev('20261114T140000', null, ';TZID=Asia/Jakarta'))), ['2026-11-14']);
});

test('teks sampah dan umpan kosong tidak melempar galat', () => {
  assert.deepEqual(parseIcs('bukan ical'), []);
  assert.deepEqual(parseIcs(''), []);
  assert.deepEqual(parseIcs('BEGIN:VEVENT\r\nDTSTART:abc\r\nEND:VEVENT'), []);
});

test('rentang yang melewati pergantian bulan hanya dihitung pada bulan yang ditampilkan', () => {
  const days = parseIcs(cal(ev('20261128', '20261203')));
  const r = mergeDays([{ key: 'A', days }], 2026, 10, {});
  assert.deepEqual(Object.keys(r.days).map(Number), [28, 29, 30]);
  assert.equal(r.booked, 3);
  const dec = mergeDays([{ key: 'A', days }], 2026, 11, {});
  assert.deepEqual(Object.keys(dec.days).map(Number), [1, 2]);
});

test('dua sumber pada tanggal yang sama dihitung sebagai satu bentrok', () => {
  const a = parseIcs(cal(ev('20261112', '20261115')));
  const b = parseIcs(cal(ev('20261114', '20261118')));
  const r = mergeDays([{ key: 'A', days: a }, { key: 'B', days: b }], 2026, 10, {});
  assert.equal(r.conflicts, 1);
  assert.deepEqual(r.days[14], ['A', 'B']);
  assert.equal(r.booked, 3 + 4 - 1);
});

test('sumber yang dimatikan tidak dihitung, termasuk bentroknya', () => {
  const a = parseIcs(cal(ev('20261112', '20261115')));
  const b = parseIcs(cal(ev('20261114', '20261118')));
  const r = mergeDays([{ key: 'A', days: a }, { key: 'B', days: b }], 2026, 10, { B: false });
  assert.equal(r.conflicts, 0);
  assert.equal(r.booked, 3);
  assert.equal(r.days[14].join(), 'A');
});

test('satu bulan penuh terisi: tidak ada malam tersedia', () => {
  const full = parseIcs(cal(ev('20261101', '20261201')));
  const r = mergeDays([{ key: 'A', days: full }], 2026, 10, {});
  assert.equal(r.booked, 30);
  assert.equal(r.free, 0);
});

test('tanpa umpan: semua malam tersedia', () => {
  const r = mergeDays([], 2026, 10, {});
  assert.equal(r.booked, 0);
  assert.equal(r.free, 30);
  assert.equal(r.conflicts, 0);
});

test('buildSampleIcs menghasilkan iCal yang terbaca kembali oleh parseIcs', () => {
  const text = buildSampleIcs(2026, 10, [[3, 6], [20, 23]]);
  assert.deepEqual(parseIcs(text), ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-20', '2026-11-21', '2026-11-22']);
});
