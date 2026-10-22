// Tests for js/learn.js and content/tips.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tips } from '../content/tips.js';
import { textToHtml, tipText } from '../js/learn.js';

test('every tip card has a unique id, an icon, and a title in both languages', () => {
  const ids = tips.map((tip) => tip.id);
  assert.equal(new Set(ids).size, ids.length, 'two cards share an id');
  for (const tip of tips) {
    assert.ok(tip.icon, `${tip.id}: missing icon`);
    assert.ok(tip.zh?.title?.trim(), `${tip.id}: missing Chinese title`);
    assert.ok(tip.en?.title?.trim(), `${tip.id}: missing English title`);
  }
});

const tip = {
  id: 'x',
  icon: '☀️',
  zh: { title: '户外', body: '' },
  en: { title: 'Outdoors', body: 'Go outside.', source: 'My talk' },
};

test('a card shows its text in the chosen language', () => {
  assert.deepEqual(tipText(tip, 'en'), { title: 'Outdoors', body: 'Go outside.', source: 'My talk', isEmpty: false });
});

test('if one language has no text yet, the other language fills in', () => {
  assert.deepEqual(tipText(tip, 'zh'), { title: '户外', body: 'Go outside.', source: 'My talk', isEmpty: false });
});

test('a card with no text in either language is marked empty', () => {
  const empty = { ...tip, en: { title: 'Outdoors', body: '  ' } };
  assert.equal(tipText(empty, 'zh').isEmpty, true);
});

test('blank lines make paragraphs, "- " makes bullet points, single line breaks are kept', () => {
  const text = 'First line\nsecond line\n\n- one\n- two\n\nLast';
  assert.equal(
    textToHtml(text),
    '<p>First line<br />second line</p><ul><li>one</li><li>two</li></ul><p>Last</p>',
  );
});

test('pasted text cannot add HTML to the page', () => {
  assert.equal(textToHtml('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
});
