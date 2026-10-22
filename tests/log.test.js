// Tests for js/log.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import { addEntry, compareToTarget, dayTotals, getDay, goalsFor, removeEntry, splitMinutes } from '../js/log.js';

const DAY = '2026-10-22';

test('an empty day has no entries and zero totals', () => {
  const day = getDay(defaultData(), 'kid', DAY);
  assert.deepEqual(day.entries, []);
  assert.deepEqual(dayTotals(day), { outdoor: 0, nearWork: 0 });
});

test('entries add up by type for that child and day only', () => {
  const data = defaultData();
  addEntry(data, 'kid', DAY, 'outdoor', 30, 1);
  addEntry(data, 'kid', DAY, 'outdoor', 15, 2);
  addEntry(data, 'kid', DAY, 'nearWork', 60, 3);
  addEntry(data, 'other-kid', DAY, 'outdoor', 60, 4);
  addEntry(data, 'kid', '2026-10-21', 'outdoor', 60, 5);
  assert.deepEqual(dayTotals(getDay(data, 'kid', DAY)), { outdoor: 45, nearWork: 60 });
});

test('removing an entry takes away only that one', () => {
  const data = defaultData();
  addEntry(data, 'kid', DAY, 'outdoor', 30, 1);
  addEntry(data, 'kid', DAY, 'outdoor', 15, 2);
  removeEntry(data, 'kid', DAY, 1);
  assert.deepEqual(getDay(data, 'kid', DAY).entries, [{ type: 'outdoor', minutes: 15, at: 2 }]);
});

test('a day cannot hold more than 24 hours of entries', () => {
  const data = defaultData();
  assert.equal(addEntry(data, 'kid', DAY, 'nearWork', 1440, 1), true);
  assert.equal(addEntry(data, 'kid', DAY, 'outdoor', 15, 2), false);
  assert.deepEqual(dayTotals(getDay(data, 'kid', DAY)), { outdoor: 0, nearWork: 1440 });
});

test('goals start at 2 hours outdoors and 3 hours of near-work, and can be changed', () => {
  assert.deepEqual(goalsFor({ id: 'kid' }), { outdoor: 120, nearWork: 180 });
  assert.deepEqual(goalsFor({ id: 'kid', goals: { outdoor: 90, nearWork: 150 } }), { outdoor: 90, nearWork: 150 });
});

test('compareToTarget says how much is left or how much over', () => {
  assert.deepEqual(compareToTarget(45, 120), { ratio: 0.375, left: 75, over: 0 });
  assert.deepEqual(compareToTarget(120, 120), { ratio: 1, left: 0, over: 0 });
  assert.deepEqual(compareToTarget(200, 180), { ratio: 1, left: 0, over: 20 });
});

test('minutes split into hours and minutes', () => {
  assert.deepEqual(splitMinutes(45), { hours: 0, minutes: 45 });
  assert.deepEqual(splitMinutes(120), { hours: 2, minutes: 0 });
  assert.deepEqual(splitMinutes(135), { hours: 2, minutes: 15 });
});
