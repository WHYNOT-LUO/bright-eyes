// learn.js (screen) — the "Learn" tab: myopia-prevention tip cards.
// The cards themselves are in content/tips.js; edit that file to add your talk content.

import { t, getLang } from '../i18n.js';
import { esc } from '../ui.js';
import { tips } from '../../content/tips.js';
import { textToHtml, tipText } from '../learn.js';

export function renderLearn(main) {
  const cards = tips
    .map((tip) => {
      const text = tipText(tip, getLang());
      const body = text.isEmpty ? `<p class="muted">${t('learn.placeholder')}</p>` : textToHtml(text.body);
      const source = text.source ? `<p class="tip-source">${t('learn.source', { source: esc(text.source) })}</p>` : '';
      return `
        <details class="card tip">
          <summary>
            <span class="tip-icon" aria-hidden="true">${tip.icon}</span>
            <span class="tip-title">${esc(text.title)}</span>
            ${text.isEmpty ? `<span class="pill pill-muted">${t('learn.draft')}</span>` : ''}
          </summary>
          <div class="tip-body">${body}${source}</div>
        </details>`;
    })
    .join('');

  main.innerHTML = `
    <div class="learn-intro">
      <h2 class="screen-title">${t('learn.title')}</h2>
      <p class="muted">${t('learn.intro')}</p>
    </div>
    ${cards}
    <p class="footnote">${t('disclaimer.text')}</p>
  `;
}
