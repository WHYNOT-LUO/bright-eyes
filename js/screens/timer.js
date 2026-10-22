// timer.js (screen) — the "Timer" tab: the 20-20-20 eye-break timer.
// The timing rules live in js/timer.js; this file draws them and makes the alerts.
//
// Demo mode for presentations: add ?demo to the address, e.g.
//   https://USERNAME.github.io/bright-eyes/?demo#/timer
// and "20 minutes" becomes 15 seconds.

import { t } from '../i18n.js';
import { esc, childSwitcher, bindChildSwitcher, formatDuration } from '../ui.js';
import { getActiveChild } from '../children.js';
import { getDay } from '../log.js';
import { toDateString } from '../dates.js';
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
} from '../timer.js';
import { askNotificationPermission, chime, keepScreenOn, notify, unlockSound, vibrate } from '../alerts.js';

const DEMO = new URLSearchParams(location.search).has('demo');

export function renderTimer(main, ctx) {
  const timer = ctx.data.timer;
  if (!timer) {
    renderStart(main, ctx);
    return;
  }
  const child = ctx.data.children.find((c) => c.id === timer.childId);
  if (timer.phase === 'ended') renderSummary(main, ctx);
  else renderRunning(main, ctx, child);
}

// Called by app.js once a second, whichever tab is showing.
let dueChimes = 0;
let lastChime = 0;

export function tickTimer(ctx) {
  const timer = ctx.data.timer;
  if (!timer || timer.phase === 'ended') return;
  const now = Date.now();
  const event = pendingEvent(timer, now);

  if (event === 'due') {
    ctx.update((d) => tick(d, now));
    dueChimes = 0;
    playDueAlert();
    if (document.hidden) notify(t('timer.notifyTitle'), t('timer.notifyBody'));
    if (!location.hash.startsWith('#/child')) ctx.go('timer'); // don't wipe a half-filled form
  } else if (event === 'breakDone') {
    ctx.update((d) => tick(d, now));
    chime('done');
    ctx.toast(t('timer.breakDone'), 3000);
  } else if (timer.phase === 'due' && !document.hidden && dueChimes < 5 && now - lastChime > 30000) {
    playDueAlert(); // remind again every 30 seconds, up to 5 times
  } else {
    updateDisplay(timer, now);
  }
}

function playDueAlert() {
  dueChimes += 1;
  lastChime = Date.now();
  chime('due');
  vibrate([300, 150, 300]);
}

function renderStart(main, ctx) {
  const child = getActiveChild(ctx.data);
  const intro = `
    ${demoBanner()}
    <section class="card">
      <h2>${t('timer.title')}</h2>
      <p class="muted">${t('timer.intro')}</p>
      <div class="rule">
        <div><strong>20</strong><span class="unit">${t('timer.unitMin')}</span><span class="cap">${t('timer.capWork')}</span></div>
        <div><strong>${t('timer.farNum')}</strong><span class="unit">${t('timer.unitFar')}</span><span class="cap">${t('timer.capFar')}</span></div>
        <div><strong>20</strong><span class="unit">${t('timer.unitSec')}</span><span class="cap">${t('timer.capRest')}</span></div>
      </div>
    </section>`;

  if (!child) {
    main.innerHTML = `
      ${intro}
      <section class="card">
        <p class="muted">${t('timer.needChild')}</p>
        <a class="btn btn-primary btn-block" href="#/child/new">＋ ${t('child.add')}</a>
      </section>`;
    return;
  }

  const breaks = getDay(ctx.data, child.id, toDateString(new Date())).breaks;
  main.innerHTML = `
    ${intro}
    ${ctx.data.children.length > 1 ? childSwitcher(ctx.data, child) : ''}
    <button class="btn btn-primary btn-block btn-big" type="button" data-action="start">
      ▶ ${t('timer.start', { name: esc(child.name) })}
    </button>
    <p class="hint center">${t('timer.keepOpen')}</p>
    <p class="muted center">👀 ${t('log.breaksToday', { count: breaks })}</p>
  `;

  bindChildSwitcher(main, ctx);
  main.querySelector('[data-action="start"]').addEventListener('click', () => {
    unlockSound(); // must happen during this tap, or phones block the sound later
    askNotificationPermission();
    keepScreenOn(true);
    ctx.update((d) => startTimer(d, child.id, Date.now(), DEMO ? DURATIONS.demo : DURATIONS.normal));
  });
}

function renderRunning(main, ctx, child) {
  const timer = ctx.data.timer;
  const phase = timer.phase; // 'focus', 'due' or 'break'

  const middle =
    phase === 'due'
      ? `<div class="timer-due-icon" aria-hidden="true">👀</div>`
      : `<div class="ring">
           <svg viewBox="0 0 200 200" aria-hidden="true">
             <circle class="ring-track" cx="100" cy="100" r="88" />
             <circle class="ring-fill" id="timer-ring" cx="100" cy="100" r="88" pathLength="100" />
           </svg>
           <span class="ring-clock" id="timer-clock"></span>
         </div>`;

  const buttons =
    phase === 'due'
      ? `<button class="btn btn-primary btn-block btn-big" type="button" data-action="break">${t('timer.beginBreak')}</button>
         <button class="btn btn-link btn-block" type="button" data-action="skip">${t('timer.skip')}</button>`
      : '';

  main.innerHTML = `
    ${demoBanner()}
    <section class="card timer-card timer-${phase}">
      <p class="timer-child">${esc(child?.name ?? '')}</p>
      <h2 class="timer-label">${t('timer.' + phase)}</h2>
      ${middle}
      <p class="timer-hint">${t('timer.' + phase + 'Hint')}</p>
      ${buttons}
      <p class="muted small" id="timer-session"></p>
    </section>
    <button class="btn btn-danger btn-block" type="button" data-action="stop">${t('timer.stop')}</button>
  `;

  main.querySelector('[data-action="break"]')?.addEventListener('click', () => {
    unlockSound();
    ctx.update((d) => beginBreak(d, Date.now()));
  });
  main.querySelector('[data-action="skip"]')?.addEventListener('click', () => {
    ctx.update((d) => skipBreak(d, Date.now()));
  });
  main.querySelector('[data-action="stop"]').addEventListener('click', () => {
    keepScreenOn(false);
    ctx.update((d) => stopTimer(d, Date.now()));
  });

  updateDisplay(timer, Date.now());
}

// Only the numbers and the ring change each second, not the whole page.
function updateDisplay(timer, now) {
  const clock = document.getElementById('timer-clock');
  if (clock) {
    const left = remainingMs(timer, now);
    const length = timer.phase === 'break' ? timer.breakMs : timer.focusMs;
    clock.textContent = timer.phase === 'break' ? String(Math.ceil(left / 1000)) : formatCountdown(left);
    document.getElementById('timer-ring').style.strokeDashoffset = String(100 - (left / length) * 100);
  }
  const session = document.getElementById('timer-session');
  if (session) {
    session.textContent = t('timer.session', {
      time: formatDuration(sessionMinutes(timer, now)),
      count: timer.breaks,
    });
  }
}

function renderSummary(main, ctx) {
  const timer = ctx.data.timer;
  const minutes = sessionMinutes(timer);
  const choices =
    minutes >= 1
      ? `<button class="btn btn-primary btn-block" type="button" data-log="yes">${t('timer.logIt')}</button>
         <button class="btn btn-link btn-block" type="button" data-log="no">${t('timer.dontLog')}</button>`
      : `<p class="muted">${t('timer.tooShort')}</p>
         <button class="btn btn-primary btn-block" type="button" data-log="no">${t('timer.ok')}</button>`;

  main.innerHTML = `
    <section class="card timer-card">
      <div class="soon-icon" aria-hidden="true">✅</div>
      <h2>${t('timer.summaryTitle')}</h2>
      <p>${t('timer.summary', { time: formatDuration(minutes), count: timer.breaks })}</p>
      ${choices}
    </section>
  `;

  main.querySelectorAll('[data-log]').forEach((button) => {
    button.addEventListener('click', () => {
      let logged = 0;
      ctx.update((d) => {
        logged = finishSession(d, { log: button.dataset.log === 'yes' });
      });
      if (logged) ctx.toast(t('timer.logged', { time: formatDuration(logged) }));
    });
  });
}

function demoBanner() {
  return DEMO ? `<p class="demo-banner">${t('timer.demo')}</p>` : '';
}
