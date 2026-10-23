// dates.js — turning dates into the short text the app saves, and back.
// Dates are saved as text like '2026-10-22' (day) or '2026-10' (month),
// always in the phone's local time.

// 5 → '05'
export const pad = (n) => String(n).padStart(2, '0');

export const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const toMonthString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

export function fromDateString(text) {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day);
}
