// store.js — the ONLY file that reads or writes saved data.
//
// Everything the app remembers is kept in one object, saved as text (JSON)
// on this device using the browser's localStorage. Nothing is sent anywhere.
//
// WeChat mini-program port: pass in an object with the same two methods,
// e.g. { getItem: wx.getStorageSync, setItem: wx.setStorageSync }.

export const STORAGE_KEY = 'bright-eyes';

// What a brand-new install looks like. When a later stage adds a new setting,
// add it here with its default value: older saved data gets it automatically.
export function defaultData() {
  return {
    version: 1,
    settings: {
      lang: null, // 'zh' or 'en'; null = follow the phone's language
      welcomed: false, // has the parent seen the welcome screen?
    },
    children: [], // child profiles — see js/children.js
    activeChildId: null, // which child the app is showing
    logs: {}, // daily outdoor / near-work entries — see js/log.js
  };
}

export function createStore(storage = globalThis.localStorage) {
  function load() {
    let text = null;
    try {
      text = storage.getItem(STORAGE_KEY);
    } catch {
      return defaultData(); // some private-browsing modes block storage
    }
    if (!text) return defaultData();

    let saved;
    try {
      saved = JSON.parse(text);
    } catch {
      // Keep the damaged text under another name instead of throwing it away.
      try {
        storage.setItem(STORAGE_KEY + ':damaged', text);
      } catch {}
      return defaultData();
    }

    // Start from the defaults, then lay the saved values on top.
    const fresh = defaultData();
    return { ...fresh, ...saved, settings: { ...fresh.settings, ...saved.settings } };
  }

  // Returns true if saved, false if the phone refused (full, or private mode).
  function save(data) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  return { load, save };
}
