// settings.js — the "Settings" tab.
// Children's profiles, language choice, disclaimer, privacy note, version.

import { t } from '../i18n.js';
import { esc, ageLabel, childAvatar, languageButtons, bindLanguageButtons } from '../ui.js';
import { clearAllData } from '../store.js';
import { keepScreenOn } from '../alerts.js';

export function renderSettings(main, ctx) {
  const rows = ctx.data.children
    .map(
      (child) => `
        <li>
          <a class="list-row" href="#/child/${esc(child.id)}">
            ${childAvatar(child)}
            <span class="list-main">
              <strong>${esc(child.name)}</strong>
              <span class="muted small">${ageLabel(child)}</span>
            </span>
            <span class="chevron" aria-hidden="true">›</span>
          </a>
        </li>`,
    )
    .join('');

  main.innerHTML = `
    <section class="card">
      <h2>${t('settings.children')}</h2>
      ${rows ? `<ul class="list">${rows}</ul>` : ''}
      <a class="btn btn-secondary btn-block" href="#/child/new">＋ ${t('child.add')}</a>
    </section>

    <section class="card">
      <h2>${t('settings.language')}</h2>
      ${languageButtons()}
    </section>

    <section class="card">
      <h2>${t('settings.about')}</h2>
      <h3>${t('disclaimer.title')}</h3>
      <p>${t('disclaimer.text')}</p>
      <h3>${t('privacy.title')}</h3>
      <p>${t('privacy.text')}</p>
      <p class="muted small">${t('settings.version', { version: ctx.version })}</p>
    </section>

    <section class="card">
      <h2>${t('settings.data')}</h2>
      <p class="muted">${t('settings.dataNote')}</p>
      <button class="btn btn-danger btn-block" type="button" data-action="delete-all">${t('settings.deleteAll')}</button>
    </section>
  `;

  bindLanguageButtons(main, ctx);

  main.querySelector('[data-action="delete-all"]').addEventListener('click', () => {
    if (!confirm(t('settings.deleteAllConfirm'))) return;
    keepScreenOn(false); // in case a timer was running
    ctx.update(clearAllData);
    ctx.toast(t('settings.deletedAll'));
    ctx.go('today');
  });
}
