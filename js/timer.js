// timer.js — the 20-20-20 eye-break timer.
// Pure logic with no web-page code, so a WeChat mini-program can reuse it.
//
// The rule: every 20 minutes of close work, look about 20 feet (6 metres) away
// for 20 seconds.
//
// The timer moves through these phases:
//
//   focus ──20 min──▶ due ──tap "start"──▶ break ──20 s──▶ focus …
//                      └──tap "skip"────────────────────▶ focus …
//   (any phase) ──tap "stop"──▶ ended ──log it or not──▶ (no timer)
//
// It never counts ticks. It saves the moment each phase started and compares it
// with the clock, so it stays right even if the phone sleeps or the app is closed.
//
//   data.timer = { childId, sessionStart, phase, phaseStart, breaks, focusMs, breakMs, endedAt }

import { addBreak, addEntry } from './log.js';
import { toDateString } from './dates.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const DURATIONS = {
  normal: { focusMs: 20 * MINUTE, breakMs: 20 * SECOND },
  demo: { focusMs: 15 * SECOND, breakMs: 5 * SECOND }, // for showing the timer in a talk
};

export function startTimer(data, childId, now, durations = DURATIONS.normal) {
  data.timer = {
    childId,
    sessionStart: now,
    phase: 'focus',
    phaseStart: now,
    breaks: 0,
    ...durations,
  };
}

// How long until the current countdown reaches zero.
export function remainingMs(timer, now) {
  const length = timer.phase === 'break' ? timer.breakMs : timer.focusMs;
  return Math.max(length - (now - timer.phaseStart), 0);
}

// Has something happened that the app should react to?
//   'due'       → 20 minutes are up: time to remind the child
//   'breakDone' → the 20-second break is over
export function pendingEvent(timer, now) {
  if (!timer) return null;
  if (timer.phase === 'focus' && now - timer.phaseStart >= timer.focusMs) return 'due';
  if (timer.phase === 'break' && now - timer.phaseStart >= timer.breakMs) return 'breakDone';
  return null;
}

// Moves the timer on if something happened. Returns what happened (or null).
export function tick(data, now) {
  const timer = data.timer;
  const event = pendingEvent(timer, now);
  if (event === 'due') {
    timer.phase = 'due';
    timer.phaseStart += timer.focusMs; // the moment it became due
  } else if (event === 'breakDone') {
    const breakEnd = timer.phaseStart + timer.breakMs;
    timer.breaks += 1;
    addBreak(data, timer.childId, toDateString(new Date(breakEnd)));
    timer.phase = 'focus';
    timer.phaseStart = breakEnd;
  }
  return event;
}

export function beginBreak(data, now) {
  data.timer.phase = 'break';
  data.timer.phaseStart = now;
}

export function skipBreak(data, now) {
  data.timer.phase = 'focus';
  data.timer.phaseStart = now;
}

export function stopTimer(data, now) {
  data.timer.phase = 'ended';
  data.timer.endedAt = now;
}

// Whole minutes since the session started (until it was stopped, if it was).
export function sessionMinutes(timer, now) {
  return Math.round(((timer.endedAt ?? now) - timer.sessionStart) / MINUTE);
}

// Closes a stopped session. With { log: true } its minutes are added to
// near-work time for the day it ended. Returns the minutes logged.
export function finishSession(data, { log }) {
  const timer = data.timer;
  const minutes = sessionMinutes(timer, timer.endedAt);
  data.timer = null;
  if (!log || minutes < 1) return 0;
  const added = addEntry(data, timer.childId, toDateString(new Date(timer.endedAt)), 'nearWork', minutes);
  return added ? minutes : 0;
}

// 65000 → '01:05'. Rounds up, so the display reaches 00:00 exactly at the end.
export function formatCountdown(ms) {
  const totalSeconds = Math.ceil(ms / SECOND);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}
