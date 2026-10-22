// sw.js — the "service worker": a small helper the browser runs in the background.
// It keeps a copy of the app's files on the phone, so the app
//   • opens instantly, even on a slow connection, and
//   • works with no internet at all.
//
// How it answers each request ("stale-while-revalidate"):
//   1. Reply straight away with the saved copy.
//   2. Meanwhile, download the newest version and save it for next time.
// So after you publish an update, families see it the SECOND time they open the app.
//
// On your own computer (localhost) it does the opposite — fresh files first —
// so your edits show up on a normal reload while you're building.

const CACHE = 'bright-eyes-v1';

// Saved on the very first visit, so the app works offline straight away.
// When you add a new file to the app, add it here too (`npm test` will remind you).
const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/alerts.js',
  './js/app.js',
  './js/checkup.js',
  './js/children.js',
  './js/dates.js',
  './js/device.js',
  './js/i18n.js',
  './js/log.js',
  './js/store.js',
  './js/timer.js',
  './js/ui.js',
  './js/screens/checkup-form.js',
  './js/screens/checkup-ui.js',
  './js/screens/child-form.js',
  './js/screens/coming-soon.js',
  './js/screens/settings.js',
  './js/screens/timer.js',
  './js/screens/today-log.js',
  './js/screens/today.js',
  './js/screens/welcome.js',
  './content/strings.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
];

const ON_MY_COMPUTER = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

// Remove copies saved under an older CACHE name.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(ON_MY_COMPUTER ? freshFirst(request) : savedFirst(request, event));
});

async function savedFirst(request, event) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request, { ignoreSearch: true });
  const download = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  if (saved) {
    event.waitUntil(download.catch(() => {})); // update quietly in the background
    return saved;
  }
  try {
    return await download;
  } catch {
    return offline(request, cache);
  }
}

async function freshFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request.url, { cache: 'no-store' });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? offline(request, cache);
  }
}

// Tapping an eye-break notification brings the app to the front.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => (windows[0] ? windows[0].focus() : self.clients.openWindow('./#/timer'))),
  );
});

// No saved copy and no internet: for a page, show the app; otherwise give up.
async function offline(request, cache) {
  if (request.mode === 'navigate') return (await cache.match('./index.html')) ?? Response.error();
  return Response.error();
}
