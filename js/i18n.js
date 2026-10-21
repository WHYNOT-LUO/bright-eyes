// i18n.js — switching between Chinese and English.
// ("i18n" is programmer shorthand for "internationalisation": 18 letters between i and n.)
//
// All the words themselves live in content/strings.js.
// Screens never write text directly; they ask for it by key:  t('tab.today')

import { strings } from '../content/strings.js';

export const LANGS = ['zh', 'en'];

let current = 'zh';

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (LANGS.includes(lang)) current = lang;
}

// Pick a language from the phone's settings, e.g. ['zh-CN', 'en-US'].
// The first language the app supports wins; anything else falls back to English.
export function detectLang(phoneLanguages = []) {
  for (const tag of phoneLanguages) {
    const code = String(tag).toLowerCase().slice(0, 2);
    if (LANGS.includes(code)) return code;
  }
  return 'en';
}

// t('settings.version', { version: '0.1.0' })  →  'Version 0.1.0'
export function t(key, values = {}) {
  const text = strings[current][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? values[name] : match));
}
