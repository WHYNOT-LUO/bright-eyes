// release.js — run `npm run release` after changing any app file, before you commit and push.
//
// It writes a new fingerprint into sw.js. A changed sw.js tells every phone that a
// new version exists, so it downloads the whole app again as one complete set.
// (`npm test` fails if you forget.)

import { fileURLToPath } from 'node:url';
import { cacheNameIn, fingerprint, writeCacheName } from './fingerprint.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const before = cacheNameIn(root);
const after = fingerprint(root);

if (before === after) {
  console.log(`Nothing changed since the last release (fingerprint ${after}).`);
} else {
  writeCacheName(root, after);
  console.log(`sw.js updated: bright-eyes-${before} → bright-eyes-${after}`);
  console.log('Now run `npm test`, then commit and push.');
}
