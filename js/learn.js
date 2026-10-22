// learn.js — turning the cards in content/tips.js into text for the Learn tab.

import { esc } from './ui.js';

// The card's text in the chosen language. Anything missing in that language
// is taken from the other one, so a half-translated card still shows something.
export function tipText(tip, lang) {
  const other = lang === 'zh' ? 'en' : 'zh';
  const pick = (field) => {
    const own = tip[lang]?.[field]?.trim();
    return own || tip[other]?.[field]?.trim() || '';
  };
  const body = pick('body');
  return { title: pick('title'), body, source: pick('source'), isEmpty: body === '' };
}

// Plain text → HTML: a blank line starts a paragraph, "- " lines become a bullet list.
// Everything is escaped first, so pasted text can never add HTML to the page.
export function textToHtml(text) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.every((line) => line.startsWith('- '))) {
        return `<ul>${lines.map((line) => `<li>${esc(line.slice(2))}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.map(esc).join('<br />')}</p>`;
    })
    .join('');
}
