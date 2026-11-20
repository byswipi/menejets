import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as D from '../assets/data.js';

const OLD = execFileSync('git', ['show', 'eda1e62:index.html'], { encoding: 'utf8', maxBuffer: 1e7 });
const slice = (from, to) => {
  const a = OLD.indexOf(from);
  assert.ok(a >= 0, `penanda awal tidak ada: ${from}`);
  const b = OLD.indexOf(to, a);
  assert.ok(b > a, `penanda akhir tidak ada: ${to}`);
  return OLD.slice(a, b);
};
const evalOld = (code, name) => new Function(`${code}; return ${name};`)();

const oldS = evalOld(slice('const S=[', 'const NOTE='), 'S');
const oldNOTE = evalOld(slice('const NOTE=', 'const cats='), 'NOTE');
const oldPK = evalOld(slice('const PK=[', 'const TAG='), 'PK');
const oldTAG = evalOld(slice('const TAG=', 'const ACC='), 'TAG');
const oldFAQ = evalOld(slice('const FAQ=[', 'const $=x'), 'FAQ');

test('SERVICES sama persis dengan S di situs lama (29 baris)', () => {
  assert.equal(oldS.length, 29);
  assert.deepEqual(D.SERVICES, oldS);
});

test('CATEGORY_NOTES punya kunci dan urutan sama dengan NOTE lama', () => {
  assert.deepEqual(Object.keys(D.CATEGORY_NOTES), Object.keys(oldNOTE));
  assert.deepEqual(D.CATEGORY_NOTES, oldNOTE);
});

test('CATEGORY_TAGS sama dengan TAG lama', () => {
  assert.deepEqual(D.CATEGORY_TAGS, oldTAG);
});

test('PACKAGES sama dengan PK lama', () => {
  assert.deepEqual(D.PACKAGES, oldPK);
});

test('FAQ berisi 11 pasangan yang sama dengan situs lama', () => {
  assert.equal(D.FAQ.length, 11);
  assert.deepEqual(D.FAQ, oldFAQ);
});

test('PLATFORMS: 9 bisa lewat iCal, 4 belum', () => {
  assert.equal(D.PLATFORMS.ok.length, 9);
  assert.deepEqual(D.PLATFORMS.no, ['Traveloka', 'Tiket.com', 'RedDoorz', 'Pegipegi']);
});

test('KARYA berisi 5 kartu dengan URL demo yang benar', () => {
  assert.equal(D.KARYA.length, 5);
  assert.deepEqual(D.KARYA.map((k) => k.url), [
    'https://alva-hills.vercel.app',
    'https://menej-cafe.vercel.app',
    'https://menej-properti.vercel.app',
    'https://menej-rent-truck.vercel.app',
    'https://menej-rent-audio.vercel.app',
  ]);
  for (const k of D.KARYA) for (const f of ['name', 'kind', 'line']) assert.ok(k[f], `${k.url} tanpa ${f}`);
});

test('CALENDAR_SOURCES: warna dan huruf platform sesuai spec', () => {
  assert.deepEqual(D.CALENDAR_SOURCES, [
    { k: 'A', n: 'Airbnb', c: '#C93A55' },
    { k: 'B', n: 'Booking.com', c: '#1F5FA8' },
    { k: 'G', n: 'Agoda', c: '#6B3FB5' },
    { k: 'K', n: 'Google Calendar', c: '#1E7A4A' },
  ]);
});
