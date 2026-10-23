// ui.js — small building blocks shared by several screens.

import { t, getLang, LANGS } from './i18n.js';
import { ageFromBirth, formatDiopter } from './children.js';
import { fromDateString } from './dates.js';
import { splitMinutes } from './log.js';
import { esc } from './escape.js';

export { esc };

const locale = () => (getLang() === 'zh' ? 'zh-CN' : 'en');

// Two buttons, 中文 | English. The current language shows as pressed.
export function languageButtons() {
  const buttons = LANGS.map(
    (code) =>
      `<button type="button" data-lang="${code}" aria-pressed="${code === getLang()}">${t('lang.' + code)}</button>`,
  ).join('');
  return `<div class="segmented" role="group" aria-label="${t('settings.language')}">${buttons}</div>`;
}

export function bindLanguageButtons(root, ctx) {
  root.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      ctx.update((d) => {
        d.settings.lang = button.dataset.lang;
      });
    });
  });
}

// '2026-09-01' → '2026年9月1日' or 'Sep 1, 2026'
export function formatDate(text) {
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(fromDateString(text));
}

// '2026-10-16' → '10月16日' or 'Oct 16'
export function formatShortDate(text) {
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' }).format(fromDateString(text));
}

// '2026-10-16' → '周五' or 'Fri'
export function formatWeekday(text) {
  return new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(fromDateString(text));
}

// '2026-12-15', '09:30' → '2026年12月15日周二 09:30' or 'Tue, December 15, 2026 09:30'
export function formatDateLong(text, time) {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
  const date = new Intl.DateTimeFormat(locale(), options).format(fromDateString(text));
  return time ? `${date} ${time}` : date;
}

// A moment (milliseconds since 1970) → '08:15'
export function formatClock(timestamp) {
  return new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
}

// 45 → '45分钟' / '45 min';   135 → '2小时15分钟' / '2 h 15 min'
export function formatDuration(total) {
  const { hours, minutes } = splitMinutes(total);
  if (hours === 0) return t('time.min', { m: minutes });
  if (minutes === 0) return t('time.hour', { h: hours });
  return t('time.hourMin', { h: hours, m: minutes });
}

export function ageLabel(child) {
  const age = ageFromBirth(child.birth);
  return age === null ? '' : t('child.age', { age });
}

// A coloured circle with the first character of the child's name.
export function childAvatar(child) {
  const first = [...child.name][0] ?? '?';
  const colour = [...child.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
  return `<span class="avatar avatar-${colour}" aria-hidden="true">${esc(first)}</span>`;
}

// Show or hide the red message under each form field.
// errors looks like { date: 'datePast' }; the text comes from strings.js: prefix + 'datePast'.
export function showFieldErrors(form, errors, prefix) {
  form.querySelectorAll('[data-error-for]').forEach((message) => {
    const field = message.dataset.errorFor;
    const error = errors[field];
    message.hidden = !error;
    message.textContent = error ? t(prefix + error) : '';
    form.elements[field].setAttribute('aria-invalid', error ? 'true' : 'false');
  });
}

// Hands a file made by the app to the phone (e.g. a calendar file).
export function downloadFile(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// A row of name buttons to switch child, plus "+ Add". Used on Today and Timer.
export function childSwitcher(data, active) {
  const chips = data.children
    .map(
      (c) =>
        `<button class="chip" type="button" data-child="${esc(c.id)}" aria-pressed="${c.id === active.id}">${esc(c.name)}</button>`,
    )
    .join('');
  return `
    <div class="chips" role="group" aria-label="${t('child.switch')}">
      ${chips}
      <a class="chip chip-add" href="#/child/new">＋ ${t('child.add')}</a>
    </div>`;
}

export function bindChildSwitcher(root, ctx) {
  root.querySelectorAll('[data-child]').forEach((button) => {
    button.addEventListener('click', () => {
      ctx.update((d) => {
        d.activeChildId = button.dataset.child;
      });
    });
  });
}

// The prescription as a small table: right/left eye × sphere/cylinder.
export function prescriptionTable(rx) {
  const row = (label, eye) =>
    `<tr><th scope="row">${t(label)}</th><td>${formatDiopter(eye.sph)}</td><td>${formatDiopter(eye.cyl)}</td></tr>`;
  const date = rx.date ? `<p class="muted small">${t('child.rxOn', { date: formatDate(rx.date) })}</p>` : '';
  return `
    <table class="rx-table rx-summary">
      <thead><tr><td></td><th scope="col">${t('child.sph')}</th><th scope="col">${t('child.cyl')}</th></tr></thead>
      <tbody>${row('child.right', rx.right)}${row('child.left', rx.left)}</tbody>
    </table>
    ${date}`;
}
