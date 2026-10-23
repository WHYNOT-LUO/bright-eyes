// escape.js — making typed or pasted text safe to put inside the page.

// Anything a parent types (like a child's name) must pass through esc()
// before it goes into the page, so characters like < or & show as text.
export function esc(text) {
  const safe = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, (char) => safe[char]);
}
