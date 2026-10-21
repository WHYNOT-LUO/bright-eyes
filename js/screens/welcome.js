// welcome.js — the sheet shown on first launch: what the app does,
// the disclaimer, the privacy promise, and a language choice.

import { t } from '../i18n.js';
import { languageButtons, bindLanguageButtons } from '../ui.js';

export function renderWelcome(overlay, ctx) {
  if (ctx.data.settings.welcomed) {
    overlay.hidden = true;
    overlay.innerHTML = '';
    document.body.classList.remove('no-scroll');
    return;
  }

  const justOpened = overlay.hidden; // slide up only the first time, not on every redraw
  overlay.hidden = false;
  document.body.classList.add('no-scroll');
  overlay.innerHTML = `
    <div class="sheet ${justOpened ? 'slide-up' : ''}" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <img class="sheet-icon" src="icons/icon.svg" alt="" width="64" height="64" />
      <h2 id="welcome-title">${t('welcome.title')}</h2>
      <p>${t('welcome.body')}</p>

      <div class="notice">
        <strong>${t('disclaimer.title')}</strong>
        <p>${t('disclaimer.text')}</p>
      </div>
      <p class="muted small">🔒 ${t('privacy.text')}</p>

      <h3>${t('welcome.language')}</h3>
      ${languageButtons()}

      <button class="btn btn-primary btn-block" type="button" data-action="start">${t('welcome.start')}</button>
    </div>
  `;

  bindLanguageButtons(overlay, ctx);
  overlay.querySelector('[data-action="start"]').addEventListener('click', () => {
    ctx.update((d) => {
      d.settings.welcomed = true;
    });
  });
}
