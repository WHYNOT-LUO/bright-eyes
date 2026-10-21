// settings.js — the "Settings" tab.
// Stage 1: language choice, disclaimer, privacy note, version.

import { t } from '../i18n.js';
import { languageButtons, bindLanguageButtons } from '../ui.js';

export function renderSettings(main, ctx) {
  main.innerHTML = `
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
  `;

  bindLanguageButtons(main, ctx);
}
