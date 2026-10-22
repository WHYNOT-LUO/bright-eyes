// Tests for js/ui.js — run them with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc } from '../js/ui.js';

test('esc() makes typed text safe to put inside the page', () => {
  assert.equal(esc('<b>Tom & "Jerry"</b>'), '&lt;b&gt;Tom &amp; &quot;Jerry&quot;&lt;/b&gt;');
  assert.equal(esc("it's"), 'it&#39;s');
  assert.equal(esc('小明'), '小明');
});
