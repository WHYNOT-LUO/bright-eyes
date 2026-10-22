// checkup.js — the next eye check-up: how many days are left, and a calendar file.
// Pure logic with no web-page code, so a WeChat mini-program can reuse it.
//
// Saved on each child as:  checkup: { date: '2026-12-15', time: '09:30' or null }
//
// Why a calendar file? A web app can't wake up on its own to remind anyone.
// The phone's calendar can, so we hand the date over to it (an ".ics" file,
// the standard format every calendar app understands). The app also shows a
// reminder card on Today from two weeks before.

import { fromDateString, toDateString } from './dates.js';

export const SOON_DAYS = 14;
export const QUICK_PICK_MONTHS = [1, 3, 6];
const DAY_MS = 24 * 60 * 60 * 1000;

// Whole calendar days from today to the date (negative = in the past).
export function daysUntil(date, today = new Date()) {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((fromDateString(date) - startOfToday) / DAY_MS);
}

// kind: 'none' | 'later' | 'soon' (within 2 weeks) | 'today' | 'overdue'
// days: days to go, or days late when overdue
export function checkupStatus(checkup, today = new Date()) {
  if (!checkup?.date) return { kind: 'none', days: null };
  const days = daysUntil(checkup.date, today);
  if (days < 0) return { kind: 'overdue', days: -days };
  if (days === 0) return { kind: 'today', days: 0 };
  if (days <= SOON_DAYS) return { kind: 'soon', days };
  return { kind: 'later', days };
}

// The same day of the month, n months later (or the month's last day if shorter).
export function addMonths(today, months) {
  const target = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(today.getDate(), lastDay));
  return toDateString(target);
}

export function validateCheckup(input, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? '')) return { date: 'dateRequired' };
  if (daysUntil(input.date, today) < 0) return { date: 'datePast' };
  if (input.date > addMonths(today, 24)) return { date: 'dateTooFar' };
  return {};
}

export function setCheckup(data, childId, input) {
  const child = data.children.find((c) => c.id === childId);
  child.checkup = { date: input.date, time: input.time || null };
}

export function clearCheckup(data, childId) {
  const child = data.children.find((c) => c.id === childId);
  child.checkup = null;
}

// Builds the text of an .ics calendar file for one check-up.
// All-day: reminders at 9:00 the day before and 9:00 a week before.
// With a time: a one-hour appointment, reminders a day and 2 hours before.
export function makeCalendarFile({ id, date, time, title, note }, now = new Date()) {
  const day = date.replaceAll('-', '');
  let when;
  let reminders;
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    const end = fromDateString(date);
    end.setHours(hours + 1, minutes);
    when = [`DTSTART:${day}T${time.replace(':', '')}00`, `DTEND:${localStamp(end)}`];
    reminders = ['-P1D', '-PT2H'];
  } else {
    const nextDay = fromDateString(date);
    nextDay.setDate(nextDay.getDate() + 1);
    when = [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${toDateString(nextDay).replaceAll('-', '')}`];
    reminders = ['-PT15H', '-P6DT15H'];
  }

  const alarms = reminders.flatMap((trigger) => [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(title)}`,
    `TRIGGER:${trigger}`,
    'END:VALARM',
  ]);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mingmou//Eye check-up//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@mingmou.app`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    ...when,
    `SUMMARY:${escapeText(title)}`,
    ...(note ? [`DESCRIPTION:${escapeText(note)}`] : []),
    ...alarms,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

// '20261215T103000' in the phone's own time zone
function localStamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${toDateString(date).replaceAll('-', '')}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

// Calendar files use \ ; , and line breaks as special characters.
function escapeText(text) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// Calendar files allow at most 75 bytes per line; longer lines continue on the
// next line after a space. Chinese characters take 3 bytes each.
function foldLine(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = '';
  let size = 0;
  let limit = 75;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (size + bytes > limit) {
      parts.push(current);
      current = '';
      size = 0;
      limit = 74; // the leading space takes one byte
    }
    current += char;
    size += bytes;
  }
  parts.push(current);
  return parts.join('\r\n ');
}
