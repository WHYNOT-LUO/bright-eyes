// fingerprint.js — a short code that changes whenever any app file changes.
// Used by `npm run release` (to write it into sw.js) and by the tests (to check it).

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const readServiceWorker = (root) => readFileSync(join(root, 'sw.js'), 'utf8');

// The files listed in APP_FILES in sw.js, e.g. 'js/app.js' ('./' is left out).
export function listedFiles(root) {
  const block = readServiceWorker(root).match(/const APP_FILES = \[([\s\S]*?)\];/)[1];
  return [...block.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter((path) => path !== '');
}

// First 10 characters of a SHA-256 hash of every listed file's name and contents.
export function fingerprint(root) {
  const hash = createHash('sha256');
  for (const file of listedFiles(root).sort()) {
    hash.update(file);
    hash.update(readFileSync(join(root, file)));
  }
  return hash.digest('hex').slice(0, 10);
}

// The fingerprint currently written in sw.js:  const CACHE = 'bright-eyes-<fingerprint>';
export function cacheNameIn(root) {
  return readServiceWorker(root).match(/const CACHE = 'bright-eyes-([0-9a-f]+)';/)?.[1] ?? null;
}

export function writeCacheName(root, code) {
  const updated = readServiceWorker(root).replace(
    /const CACHE = 'bright-eyes-[^']*';/,
    `const CACHE = 'bright-eyes-${code}';`,
  );
  writeFileSync(join(root, 'sw.js'), updated);
}
