// app.js — starts the app and switches between screens.
//
// How the whole app works:
//  • Everything saved is one object, `data`, loaded from the phone by store.js.
//  • Each screen is a function that draws itself into <main> using `data`.
//  • When the parent changes something, the screen calls ctx.update(...),
//    which changes `data`, saves it, and redraws the page.
//  • The part of the address after # (e.g. #/week) says which tab to show,
//    so the phone's back button works.

import { createStore } from './store.js';
import { t, setLang, getLang, detectLang } from './i18n.js';
import { listenForInstallPrompt } from './device.js';
import { renderToday } from './screens/today.js';
import { renderComingSoon } from './screens/coming-soon.js';
import { renderSettings } from './screens/settings.js';
import { renderWelcome } from './screens/welcome.js';

const APP_VERSION = '0.1.0';

// The tabs along the bottom, in order.
const TABS = [
  { id: 'today', icon: '☀️', render: renderToday },
  { id: 'timer', icon: '⏱️', render: renderComingSoon },
  { id: 'week', icon: '📊', render: renderComingSoon },
  { id: 'learn', icon: '💡', render: renderComingSoon },
  { id: 'settings', icon: '⚙️', render: renderSettings },
];

const store = createStore();
let data = store.load();
const phoneLang = detectLang(navigator.languages ?? [navigator.language]);

// "ctx" (context) is handed to every screen: the data, plus ways to change it.
const ctx = {
  get data() {
    return data;
  },
  version: APP_VERSION,
  update(change) {
    change(data);
    if (!store.save(data)) showToast(t('save.failed'));
    draw();
  },
  redraw: () => draw(),
  toast: (message) => showToast(message),
};

const el = {
  title: document.getElementById('app-title'),
  langToggle: document.getElementById('lang-toggle'),
  screen: document.getElementById('screen'),
  tabbar: document.getElementById('tabbar'),
  overlay: document.getElementById('overlay'),
  toast: document.getElementById('toast'),
  appleTitle: document.querySelector('meta[name="apple-mobile-web-app-title"]'),
};

function currentTab() {
  const id = location.hash.replace('#/', '');
  return TABS.find((tab) => tab.id === id) ?? TABS[0];
}

// Draw the whole page from `data`. Called on start and after every change.
function draw() {
  setLang(data.settings.lang ?? phoneLang);
  document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('app.name');
  el.appleTitle.content = t('app.name'); // name under the icon when added on iPhone

  el.title.textContent = t('app.name');
  el.langToggle.textContent = t('lang.toggle');
  el.langToggle.setAttribute('aria-label', t('lang.toggleLabel'));

  const active = currentTab();
  el.tabbar.setAttribute('aria-label', t('tab.label'));
  el.tabbar.innerHTML = TABS.map(
    (tab) => `
      <a href="#/${tab.id}" ${tab === active ? 'aria-current="page"' : ''}>
        <span class="tab-icon" aria-hidden="true">${tab.icon}</span>
        <span>${t('tab.' + tab.id)}</span>
      </a>`,
  ).join('');

  active.render(el.screen, ctx, active);
  renderWelcome(el.overlay, ctx); // only appears until the parent taps "Get started"
}

let toastTimer;
function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 5000);
}

el.langToggle.addEventListener('click', () => {
  ctx.update((d) => {
    d.settings.lang = getLang() === 'zh' ? 'en' : 'zh';
  });
});

window.addEventListener('hashchange', () => {
  draw();
  window.scrollTo(0, 0);
});

listenForInstallPrompt(draw);

// The service worker (sw.js) keeps a copy of the app on the phone for offline use.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // Not fatal: the app still works, just not offline.
  });
}

draw();
