// ui.js — small building blocks shared by several screens.

import { t, getLang, LANGS } from './i18n.js';
import { ageFromBirth, formatDiopter } from './children.js';
import { fromDateString } from './dates.js';

// Anything a parent types (like a child's name) must pass through esc()
// before it goes into the page, so characters like < or & show as text.
export function esc(text) {
  const safe = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (char) => safe[char]);
}

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
  const locale = getLang() === 'zh' ? 'zh-CN' : 'en';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(fromDateString(text));
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
