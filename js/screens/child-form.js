// child-form.js — add or edit a child's profile.
// Address: #/child/new (add) or #/child/<id> (edit).

import { t } from '../i18n.js';
import { esc, formatDuration } from '../ui.js';
import { toDateString, toMonthString } from '../dates.js';
import {
  CYLINDER_RANGE,
  MAX_AGE,
  SPHERE_RANGE,
  ageFromBirth,
  diopterChoices,
  formatDiopter,
  removeChild,
  saveChild,
  validateChild,
} from '../children.js';
import { NEAR_WORK_LIMIT_CHOICES, OUTDOOR_GOAL_CHOICES, goalsFor } from '../log.js';

const NO_PRESCRIPTION = { date: null, right: { sph: null, cyl: null }, left: { sph: null, cyl: null } };

export function renderChildForm(main, ctx, route) {
  const existing = ctx.data.children.find((c) => c.id === route.param);
  if (route.param !== 'new' && !existing) {
    ctx.go('today'); // unknown child, e.g. after it was deleted
    return;
  }
  const child = existing ?? { name: '', birth: '' };
  const rx = existing?.rx ?? NO_PRESCRIPTION;
  const goals = goalsFor(child);

  const today = new Date();
  const oldestBirth = new Date(today.getFullYear() - MAX_AGE, today.getMonth() + 1, 1);

  main.innerHTML = `
    <button class="back-link" type="button" data-action="back">‹ ${t('child.back')}</button>
    <h2 class="screen-title">${t(existing ? 'child.editTitle' : 'child.newTitle')}</h2>

    <form class="card form" novalidate>
      <div class="field">
        <label for="child-name">${t('child.name')}</label>
        <input id="child-name" name="name" type="text" maxlength="20" autocomplete="off"
          placeholder="${t('child.namePlaceholder')}" value="${esc(child.name)}" />
        <p class="hint">${t('child.nameHint')}</p>
        <p class="field-error" data-error-for="name" hidden></p>
      </div>

      <div class="field">
        <label for="child-birth">${t('child.birth')}</label>
        <input id="child-birth" name="birth" type="month" value="${esc(child.birth)}"
          min="${toMonthString(oldestBirth)}" max="${toMonthString(today)}" />
        <p class="hint" data-age>${ageHint(child.birth)}</p>
        <p class="field-error" data-error-for="birth" hidden></p>
      </div>

      <fieldset class="field">
        <legend>${t('child.goals')}</legend>
        <p class="hint">${t('child.goalsHint')}</p>
        <label for="goal-outdoor">${t('child.goalOutdoor')}</label>
        ${minutesSelect('goal-outdoor', 'goalOutdoor', OUTDOOR_GOAL_CHOICES, goals.outdoor)}
        <label for="goal-near-work">${t('child.goalNearWork')}</label>
        ${minutesSelect('goal-near-work', 'goalNearWork', NEAR_WORK_LIMIT_CHOICES, goals.nearWork)}
      </fieldset>

      <fieldset class="field">
        <legend>${t('child.rx')}</legend>
        <p class="hint">${t('child.rxHint')}</p>
        <table class="rx-table">
          <thead><tr><td></td><th scope="col">${t('child.sph')}</th><th scope="col">${t('child.cyl')}</th></tr></thead>
          <tbody>
            ${eyeRow('right', rx.right)}
            ${eyeRow('left', rx.left)}
          </tbody>
        </table>
        <label for="rx-date">${t('child.rxDate')}</label>
        <input id="rx-date" name="rxDate" type="date" value="${rx.date ?? ''}" max="${toDateString(today)}" />
        <p class="field-error" data-error-for="rxDate" hidden></p>
      </fieldset>

      <button class="btn btn-primary btn-block" type="submit">${t('child.save')}</button>
      ${existing ? `<button class="btn btn-danger btn-block" type="button" data-action="delete">${t('child.delete')}</button>` : ''}
    </form>
  `;

  const form = main.querySelector('form');

  main.querySelector('[data-action="back"]').addEventListener('click', ctx.back);

  // Show the age as soon as a birth month is picked.
  form.elements.birth.addEventListener('input', () => {
    main.querySelector('[data-age]').textContent = ageHint(form.elements.birth.value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = readForm(form, existing?.id);
    const errors = validateChild(input);
    showErrors(form, errors);
    if (Object.keys(errors).length > 0) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    ctx.update((d) => saveChild(d, input));
    ctx.toast(t('child.saved'));
    ctx.back();
  });

  main.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
    if (!confirm(t('child.deleteConfirm', { name: existing.name }))) return;
    ctx.update((d) => removeChild(d, existing.id));
    ctx.toast(t('child.deleted'));
    ctx.back();
  });
}

function ageHint(birth) {
  const age = ageFromBirth(birth);
  return age === null || age < 0 ? t('child.birthHint') : t('child.age', { age });
}

function eyeRow(eye, values) {
  const label = t('child.' + eye);
  return `
    <tr>
      <th scope="row">${label}</th>
      <td>${diopterSelect(`${eye}-sph`, values.sph, SPHERE_RANGE, `${label} ${t('child.sph')}`)}</td>
      <td>${diopterSelect(`${eye}-cyl`, values.cyl, CYLINDER_RANGE, `${label} ${t('child.cyl')}`)}</td>
    </tr>`;
}

// A drop-down (a scrolling wheel on iPhone) instead of typing, because the
// iPhone number keypad has no minus key, and most values here are negative.
function diopterSelect(name, value, range, label) {
  const { minus, plus } = diopterChoices(range.min, range.max);
  const option = (v) => `<option value="${v}" ${v === value ? 'selected' : ''}>${formatDiopter(v)}</option>`;
  return `
    <select name="${name}" aria-label="${label}">
      <option value="" ${value === null ? 'selected' : ''}>${t('child.notSet')}</option>
      ${option(0)}
      <optgroup label="${t('child.minus')}">${minus.map(option).join('')}</optgroup>
      <optgroup label="${t('child.plus')}">${plus.map(option).join('')}</optgroup>
    </select>`;
}

function minutesSelect(id, name, choices, value) {
  const options = choices
    .map((m) => `<option value="${m}" ${m === value ? 'selected' : ''}>${formatDuration(m)}</option>`)
    .join('');
  return `<select id="${id}" name="${name}">${options}</select>`;
}

function readForm(form, id) {
  const fields = new FormData(form);
  const number = (name) => (fields.get(name) ? Number(fields.get(name)) : null);
  return {
    id,
    name: fields.get('name') ?? '',
    birth: fields.get('birth') ?? '',
    goals: { outdoor: number('goalOutdoor'), nearWork: number('goalNearWork') },
    rx: {
      date: fields.get('rxDate'),
      right: { sph: number('right-sph'), cyl: number('right-cyl') },
      left: { sph: number('left-sph'), cyl: number('left-cyl') },
    },
  };
}

function showErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach((message) => {
    const field = message.dataset.errorFor;
    const error = errors[field];
    message.hidden = !error;
    message.textContent = error ? t('child.error.' + error) : '';
    form.elements[field].setAttribute('aria-invalid', error ? 'true' : 'false');
  });
}
