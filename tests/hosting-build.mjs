import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const project = process.cwd();
execFileSync(process.execPath, ['tools/hosting/build.mjs'], { stdio: 'inherit' });
const { root } = JSON.parse(await readFile('output/hosting-build.json', 'utf8'));
assert.ok(root.startsWith(path.join(project, 'output', 'hosting-builds') + path.sep));
async function compare(relative = '') {
  const source = path.join(project, 'public', relative);
  const target = path.join(root, relative);
  const entries = await readdir(source, { withFileTypes: true });
  assert.deepEqual((await readdir(target)).sort(), entries.map(e => e.name).sort());
  for (const entry of entries) {
    if (entry.isDirectory()) await compare(path.join(relative, entry.name));
    else assert.deepEqual(await readFile(path.join(target, entry.name)), await readFile(path.join(source, entry.name)));
  }
}
await compare();
console.log('PASS: fresh deployment snapshot matches every public file without stale content');
