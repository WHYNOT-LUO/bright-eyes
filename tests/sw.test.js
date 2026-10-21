// Checks that sw.js lists every file the app needs to work offline,
// and nothing that doesn't exist. Run with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function listedInServiceWorker() {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const block = sw.match(/const APP_FILES = \[([\s\S]*?)\];/)[1];
  return [...block.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter((path) => path !== '');
}

function filesIn(folder) {
  return readdirSync(join(root, folder), { recursive: true })
    .map((name) => `${folder}/${name}`)
    .filter((path) => statSync(join(root, path)).isFile() && !path.endsWith('.DS_Store'));
}

const appFiles = [
  'index.html',
  'manifest.webmanifest',
  ...filesIn('css'),
  ...filesIn('js'),
  ...filesIn('content'),
  ...filesIn('icons'),
];

test('sw.js lists every app file, so the app works offline', () => {
  const listed = listedInServiceWorker();
  const missing = appFiles.filter((path) => !listed.includes(path));
  assert.deepEqual(missing, [], 'Add these to APP_FILES in sw.js');
});

test('every file listed in sw.js really exists', () => {
  const ghosts = listedInServiceWorker().filter((path) => !existsSync(join(root, path)));
  assert.deepEqual(ghosts, [], 'Remove these from APP_FILES in sw.js');
});
