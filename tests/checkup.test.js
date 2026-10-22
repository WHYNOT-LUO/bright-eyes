// Tests for js/checkup.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultData } from '../js/store.js';
import {
  addMonths,
  checkupStatus,
  clearCheckup,
  daysUntil,
  makeCalendarFile,
  setCheckup,
  validateCheckup,
} from '../js/checkup.js';

const TODAY = new Date(2026, 9, 22, 15, 30); // 22 Oct 2026, 3:30 pm

test('days until a check-up count whole calendar days', () => {
  assert.equal(daysUntil('2026-10-22', TODAY), 0);
  assert.equal(daysUntil('2026-10-23', TODAY), 1);
  assert.equal(daysUntil('2026-12-15', TODAY), 54);
  assert.equal(daysUntil('2026-10-17', TODAY), -5);
});

test('check-up status: none, later, soon (2 weeks), today, overdue', () => {
  assert.deepEqual(checkupStatus(null, TODAY), { kind: 'none', days: null });
  assert.deepEqual(checkupStatus({ date: '2026-12-15' }, TODAY), { kind: 'later', days: 54 });
  assert.deepEqual(checkupStatus({ date: '2026-11-05' }, TODAY), { kind: 'soon', days: 14 });
  assert.deepEqual(checkupStatus({ date: '2026-10-22' }, TODAY), { kind: 'today', days: 0 });
  assert.deepEqual(checkupStatus({ date: '2026-10-17' }, TODAY), { kind: 'overdue', days: 5 });
});

test('"in N months" keeps the day of the month when it can', () => {
  assert.equal(addMonths(TODAY, 3), '2027-01-22');
  assert.equal(addMonths(new Date(2026, 7, 31), 1), '2026-09-30'); // 31 Aug + 1 month → 30 Sep
  assert.equal(addMonths(new Date(2026, 10, 30), 3), '2027-02-28');
});

test('a check-up date is needed, not in the past, and within two years', () => {
  assert.deepEqual(validateCheckup({ date: '' }, TODAY), { date: 'dateRequired' });
  assert.deepEqual(validateCheckup({ date: '2026-10-21' }, TODAY), { date: 'datePast' });
  assert.deepEqual(validateCheckup({ date: '2028-10-23' }, TODAY), { date: 'dateTooFar' });
  assert.deepEqual(validateCheckup({ date: '2026-10-22' }, TODAY), {});
});

test('setting and clearing a check-up is saved on the child', () => {
  const data = defaultData();
  data.children.push({ id: 'kid', name: '小明', birth: '2018-05', rx: null });
  setCheckup(data, 'kid', { date: '2026-12-15', time: '' });
  assert.deepEqual(data.children[0].checkup, { date: '2026-12-15', time: null });
  clearCheckup(data, 'kid');
  assert.equal(data.children[0].checkup, null);
});

const NOW = new Date(Date.UTC(2026, 9, 22, 7, 30, 0));

test('calendar file: an all-day event with reminders the day before and a week before', () => {
  const ics = makeCalendarFile({ id: 'kid-2026-12-31', date: '2026-12-31', time: null, title: '小明眼科复查' }, NOW);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.includes('\r\nDTSTART;VALUE=DATE:20261231\r\n'));
  assert.ok(ics.includes('\r\nDTEND;VALUE=DATE:20270101\r\n')); // the next day, across the new year
  assert.ok(ics.includes('\r\nDTSTAMP:20261022T073000Z\r\n'));
  assert.ok(ics.includes('\r\nSUMMARY:小明眼科复查\r\n'));
  assert.equal(ics.match(/BEGIN:VALARM/g).length, 2);
  assert.ok(!/[^\r]\n/.test(ics), 'every line must end with \\r\\n');
});

test('calendar file: an appointment with a time lasts one hour', () => {
  const ics = makeCalendarFile({ id: 'kid', date: '2026-12-15', time: '09:30', title: 'Check-up' }, NOW);
  assert.ok(ics.includes('\r\nDTSTART:20261215T093000\r\n'));
  assert.ok(ics.includes('\r\nDTEND:20261215T103000\r\n'));
});

test('calendar file: special characters are escaped and long lines are folded', () => {
  const ics = makeCalendarFile({ id: 'kid', date: '2026-12-15', time: null, title: 'Lily; Tom, and Sam' }, NOW);
  assert.ok(ics.includes('SUMMARY:Lily\\; Tom\\, and Sam'));

  const long = makeCalendarFile({ id: 'kid', date: '2026-12-15', time: null, title: '眼'.repeat(40) }, NOW);
  for (const line of long.split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`);
  }
  assert.ok(long.replace(/\r\n /g, '').includes('SUMMARY:' + '眼'.repeat(40)));
});
