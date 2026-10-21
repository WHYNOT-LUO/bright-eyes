// today.js — the "Today" tab, the first screen parents see.
// Stage 1: welcome card, install help, and the disclaimer.

import { t } from '../i18n.js';
import { isAndroid, isIOS, isInstalled, isWeChat, canPromptInstall, promptInstall } from '../device.js';

export function renderToday(main, ctx) {
  main.innerHTML = `
    <section class="card hero">
      <img src="icons/icon.svg" alt="" width="72" height="72" />
      <h2>${t('app.name')}</h2>
      <p class="muted">${t('app.tagline')}</p>
    </section>

    ${installCard()}

    <section class="card">
      <h3>${t('today.next.title')}</h3>
      <p class="muted">${t('today.next.body')}</p>
    </section>

    <p class="footnote">${t('disclaimer.text')}</p>
  `;

  main.querySelector('[data-action="install"]')?.addEventListener('click', async () => {
    await promptInstall();
    ctx.redraw();
  });
}

// Help for adding the app to the home screen. Hidden once it's installed.
function installCard() {
  if (isWeChat()) {
    return `
      <section class="card card-warn">
        <h3>${t('wechat.title')}</h3>
        <p>${t('wechat.text')}</p>
      </section>`;
  }
  if (isInstalled()) return '';

  let how;
  if (canPromptInstall()) {
    how = `<button class="btn btn-primary btn-block" type="button" data-action="install">${t('install.button')}</button>`;
  } else if (isIOS()) {
    how = `<p>${t('install.ios')}</p>`;
  } else if (isAndroid()) {
    how = `<p>${t('install.android')}</p>`;
  } else {
    return ''; // a computer without an install option: nothing useful to say
  }

  return `
    <section class="card card-tip">
      <h3>${t('install.title')}</h3>
      <p class="muted">${t('install.why')}</p>
      ${how}
    </section>`;
}
