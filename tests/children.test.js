// Tests for js/children.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import {
  ageFromBirth,
  diopterChoices,
  formatDiopter,
  getActiveChild,
  removeChild,
  saveChild,
  validateChild,
} from '../js/children.js';

const TODAY = new Date(2026, 9, 22); // 22 October 2026 (months count from 0)

function blankRx() {
  return { date: '', right: { sph: null, cyl: null }, left: { sph: null, cyl: null } };
}

function input(overrides = {}) {
  return { name: '小明', birth: '2018-05', rx: blankRx(), ...overrides };
}

test('age comes from the birth month and updates by itself', () => {
  assert.equal(ageFromBirth('2018-05', TODAY), 8);
  assert.equal(ageFromBirth('2018-10', TODAY), 8); // birthday month counts as reached
  assert.equal(ageFromBirth('2018-11', TODAY), 7);
  assert.equal(ageFromBirth('2026-10', TODAY), 0);
});

test('age is null when there is no valid birth month', () => {
  assert.equal(ageFromBirth('', TODAY), null);
  assert.equal(ageFromBirth('May 2018', TODAY), null);
  assert.equal(ageFromBirth(undefined, TODAY), null);
});

test('prescription numbers are shown with a sign and two decimals', () => {
  assert.equal(formatDiopter(-1.5), '-1.50');
  assert.equal(formatDiopter(0.25), '+0.25');
  assert.equal(formatDiopter(0), '0.00');
  assert.equal(formatDiopter(null), '—');
});

test('prescription choices go in steps of 0.25, minus side first', () => {
  assert.deepEqual(diopterChoices(-1, 0.5), {
    minus: [-0.25, -0.5, -0.75, -1],
    plus: [0.25, 0.5],
  });
});

test('a child needs a name and a birth month', () => {
  assert.deepEqual(validateChild(input({ name: '   ' }), TODAY), { name: 'nameRequired' });
  assert.deepEqual(validateChild(input({ birth: '' }), TODAY), { birth: 'birthRequired' });
  assert.deepEqual(validateChild(input(), TODAY), {});
});

test('birth month cannot be in the future or 18+ years ago', () => {
  assert.deepEqual(validateChild(input({ birth: '2026-11' }), TODAY), { birth: 'birthFuture' });
  assert.deepEqual(validateChild(input({ birth: '2008-10' }), TODAY), { birth: 'birthTooOld' });
  assert.deepEqual(validateChild(input({ birth: '2008-11' }), TODAY), {});
});

test('eye test date cannot be in the future', () => {
  const rx = { ...blankRx(), date: '2026-10-23' };
  assert.deepEqual(validateChild(input({ rx }), TODAY), { rxDate: 'rxDateFuture' });
});

test('saving a new child adds it and makes it the active child', () => {
  const data = defaultData();
  const id = saveChild(data, input({ name: '  小明 ' }));
  assert.equal(data.children.length, 1);
  assert.equal(data.children[0].id, id);
  assert.equal(data.children[0].name, '小明');
  assert.equal(data.activeChildId, id);
});

test('saving an existing child updates it instead of adding another', () => {
  const data = defaultData();
  const id = saveChild(data, input());
  saveChild(data, input({ id, name: '小明明', birth: '2018-06' }));
  assert.equal(data.children.length, 1);
  assert.equal(data.children[0].name, '小明明');
  assert.equal(data.children[0].birth, '2018-06');
});

test('an empty prescription is stored as "none"', () => {
  const data = defaultData();
  saveChild(data, input());
  assert.equal(data.children[0].rx, null);
});

test('a filled-in prescription is kept', () => {
  const data = defaultData();
  const rx = { date: '2026-09-01', right: { sph: -1.5, cyl: -0.5 }, left: { sph: -1.25, cyl: null } };
  saveChild(data, input({ rx }));
  assert.deepEqual(data.children[0].rx, rx);
});

test('removing the active child switches to another child', () => {
  const data = defaultData();
  const first = saveChild(data, input({ name: 'A' }));
  const second = saveChild(data, input({ name: 'B' }));
  assert.equal(data.activeChildId, second);
  removeChild(data, second);
  assert.equal(data.activeChildId, first);
  removeChild(data, first);
  assert.equal(data.activeChildId, null);
  assert.deepEqual(data.children, []);
});

test('removing a child also deletes their daily log', () => {
  const data = defaultData();
  const id = saveChild(data, input());
  data.logs[id] = { '2026-10-22': { entries: [{ type: 'outdoor', minutes: 30, at: 1 }] } };
  removeChild(data, id);
  assert.equal(data.logs[id], undefined);
});

test("removing a child stops a timer that is running for them", () => {
  const data = defaultData();
  const id = saveChild(data, input());
  data.timer = { childId: id, phase: 'focus' };
  removeChild(data, id);
  assert.equal(data.timer, null);
});

test('daily goals are saved with the child', () => {
  const data = defaultData();
  const id = saveChild(data, input({ goals: { outdoor: 90, nearWork: 150 } }));
  assert.deepEqual(data.children[0].goals, { outdoor: 90, nearWork: 150 });
  saveChild(data, input({ id, name: 'B' })); // a save without goals keeps the old ones
  assert.deepEqual(data.children[0].goals, { outdoor: 90, nearWork: 150 });
});

test('getActiveChild falls back to the first child, or null when there are none', () => {
  const data = defaultData();
  assert.equal(getActiveChild(data), null);
  saveChild(data, input({ name: 'A' }));
  data.activeChildId = 'missing';
  assert.equal(getActiveChild(data).name, 'A');
});
