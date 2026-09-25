import { cp, lstat, mkdir, readdir, realpath, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contentRoot, validateSourceTree } from './content-root.mjs';

const projectRoot = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const source = await contentRoot(projectRoot, 'public');
const destination = path.join(projectRoot, 'dist');
// Only this fixed, project-owned output can be replaced.
if (path.dirname(destination) !== path.resolve(projectRoot)) throw new Error('Invalid build destination');
try {
  if ((await lstat(destination)).isSymbolicLink()) throw new Error('Build output must not be a link');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const file of ['index.html', 'styles.css', 'app.js', 'assets/autokey.svg']) {
  if (!(await stat(path.join(source, file))).isFile()) throw new Error(`Required file missing: ${file}`);
}
await validateSourceTree(source);
await mkdir(destination, { recursive: true });
if (await realpath(destination) !== destination) throw new Error('Build output resolved outside the intended directory');
for (const item of await readdir(destination, { withFileTypes: true })) {
  await rm(path.join(destination, item.name), { recursive: true, force: true });
}
await cp(source, destination, { recursive: true, dereference: false, errorOnExist: true });
console.log(`Built static website: ${destination}`);
