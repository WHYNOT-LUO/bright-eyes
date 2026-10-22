// alerts.js — getting attention: a sound, a buzz, a system notification,
// and keeping the screen on while the timer runs.
//
// Phones limit all of these, so each one is "best effort":
//  • Sound needs one tap first (unlockSound), and may be muted by silent mode.
//  • Buzzing works on Android only.
//  • Notifications need permission; on iPhone only after "Add to Home Screen".
//  • Keeping the screen on works in recent browsers; it switches off if the app is hidden.

let audio = null;

// Call this during a tap, otherwise phones block the sound later.
export function unlockSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audio ??= new AudioContext();
  audio.resume?.();
}

// Notes as [pitch in Hz, start time in seconds]. Made in code, so no sound files.
const TUNES = {
  due: [
    [784, 0],
    [1047, 0.18],
    [784, 0.5],
    [1047, 0.68],
  ],
  done: [
    [1047, 0],
    [1319, 0.15],
  ],
};

export function chime(tune) {
  if (!audio) return;
  audio.resume?.();
  const start = audio.currentTime;
  for (const [pitch, offset] of TUNES[tune]) {
    const note = audio.createOscillator();
    const volume = audio.createGain();
    note.frequency.value = pitch;
    volume.gain.setValueAtTime(0.0001, start + offset);
    volume.gain.exponentialRampToValueAtTime(0.3, start + offset + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.3);
    note.connect(volume).connect(audio.destination);
    note.start(start + offset);
    note.stop(start + offset + 0.32);
  }
}

export function vibrate(pattern) {
  navigator.vibrate?.(pattern);
}

export async function askNotificationPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  try {
    await Notification.requestPermission();
  } catch {
    // Some browsers don't allow asking; the on-screen alert still works.
  }
}

export async function notify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    // Android only allows notifications sent through the service worker (sw.js).
    const worker = await navigator.serviceWorker?.getRegistration();
    const options = { body, icon: 'icons/icon-192.png', tag: 'eye-break', renotify: true };
    if (worker) await worker.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    // Not fatal: the on-screen alert still shows.
  }
}

let wakeLock = null;

export async function keepScreenOn(on) {
  if (!('wakeLock' in navigator)) return;
  try {
    if (on && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch {
    // e.g. battery saver is on. The timer still works, the screen may just dim.
  }
}
