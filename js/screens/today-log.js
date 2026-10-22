// today-log.js — the card on Today where parents log outdoor and near-work time.
// One tap on +15 / +30 / +60 adds an entry; ✕ in "today's entries" removes one.

import { t } from '../i18n.js';
import { esc, formatClock, formatDuration } from '../ui.js';
import { toDateString } from '../dates.js';
import {
  ACTIVITIES,
  QUICK_ADD_MINUTES,
  addEntry,
  compareToTarget,
  dayTotals,
  getDay,
  goalsFor,
  removeEntry,
} from '../log.js';

const ICONS = { outdoor: '☀️', nearWork: '📖' };

// Remembers whether "today's entries" is open, so it stays open after a redraw.
let entriesOpen = false;

export function logCard(data, child) {
  const day = getDay(data, child.id, toDateString(new Date()));
  const totals = dayTotals(day);
  const goals = goalsFor(child);
  return `
    <section class="card log-card">
      <h2>${t('log.title', { name: esc(child.name) })}</h2>
      ${ACTIVITIES.map((type) => activityBlock(type, totals[type], goals[type])).join('')}
      ${timerRow(data, day)}
      ${entriesList(day)}
    </section>`;
}

// Today's eye breaks, and a shortcut to the 20-20-20 timer.
function timerRow(data, day) {
  const running = data.timer && data.timer.phase !== 'ended';
  return `
    <div class="timer-row">
      <span class="muted small">👀 ${t('log.breaksToday', { count: day.breaks })}</span>
      <a class="timer-link" href="#/timer">⏱️ ${t(running ? 'log.timerRunning' : 'log.startTimer')} ›</a>
    </div>`;
}

export function bindLogCard(main, ctx, child) {
  const shownDate = toDateString(new Date());

  main.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.add;
      const minutes = Number(button.dataset.minutes);
      let added = false;
      ctx.update((d) => {
        added = addEntry(d, child.id, toDateString(new Date()), type, minutes);
      });
      navigator.vibrate?.(10); // a tiny buzz on Android phones
      const message = added
        ? t('log.added', { activity: t('log.' + type), time: formatDuration(minutes) })
        : t('log.full');
      ctx.toast(message, 2500);
    });
  });

  main.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      ctx.update((d) => removeEntry(d, child.id, shownDate, Number(button.dataset.remove)));
      ctx.toast(t('log.removed'), 2500);
    });
  });

  main.querySelector('.entries')?.addEventListener('toggle', (event) => {
    entriesOpen = event.target.open;
  });
}

// Outdoor: a goal to reach. Near-work: a limit to stay under.
function activityBlock(type, total, target) {
  const { ratio, left, over } = compareToTarget(total, target);
  let status;
  if (type === 'outdoor') {
    status = left === 0 ? t('log.outdoorDone') : t('log.outdoorLeft', { time: formatDuration(left) });
  } else if (over > 0) {
    status = t('log.nearWorkOver', { time: formatDuration(over) });
  } else if (left === 0) {
    status = t('log.nearWorkAtLimit');
  } else {
    status = t('log.nearWorkLeft', { time: formatDuration(left) });
  }
  const name = t('log.' + type);
  const buttons = QUICK_ADD_MINUTES.map(
    (minutes) => `
      <button class="btn" type="button" data-add="${type}" data-minutes="${minutes}"
        aria-label="${t('log.addLabel', { activity: name, minutes })}">${t('log.plus', { minutes })}</button>`,
  ).join('');

  return `
    <div class="activity activity-${type} ${over > 0 ? 'is-over' : ''}">
      <div class="activity-head">
        <span class="activity-icon" aria-hidden="true">${ICONS[type]}</span>
        <div class="activity-name">
          <h3>${name}</h3>
          <p class="hint">${t('log.' + type + 'Hint')}</p>
        </div>
        <p class="activity-total">
          <strong>${formatDuration(total)}</strong><br />
          <span class="muted small">/ ${formatDuration(target)}</span>
        </p>
      </div>
      <div class="bar" role="progressbar" aria-label="${name}" aria-valuemin="0" aria-valuemax="${target}"
        aria-valuenow="${Math.min(total, target)}" aria-valuetext="${formatDuration(total)}">
        <span style="width: ${Math.round(ratio * 100)}%"></span>
      </div>
      <p class="activity-status">${status}</p>
      <div class="quick-add">${buttons}</div>
    </div>`;
}

function entriesList(day) {
  if (day.entries.length === 0) return `<p class="hint entries-empty">${t('log.noEntries')}</p>`;

  const items = [...day.entries]
    .reverse() // newest first
    .map(
      (entry) => `
        <li>
          <span class="entry-time">${formatClock(entry.at)}</span>
          <span aria-hidden="true">${ICONS[entry.type]}</span>
          <span class="entry-what">${t('log.' + entry.type)} +${formatDuration(entry.minutes)}</span>
          <button class="icon-btn" type="button" data-remove="${entry.at}" aria-label="${t('log.remove')}">✕</button>
        </li>`,
    )
    .join('');

  return `
    <details class="entries" ${entriesOpen ? 'open' : ''}>
      <summary>${t('log.entries', { count: day.entries.length })}</summary>
      <ul>${items}</ul>
    </details>`;
}
