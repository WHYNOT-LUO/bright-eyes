// log.js — the daily log of outdoor time and near-work time, and daily goals.
// Pure logic with no web-page code, so a WeChat mini-program can reuse it.
//
// Think of it as a diary for each child with one page per day:
//   data.logs = {
//     '<child id>': {
//       '2026-10-22': {
//         entries: [
//           { type: 'outdoor',  minutes: 30, at: 1792600000000 },  // at = when it was tapped
//           { type: 'nearWork', minutes: 60, at: 1792603600000 },
//         ],
//       },
//     },
//   }
// Totals are always added up from the entries, so deleting an entry fixes a mistake.

export const ACTIVITIES = ['outdoor', 'nearWork'];
export const QUICK_ADD_MINUTES = [15, 30, 60];

// Outdoor is a goal to reach; near-work is a limit to stay under.
export const DEFAULT_GOALS = { outdoor: 120, nearWork: 180 };
export const OUTDOOR_GOAL_CHOICES = [30, 60, 90, 120, 150, 180, 210, 240];
export const NEAR_WORK_LIMIT_CHOICES = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

const MINUTES_IN_A_DAY = 24 * 60;

// Read one day's page. Returns an empty page if nothing was logged.
export function getDay(data, childId, date) {
  return data.logs?.[childId]?.[date] ?? { entries: [] };
}

// Returns false (and saves nothing) if the day would go over 24 hours.
export function addEntry(data, childId, date, type, minutes, at = Date.now()) {
  const totals = dayTotals(getDay(data, childId, date));
  if (totals.outdoor + totals.nearWork + minutes > MINUTES_IN_A_DAY) return false;

  data.logs[childId] ??= {};
  data.logs[childId][date] ??= { entries: [] };
  data.logs[childId][date].entries.push({ type, minutes, at });
  return true;
}

// Entries are told apart by `at`, the moment they were added.
export function removeEntry(data, childId, date, at) {
  const day = data.logs?.[childId]?.[date];
  if (!day) return;
  const index = day.entries.findIndex((entry) => entry.at === at);
  if (index !== -1) day.entries.splice(index, 1);
}

export function dayTotals(day) {
  const totals = { outdoor: 0, nearWork: 0 };
  for (const entry of day.entries) totals[entry.type] += entry.minutes;
  return totals;
}

export function goalsFor(child) {
  return { ...DEFAULT_GOALS, ...child.goals };
}

// compareToTarget(45, 120) → { ratio: 0.375, left: 75, over: 0 }
// ratio is how full the progress bar is (never more than 1).
export function compareToTarget(total, target) {
  return {
    ratio: Math.min(total / target, 1),
    left: Math.max(target - total, 0),
    over: Math.max(total - target, 0),
  };
}

export function splitMinutes(total) {
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}
