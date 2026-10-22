// Tests for js/store.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearAllData, createStore, defaultData, STORAGE_KEY } from '../js/store.js';

// A pretend localStorage that keeps everything in memory,
// so the tests never need a real browser or phone.
function fakeStorage(initial = {}) {
  const items = { ...initial };
  return {
    items,
    getItem: (key) => (key in items ? items[key] : null),
    setItem: (key, value) => {
      items[key] = String(value);
    },
  };
}

test('first launch: load() returns the default data', () => {
  const store = createStore(fakeStorage());
  assert.deepEqual(store.load(), defaultData());
});

test('save() then load() gives back the same data', () => {
  const storage = fakeStorage();
  const data = defaultData();
  data.settings.lang = 'en';
  data.settings.welcomed = true;
  createStore(storage).save(data);
  assert.deepEqual(createStore(storage).load(), data);
});

test('settings added in a newer version get their default values', () => {
  const old = JSON.stringify({ version: 1, settings: { lang: 'en' } });
  const data = createStore(fakeStorage({ [STORAGE_KEY]: old })).load();
  assert.equal(data.settings.lang, 'en');
  assert.equal(data.settings.welcomed, false);
  assert.deepEqual(data.children, []);
  assert.equal(data.activeChildId, null);
});

test('damaged saved data: start fresh but keep a copy of the damaged text', () => {
  const storage = fakeStorage({ [STORAGE_KEY]: '{not json' });
  const data = createStore(storage).load();
  assert.deepEqual(data, defaultData());
  assert.equal(storage.items[STORAGE_KEY + ':damaged'], '{not json');
});

test('load() still works when the phone blocks reading storage', () => {
  const storage = fakeStorage();
  storage.getItem = () => {
    throw new Error('SecurityError');
  };
  assert.deepEqual(createStore(storage).load(), defaultData());
});

test('save() returns false instead of crashing when the phone refuses to save', () => {
  const storage = fakeStorage();
  storage.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  assert.equal(createStore(storage).save(defaultData()), false);
});

test('clearAllData() removes every child and record but keeps the language', () => {
  const data = defaultData();
  data.settings.lang = 'en';
  data.settings.welcomed = true;
  data.children.push({ id: 'kid', name: '小明' });
  data.activeChildId = 'kid';
  data.logs.kid = { '2026-10-22': { entries: [], breaks: 1 } };
  data.timer = { childId: 'kid', phase: 'focus' };

  clearAllData(data);
  const expected = defaultData();
  expected.settings.lang = 'en';
  assert.deepEqual(data, expected);
});

test('save() returns true when it worked', () => {
  assert.equal(createStore(fakeStorage()).save(defaultData()), true);
});
