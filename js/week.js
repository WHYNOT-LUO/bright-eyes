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
  const totals = { outdoor: sum('outdoor'), nearWork: sum('nearWork'), breaks: sum('breaks') };
  const loggedDays = days.filter((day) => day.outdoor + day.nearWork + day.breaks > 0).length;
  // Averages leave out days with nothing logged, so a forgotten day doesn't drag them down.
  const average = (total) => (loggedDays ? Math.round(total / loggedDays) : 0);

  return {
    days,
    totals,
    averages: { outdoor: average(totals.outdoor), nearWork: average(totals.nearWork) },
    outdoorGoalDays: days.filter((day) => day.outdoor >= goals.outdoor).length,
    loggedDays,
  };
}

// The chart's height in minutes and its gridlines, at round steps
// (half-hours, hours, 2 h, 3 h …) with at most 4 lines above zero.
const STEPS = [30, 60, 120, 180, 240, 360];

export function chartScale(largest) {
  const top = largest > 0 ? largest : 60;
  const step = STEPS.find((s) => top / s <= 4) ?? STEPS[STEPS.length - 1];
  const max = Math.ceil(top / step) * step;
  const ticks = [];
  for (let value = 0; value <= max; value += step) ticks.push(value);
  return { max, ticks };
}
