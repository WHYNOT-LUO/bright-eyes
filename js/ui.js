// ui.js — small building blocks shared by several screens.

import { t, getLang, LANGS } from './i18n.js';

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
