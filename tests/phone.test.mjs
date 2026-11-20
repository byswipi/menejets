import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldUseStatic } from '../assets/phone.js';

const base = { search: '', reducedMotion: false };

test('perangkat kuat tanpa preferensi hemat: pakai 3D', () => {
  assert.equal(shouldUseStatic({ ...base, deviceMemory: 8, hardwareConcurrency: 8 }), false);
  assert.equal(shouldUseStatic(base), false, 'sinyal tidak tersedia = anggap kuat');
});

test('saveData memilih versi statis', () => {
  assert.equal(shouldUseStatic({ ...base, saveData: true }), true);
});

test('memori 2 GB atau kurang memilih versi statis', () => {
  assert.equal(shouldUseStatic({ ...base, deviceMemory: 2 }), true);
  assert.equal(shouldUseStatic({ ...base, deviceMemory: 4 }), false);
});

test('CPU 2 inti atau kurang memilih versi statis', () => {
  assert.equal(shouldUseStatic({ ...base, hardwareConcurrency: 2 }), true);
  assert.equal(shouldUseStatic({ ...base, hardwareConcurrency: 4 }), false);
});

test('?3d=1 mengalahkan sinyal perangkat lemah', () => {
  assert.equal(shouldUseStatic({ ...base, search: '?3d=1', deviceMemory: 2, hardwareConcurrency: 2, saveData: true }), false);
});

test('prefers-reduced-motion selalu statis, bahkan dengan ?3d=1', () => {
  assert.equal(shouldUseStatic({ ...base, reducedMotion: true }), true);
  assert.equal(shouldUseStatic({ search: '?3d=1', reducedMotion: true }), true);
});

test('?3d=0 memaksa versi statis', () => {
  assert.equal(shouldUseStatic({ ...base, search: '?a=1&3d=0', deviceMemory: 8, hardwareConcurrency: 8 }), true);
});
