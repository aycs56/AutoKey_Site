import assert from 'node:assert/strict';
import { cp, mkdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const fixture = path.join(projectRoot, 'output', 'boundary-tests', `${Date.now()}`);
const source = path.join(fixture, 'public');
const outside = path.join(fixture, 'desktop-fixture');
const run = file => execFileSync(process.execPath, [path.join(fixture, 'tools', file)], { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
const rejects = (file, pattern) => assert.throws(() => run(file), error => pattern.test(error.stderr));
await mkdir(path.join(source, 'assets'), { recursive: true });
await mkdir(outside, { recursive: true });
await cp(path.join(projectRoot, 'tools'), path.join(fixture, 'tools'), { recursive: true });
for (const name of ['index.html', 'app.js', 'styles.css', 'assets/autokey.svg']) await writeFile(path.join(source, name), 'fixture');
await writeFile(path.join(outside, 'settings.json'), 'private-fixture');
run('build.mjs');
assert.equal(await readFile(path.join(fixture, 'dist', 'index.html'), 'utf8'), 'fixture');
console.log('PASS regular site builds independently');
const sentinel = path.join(fixture, 'dist', 'previous-build.txt');
await writeFile(sentinel, 'keep');
const nested = path.join(source, 'linked');
await symlink(outside, nested, 'junction');
try {
  rejects('build.mjs', /Linked content is not allowed/);
  assert.equal(await readFile(sentinel, 'utf8'), 'keep');
  console.log('PASS nested source junction is rejected before changing the previous build');
} finally { await rm(nested); }
await rename(source, path.join(fixture, 'saved-public'));
await symlink(outside, source, 'junction');
try {
  rejects('build.mjs', /regular directory inside this website project/);
  rejects('serve.mjs', /regular directory inside this website project/);
  assert.equal(await readFile(sentinel, 'utf8'), 'keep');
  console.log('PASS root source junction is rejected by build and server');
} finally { await rm(source); await rename(path.join(fixture, 'saved-public'), source); }
await rename(path.join(fixture, 'dist'), path.join(fixture, 'saved-dist'));
await symlink(outside, path.join(fixture, 'dist'), 'junction');
try {
  rejects('build.mjs', /Build output must not be a link/);
  assert.equal(await readFile(path.join(outside, 'settings.json'), 'utf8'), 'private-fixture');
  console.log('PASS output junction is rejected without touching the target');
} finally { await rm(path.join(fixture, 'dist')); }
console.log(`Boundary journeys passed; isolated evidence: ${fixture}`);
