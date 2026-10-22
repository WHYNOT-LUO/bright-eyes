// Tests for js/dates.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromDateString, toDateString, toMonthString } from '../js/dates.js';

test('dates are saved as YYYY-MM-DD and months as YYYY-MM', () => {
  const date = new Date(2026, 0, 5); // 5 January 2026
  assert.equal(toDateString(date), '2026-01-05');
  assert.equal(toMonthString(date), '2026-01');
});

test('a saved date turns back into the same day', () => {
  assert.equal(toDateString(fromDateString('2026-09-01')), '2026-09-01');
});
