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
import { renderLearn } from './screens/learn.js';
import { renderSettings } from './screens/settings.js';
import { renderWelcome } from './screens/welcome.js';
import { renderChildForm } from './screens/child-form.js';
import { renderTimer, tickTimer } from './screens/timer.js';
import { renderCheckupForm } from './screens/checkup-form.js';
import { renderWeek } from './screens/week.js';
import { keepScreenOn } from './alerts.js';

const APP_VERSION = '1.0.0';

// The tabs along the bottom, in order.
const TABS = [
  { id: 'today', icon: '☀️' },
  { id: 'timer', icon: '⏱️' },
  { id: 'week', icon: '📊' },
  { id: 'learn', icon: '💡' },
  { id: 'settings', icon: '⚙️' },
];

// Every screen the app can show, by the name used in the address (#/name).
const SCREENS = {
  today: renderToday,
  timer: renderTimer,
  week: renderWeek,
  learn: renderLearn,
  settings: renderSettings,
  child: renderChildForm, // #/child/new  or  #/child/<id>
  checkup: renderCheckupForm, // #/checkup/<child id>
};

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
  toast: (message, ms) => showToast(message, ms),
  go: (path) => {
    location.hash = '#/' + path;
  },
  back: () => (history.length > 1 ? history.back() : ctx.go('today')),
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

// Read the address: '#/child/abc' → { name: 'child', param: 'abc' }
function currentRoute() {
  const [name, param = ''] = location.hash.replace(/^#\/?/, '').split('/');
  const known = Object.hasOwn(SCREENS, name);
  return {
    name: known ? name : 'today',
    param: known ? decodeURIComponent(param) : '',
    tab: TABS.find((tab) => tab.id === name),
  };
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

  const route = currentRoute();
  const timerBusy = timerRunning();
  el.tabbar.setAttribute('aria-label', t('tab.label'));
  el.tabbar.innerHTML = TABS.map(
    (tab) => `
      <a href="#/${tab.id}" ${tab.id === route.name ? 'aria-current="page"' : ''}
        class="${tab.id === 'timer' && timerBusy ? 'tab-busy' : ''}">
        <span class="tab-icon" aria-hidden="true">${tab.icon}</span>
        <span>${t('tab.' + tab.id)}</span>
      </a>`,
  ).join('');

  SCREENS[route.name](el.screen, ctx, route);
  renderWelcome(el.overlay, ctx); // only appears until the parent taps "Get started"
  if (data.timer?.phase === 'due') document.title = t('timer.titleDue');
}

const timerRunning = () => Boolean(data.timer) && data.timer.phase !== 'ended';

let toastTimer;
function showToast(message, ms = 5000) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), ms);
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

// Coming back to the app (maybe the next morning): refresh Today so it shows the
// right day. Other screens are left alone so a half-filled form isn't wiped.
// Also catch up the timer, and ask again to keep the screen on.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (currentRoute().name === 'today') draw();
  tickTimer(ctx);
  if (timerRunning()) keepScreenOn(true);
});

// The 20-20-20 timer checks the clock once a second.
setInterval(() => tickTimer(ctx), 1000);
if (timerRunning()) keepScreenOn(true);
// Opening the app while an eye break is waiting: show the Timer tab.
if (data.timer?.phase === 'due' && !/^#\/(child|checkup)\//.test(location.hash)) location.hash = '#/timer';

listenForInstallPrompt(draw);

// The service worker (sw.js) keeps a copy of the app on the phone for offline use.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // Not fatal: the app still works, just not offline.
  });
}

draw();
