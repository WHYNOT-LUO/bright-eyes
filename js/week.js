// week.js — the weekly summary: the last 7 days of outdoor time, near-work and breaks.
// Pure logic with no web-page code, so a WeChat mini-program can reuse it.

import { toDateString } from './dates.js';
import { dayTotals, getDay, goalsFor } from './log.js';

export function weekSummary(data, child, today = new Date()) {
  const goals = goalsFor(child);
  const days = [];
  for (let back = 6; back >= 0; back--) {
    const date = toDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - back));
    const day = getDay(data, child.id, date);
    days.push({ date, ...dayTotals(day), breaks: day.breaks });
  }

  const sum = (key) => days.reduce((total, day) => total + day[key], 0);
  return {
    days,
    totals: { outdoor: sum('outdoor'), nearWork: sum('nearWork'), breaks: sum('breaks') },
    outdoorGoalDays: days.filter((day) => day.outdoor >= goals.outdoor).length,
    loggedDays: days.filter((day) => day.outdoor + day.nearWork + day.breaks > 0).length,
  };
}
