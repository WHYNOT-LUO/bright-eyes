// checkup-ui.js — check-up reminders on Today:
//  • a reminder card when a child's check-up is within 2 weeks, today, or missed
//  • a "next check-up" line in each child's card
//  • the "add to phone calendar" button

import { t } from '../i18n.js';
import { esc, downloadFile, formatDateLong } from '../ui.js';
import { checkupStatus, makeCalendarFile } from '../checkup.js';

export function checkupBanners(data) {
  return data.children.map(banner).join('');
}

function banner(child) {
  const status = checkupStatus(child.checkup);
  const name = esc(child.name);
  const id = esc(child.id);
  const updateRx = `<a class="btn btn-secondary btn-small" href="#/child/${id}">${t('checkup.updateRx')}</a>`;
  const setNext = `<a class="btn btn-primary btn-small" href="#/checkup/${id}">${t('checkup.setNext')}</a>`;

  let title;
  let hint;
  let buttons;
  if (status.kind === 'soon') {
    title =
      status.days === 1
        ? t('checkup.banner.tomorrow', { name })
        : t('checkup.banner.soon', { name, days: status.days });
    hint = formatDateLong(child.checkup.date, child.checkup.time);
    buttons = calendarButton(child, 'btn btn-primary btn-small');
  } else if (status.kind === 'today') {
    title = t('checkup.banner.today', { name });
    hint = t('checkup.banner.todayHint');
    buttons = updateRx + setNext;
  } else if (status.kind === 'overdue') {
    title = t('checkup.banner.overdue', { name, days: status.days });
    hint = t('checkup.banner.overdueHint');
    buttons = updateRx + setNext;
  } else {
    return ''; // no check-up set, or more than 2 weeks away
  }

  return `
    <section class="card ${status.kind === 'soon' ? 'card-tip' : 'card-warn'} checkup-banner">
      <h3>🩺 ${title}</h3>
      <p>${hint}</p>
      <div class="button-row">${buttons}</div>
    </section>`;
}

// The "next check-up" line inside a child's card.
export function checkupRow(child) {
  const status = checkupStatus(child.checkup);
  const id = esc(child.id);
  if (status.kind === 'none') {
    return `
      <div class="checkup-row">
        <span class="muted">🩺 ${t('checkup.none')}</span>
        <a class="btn btn-secondary btn-small" href="#/checkup/${id}">${t('checkup.set')}</a>
      </div>`;
  }
  const upcoming = status.kind === 'soon' || status.kind === 'later';
  return `
    <div class="checkup-row">
      <div>
        <span class="muted small">🩺 ${t('checkup.title')} · ${relativeDay(status)}</span><br />
        <strong>${formatDateLong(child.checkup.date, child.checkup.time)}</strong>
      </div>
      <a class="btn btn-secondary btn-small" href="#/checkup/${id}">${t('checkup.change')}</a>
    </div>
    ${upcoming ? calendarButton(child, 'btn btn-link calendar-link') : ''}`;
}

function relativeDay(status) {
  if (status.kind === 'today') return t('checkup.isToday');
  if (status.kind === 'overdue') return t('checkup.daysLate', { days: status.days });
  if (status.days === 1) return t('checkup.tomorrow');
  return t('checkup.inDays', { days: status.days });
}

function calendarButton(child, classes) {
  return `<button class="${classes}" type="button" data-calendar="${esc(child.id)}">📅 ${t('checkup.addToCalendar')}</button>`;
}

export function bindCheckupButtons(root, ctx) {
  root.querySelectorAll('[data-calendar]').forEach((button) => {
    button.addEventListener('click', () => {
      const child = ctx.data.children.find((c) => c.id === button.dataset.calendar);
      const { date, time } = child.checkup;
      const file = makeCalendarFile({
        id: `${child.id}-${date}`,
        date,
        time,
        title: t('checkup.calendarTitle', { name: child.name }),
        note: t('checkup.calendarNote'),
      });
      downloadFile(`eye-checkup-${date}.ics`, file, 'text/calendar');
      ctx.toast(t('checkup.downloaded'));
    });
  });
}
