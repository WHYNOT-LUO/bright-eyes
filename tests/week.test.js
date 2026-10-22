// Tests for js/week.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import { addBreak, addEntry } from '../js/log.js';
import { weekSummary } from '../js/week.js';

const TODAY = new Date(2026, 9, 22); // Thursday 22 Oct 2026

test('the week is the last 7 days, oldest first, ending today', () => {
  const week = weekSummary(defaultData(), { id: 'kid' }, TODAY);
  assert.equal(week.days.length, 7);
  assert.equal(week.days[0].date, '2026-10-16');
  assert.equal(week.days[6].date, '2026-10-22');
});

test('each day adds up outdoor, near-work and breaks; the week has totals and goal days', () => {
  const data = defaultData();
  addEntry(data, 'kid', '2026-10-22', 'outdoor', 120, 1);
  addEntry(data, 'kid', '2026-10-22', 'nearWork', 90, 2);
  addEntry(data, 'kid', '2026-10-20', 'outdoor', 60, 3);
  addEntry(data, 'kid', '2026-10-10', 'outdoor', 600, 4); // older than a week: ignored
  addBreak(data, 'kid', '2026-10-22');
  addBreak(data, 'kid', '2026-10-21');

  const week = weekSummary(data, { id: 'kid' }, TODAY);
  assert.deepEqual(week.days[6], { date: '2026-10-22', outdoor: 120, nearWork: 90, breaks: 1 });
  assert.deepEqual(week.totals, { outdoor: 180, nearWork: 90, breaks: 2 });
  assert.equal(week.outdoorGoalDays, 1); // only the 22nd reached 2 hours
  assert.equal(week.loggedDays, 3);
});
