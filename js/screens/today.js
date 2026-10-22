// today.js — the "Today" tab, the first screen parents see.
// Switch child, log today's outdoor and near-work time, see the child's profile.

import { t } from '../i18n.js';
import { esc, ageLabel, bindChildSwitcher, childAvatar, childSwitcher, prescriptionTable } from '../ui.js';
import { getActiveChild } from '../children.js';
import { isAndroid, isIOS, isInstalled, isWeChat, canPromptInstall, promptInstall } from '../device.js';
import { logCard, bindLogCard } from './today-log.js';

export function renderToday(main, ctx) {
  const child = getActiveChild(ctx.data);

  main.innerHTML = `
    ${child ? childSwitcher(ctx.data, child) + logCard(ctx.data, child) + childCard(child) : startCard()}

    ${installCard()}

    <section class="card">
      <h3>${t('today.next.title')}</h3>
      <p class="muted">${t('today.next.body')}</p>
    </section>

    <p class="footnote">${t('disclaimer.text')}</p>
  `;

  if (child) bindLogCard(main, ctx, child);
  bindChildSwitcher(main, ctx);

  main.querySelector('[data-action="install"]')?.addEventListener('click', async () => {
    await promptInstall();
    ctx.redraw();
  });
}

// No children yet: say hello and ask the parent to add one.
function startCard() {
  return `
    <section class="card hero">
      <img src="icons/icon.svg" alt="" width="72" height="72" />
      <h2>${t('app.name')}</h2>
      <p class="muted">${t('app.tagline')}</p>
    </section>
    <section class="card">
      <h3>${t('today.start.title')}</h3>
      <p class="muted">${t('today.start.body')}</p>
      <a class="btn btn-primary btn-block" href="#/child/new">＋ ${t('child.add')}</a>
    </section>`;
}

function childCard(child) {
  return `
    <section class="card">
      <div class="child-head">
        ${childAvatar(child)}
        <div class="child-name">
          <h2>${esc(child.name)}</h2>
          <p class="muted">${ageLabel(child)}</p>
        </div>
        <a class="btn btn-secondary btn-small" href="#/child/${esc(child.id)}">${t('child.edit')}</a>
      </div>
      ${child.rx ? prescriptionTable(child.rx) : `<p class="muted">${t('child.noRx')}</p>`}
    </section>`;
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
