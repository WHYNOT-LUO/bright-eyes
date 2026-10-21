// device.js — questions about the phone and browser the app is running in.

export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPads report as Mac

export const isAndroid = () => /Android/.test(navigator.userAgent);

// WeChat's built-in browser can't add apps to the home screen.
export const isWeChat = () => /MicroMessenger/i.test(navigator.userAgent);

// True when opened from the home-screen icon rather than a browser tab.
export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// Android Chrome (and desktop Chrome/Edge) can show their own "Install" dialog.
// The browser offers it through the "beforeinstallprompt" event; we keep it for our button.
let installPrompt = null;

export function listenForInstallPrompt(onChange) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    onChange();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    onChange();
  });
}

export const canPromptInstall = () => installPrompt !== null;

export async function promptInstall() {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
}
