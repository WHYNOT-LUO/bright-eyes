// coming-soon.js — stand-in for tabs that later stages will build.

import { t } from '../i18n.js';

export function renderComingSoon(main, ctx, route) {
  main.innerHTML = `
    <section class="card soon">
      <div class="soon-icon" aria-hidden="true">${route.tab.icon}</div>
      <span class="pill">${t('soon.title')}</span>
      <h2>${t('tab.' + route.name)}</h2>
      <p class="muted">${t('soon.body')}</p>
    </section>
  `;
}
