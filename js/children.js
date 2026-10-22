// children.js — child profiles: add, edit, remove, and work out age.
// Pure logic with no web-page code, so a WeChat mini-program can reuse it.
//
// A saved child looks like this:
//   {
//     id: 'b3f1…',
//     name: '小明',
//     birth: '2018-05',            // birth month; age is worked out from it
//     rx: {                        // latest eye-test prescription, or null
//       date: '2026-09-01',
//       right: { sph: -1.5, cyl: -0.5 },
//       left:  { sph: -1.25, cyl: null },
//     },
//     goals: { outdoor: 120, nearWork: 180 },   // minutes a day; see js/log.js
//   }
// sph = sphere (球镜), cyl = cylinder (柱镜), in dioptres.
// A sphere of -1.50 is what people call "150 度".

import { toDateString } from './dates.js';

export const SPHERE_RANGE = { min: -15, max: 8 };
export const CYLINDER_RANGE = { min: -6, max: 4 };
export const MAX_AGE = 18;

// Months from the birth month to this month (negative = in the future).
function monthsSinceBirth(birth, today) {
  const match = /^(\d{4})-(\d{2})$/.exec(birth ?? '');
  if (!match) return null;
  const [, year, month] = match.map(Number);
  return (today.getFullYear() - year) * 12 + (today.getMonth() + 1 - month);
}

// The birth month itself counts as the birthday, since we don't store the day.
export function ageFromBirth(birth, today = new Date()) {
  const months = monthsSinceBirth(birth, today);
  return months === null ? null : Math.floor(months / 12);
}

// -1.5 → '-1.50',  0.25 → '+0.25',  0 → '0.00',  null → '—'
export function formatDiopter(value) {
  if (value === null || value === undefined) return '—';
  if (value === 0) return '0.00';
  return (value > 0 ? '+' : '') + value.toFixed(2);
}

// Every value a prescription can have, in steps of 0.25.
// Minus values come first because most children in this app are short-sighted.
export function diopterChoices(min, max) {
  const minus = [];
  for (let step = 1; step * 0.25 <= -min; step++) minus.push(-step * 0.25);
  const plus = [];
  for (let step = 1; step * 0.25 <= max; step++) plus.push(step * 0.25);
  return { minus, plus };
}

// Returns problems as { field: 'errorName' }. An empty object means all good.
export function validateChild(child, today = new Date()) {
  const errors = {};
  if (!child.name?.trim()) errors.name = 'nameRequired';

  const months = monthsSinceBirth(child.birth, today);
  if (months === null) errors.birth = 'birthRequired';
  else if (months < 0) errors.birth = 'birthFuture';
  else if (months >= MAX_AGE * 12) errors.birth = 'birthTooOld';

  if (child.rx?.date && child.rx.date > toDateString(today)) errors.rxDate = 'rxDateFuture';
  return errors;
}

// Adds a new child, or updates one that has the same id. Returns the child's id.
// A newly added child becomes the active (selected) child.
export function saveChild(data, input, makeId = newId) {
  const child = {
    id: input.id || makeId(),
    name: input.name.trim(),
    birth: input.birth,
    rx: cleanPrescription(input.rx),
  };
  if (input.goals) child.goals = { outdoor: input.goals.outdoor, nearWork: input.goals.nearWork };

  const index = data.children.findIndex((c) => c.id === child.id);
  if (index === -1) {
    data.children.push(child);
    data.activeChildId = child.id;
  } else {
    data.children[index] = { ...data.children[index], ...child };
  }
  return child.id;
}

// Removes the child, everything logged for them, and their running timer.
export function removeChild(data, id) {
  data.children = data.children.filter((c) => c.id !== id);
  delete data.logs[id];
  if (data.timer?.childId === id) data.timer = null;
  if (data.activeChildId === id) data.activeChildId = data.children[0]?.id ?? null;
}

export function getActiveChild(data) {
  return data.children.find((c) => c.id === data.activeChildId) ?? data.children[0] ?? null;
}

// Nothing filled in at all → null, so "no prescription" is easy to check.
function cleanPrescription(rx) {
  if (!rx) return null;
  const eye = (e) => ({ sph: e?.sph ?? null, cyl: e?.cyl ?? null });
  const clean = { date: rx.date || null, right: eye(rx.right), left: eye(rx.left) };
  const values = [clean.right.sph, clean.right.cyl, clean.left.sph, clean.left.cyl];
  const empty = !clean.date && values.every((v) => v === null);
  return empty ? null : clean;
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
}
