// Tests for js/i18n.js and content/strings.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { strings } from '../content/strings.js';
import { detectLang, setLang, getLang, t } from '../js/i18n.js';

test('every text exists in both Chinese and English', () => {
  const zhKeys = Object.keys(strings.zh).sort();
  const enKeys = Object.keys(strings.en).sort();
  assert.deepEqual(zhKeys, enKeys);
});

test('no text is left empty', () => {
  for (const lang of ['zh', 'en']) {
    for (const [key, value] of Object.entries(strings[lang])) {
      assert.ok(typeof value === 'string' && value.trim() !== '', `${lang}: "${key}" is empty`);
    }
  }
});

test('detectLang picks Chinese for any Chinese phone setting', () => {
  assert.equal(detectLang(['zh-CN']), 'zh');
  assert.equal(detectLang(['zh-Hans-CN', 'en-US']), 'zh');
  assert.equal(detectLang(['zh-TW']), 'zh');
});

test('detectLang picks English for English, and for languages the app does not have', () => {
  assert.equal(detectLang(['en-US']), 'en');
  assert.equal(detectLang(['fr-FR']), 'en');
  assert.equal(detectLang([]), 'en');
});

test('detectLang uses the first supported language in the phone list', () => {
  assert.equal(detectLang(['ja-JP', 'zh-CN', 'en-US']), 'zh');
  assert.equal(detectLang(['ja-JP', 'en-GB', 'zh-CN']), 'en');
});

test('t() returns text in the current language', () => {
  setLang('en');
  assert.equal(t('tab.today'), 'Today');
  setLang('zh');
  assert.equal(t('tab.today'), '今日');
});

test('t() fills in {placeholders}', () => {
  setLang('en');
  assert.equal(t('settings.version', { version: '1.2.3' }), 'Version 1.2.3');
});

test('t() shows the key itself when a text is missing, so gaps are easy to spot', () => {
  assert.equal(t('no.such.key'), 'no.such.key');
});

test('setLang ignores languages the app does not support', () => {
  setLang('en');
  setLang('fr');
  assert.equal(getLang(), 'en');
});
