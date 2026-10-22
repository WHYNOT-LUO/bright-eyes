// Tests for js/timer.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import { dayTotals, getDay } from '../js/log.js';
import { toDateString } from '../js/dates.js';
import {
  DURATIONS,
  beginBreak,
  finishSession,
  formatCountdown,
  pendingEvent,
  remainingMs,
  sessionMinutes,
  skipBreak,
  startTimer,
  stopTimer,
  tick,
} from '../js/timer.js';

const MIN = 60 * 1000;
const SEC = 1000;
const START = new Date(2026, 9, 22, 18, 0).getTime(); // 22 Oct 2026, 6 pm
const DAY = toDateString(new Date(START));

function running() {
  const data = defaultData();
  startTimer(data, 'kid', START);
  return data;
}

test('a new timer counts down 20 minutes of close work', () => {
  const data = running();
  assert.equal(data.timer.phase, 'focus');
  assert.equal(remainingMs(data.timer, START), 20 * MIN);
  assert.equal(remainingMs(data.timer, START + 5 * MIN), 15 * MIN);
});

test('nothing happens before the 20 minutes are up', () => {
  const data = running();
  assert.equal(pendingEvent(data.timer, START + 19 * MIN), null);
  assert.equal(tick(data, START + 19 * MIN), null);
  assert.equal(data.timer.phase, 'focus');
});

test('after 20 minutes a break is due, and the alert fires only once', () => {
  const data = running();
  assert.equal(tick(data, START + 20 * MIN), 'due');
  assert.equal(data.timer.phase, 'due');
  assert.equal(tick(data, START + 50 * MIN), null);
});

test('a finished 20-second break is counted, and the next 20 minutes start', () => {
  const data = running();
  tick(data, START + 20 * MIN);
  beginBreak(data, START + 21 * MIN);
  assert.equal(remainingMs(data.timer, START + 21 * MIN), 20 * SEC);
  assert.equal(tick(data, START + 21 * MIN + 10 * SEC), null);

  assert.equal(tick(data, START + 21 * MIN + 25 * SEC), 'breakDone');
  assert.equal(data.timer.phase, 'focus');
  assert.equal(data.timer.breaks, 1);
  assert.equal(getDay(data, 'kid', DAY).breaks, 1);
  // The new 20 minutes start when the break ended, not when the app noticed.
  assert.equal(remainingMs(data.timer, START + 21 * MIN + 20 * SEC), 20 * MIN);
});

test('a skipped break is not counted', () => {
  const data = running();
  tick(data, START + 20 * MIN);
  skipBreak(data, START + 20 * MIN);
  assert.equal(data.timer.phase, 'focus');
  assert.equal(data.timer.breaks, 0);
  assert.equal(getDay(data, 'kid', DAY).breaks, 0);
});

test('stopping shows how long the session was', () => {
  const data = running();
  stopTimer(data, START + 44 * MIN + 40 * SEC);
  assert.equal(data.timer.phase, 'ended');
  assert.equal(sessionMinutes(data.timer, START + 99 * MIN), 45); // uses the stop time
});

test('a finished session can be added to near-work time', () => {
  const data = running();
  stopTimer(data, START + 45 * MIN);
  assert.equal(finishSession(data, { log: true }), 45);
  assert.equal(data.timer, null);
  assert.deepEqual(dayTotals(getDay(data, 'kid', DAY)), { outdoor: 0, nearWork: 45 });
});

test('a finished session can also be closed without logging', () => {
  const data = running();
  stopTimer(data, START + 45 * MIN);
  assert.equal(finishSession(data, { log: false }), 0);
  assert.equal(data.timer, null);
  assert.deepEqual(getDay(data, 'kid', DAY).entries, []);
});

test('a session shorter than a minute is never logged', () => {
  const data = running();
  stopTimer(data, START + 20 * SEC);
  assert.equal(finishSession(data, { log: true }), 0);
  assert.deepEqual(getDay(data, 'kid', DAY).entries, []);
});

test('demo mode uses short times so the timer can be shown in a talk', () => {
  const data = defaultData();
  startTimer(data, 'kid', START, DURATIONS.demo);
  assert.ok(remainingMs(data.timer, START) < MIN);
});

test('countdowns show as minutes:seconds, rounding up', () => {
  assert.equal(formatCountdown(20 * MIN), '20:00');
  assert.equal(formatCountdown(65 * SEC), '01:05');
  assert.equal(formatCountdown(500), '00:01');
  assert.equal(formatCountdown(0), '00:00');
});
