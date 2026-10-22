// checkup-form.js — set the date of a child's next eye check-up.
// Address: #/checkup/<child id>

import { t } from '../i18n.js';
import { esc, childAvatar, showFieldErrors } from '../ui.js';
import { toDateString } from '../dates.js';
import { QUICK_PICK_MONTHS, addMonths, clearCheckup, setCheckup, validateCheckup } from '../checkup.js';

export function renderCheckupForm(main, ctx, route) {
  const child = ctx.data.children.find((c) => c.id === route.param);
  if (!child) {
    ctx.go('today'); // unknown child, e.g. after it was deleted
    return;
  }
  const today = new Date();
  const current = child.checkup ?? { date: '', time: null };

  const quickPicks = QUICK_PICK_MONTHS.map(
    (n) =>
      `<button class="chip" type="button" data-months="${n}" aria-pressed="false">${t(n === 1 ? 'checkup.inOneMonth' : 'checkup.inMonths', { n })}</button>`,
  ).join('');

  main.innerHTML = `
    <button class="back-link" type="button" data-action="back">‹ ${t('child.back')}</button>
    <h2 class="screen-title">${t('checkup.setTitle')}</h2>

    <form class="card form" novalidate>
      <div class="checkup-child">${childAvatar(child)}<strong>${esc(child.name)}</strong></div>

      <div class="field">
        <span class="field-label">${t('checkup.quick')}</span>
        <div class="quick-pick">${quickPicks}</div>
        <p class="hint">${t('checkup.hint')}</p>
      </div>

      <div class="field">
        <label for="checkup-date">${t('checkup.date')}</label>
        <input id="checkup-date" name="date" type="date" value="${current.date}"
          min="${toDateString(today)}" max="${addMonths(today, 24)}" />
        <p class="field-error" data-error-for="date" hidden></p>
      </div>

      <div class="field">
        <label for="checkup-time">${t('checkup.time')}</label>
        <input id="checkup-time" name="time" type="time" value="${current.time ?? ''}" />
      </div>

      <button class="btn btn-primary btn-block" type="submit">${t('checkup.save')}</button>
      ${child.checkup ? `<button class="btn btn-danger btn-block" type="button" data-action="clear">${t('checkup.clear')}</button>` : ''}
    </form>
  `;

  const form = main.querySelector('form');
  main.querySelector('[data-action="back"]').addEventListener('click', ctx.back);

  // "In 3 months" fills in the date; the parent can still adjust it.
  form.querySelectorAll('[data-months]').forEach((button) => {
    button.addEventListener('click', () => {
      form.elements.date.value = addMonths(new Date(), Number(button.dataset.months));
      form.querySelectorAll('[data-months]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = { date: form.elements.date.value, time: form.elements.time.value };
    const errors = validateCheckup(input);
    showFieldErrors(form, errors, 'checkup.error.');
    if (Object.keys(errors).length > 0) {
      form.elements.date.focus();
      return;
    }
    ctx.update((d) => setCheckup(d, child.id, input));
    ctx.toast(t('checkup.saved'));
    ctx.back();
  });

  main.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
    ctx.update((d) => clearCheckup(d, child.id));
    ctx.toast(t('checkup.cleared'));
    ctx.back();
  });
}
