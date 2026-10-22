// Tests for js/week.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import { addBreak, addEntry } from '../js/log.js';
import { chartScale, weekSummary } from '../js/week.js';

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

test('daily averages count only the days that have something logged', () => {
  const data = defaultData();
  addEntry(data, 'kid', '2026-10-22', 'outdoor', 120, 1);
  addEntry(data, 'kid', '2026-10-21', 'outdoor', 60, 2);
  addEntry(data, 'kid', '2026-10-21', 'nearWork', 45, 3);
  assert.deepEqual(weekSummary(data, { id: 'kid' }, TODAY).averages, { outdoor: 90, nearWork: 23 });
  assert.deepEqual(weekSummary(defaultData(), { id: 'kid' }, TODAY).averages, { outdoor: 0, nearWork: 0 });
});

test('the chart scale uses round steps and at most 4 gridlines above zero', () => {
  assert.deepEqual(chartScale(90), { max: 90, ticks: [0, 30, 60, 90] });
  assert.deepEqual(chartScale(200), { max: 240, ticks: [0, 60, 120, 180, 240] });
  assert.deepEqual(chartScale(500), { max: 540, ticks: [0, 180, 360, 540] });
  assert.deepEqual(chartScale(0), { max: 60, ticks: [0, 30, 60] });
});
