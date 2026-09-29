import { cp, mkdir, mkdtemp, realpath, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contentRoot, validateSourceTree } from '../content-root.mjs';
import { writeLocaleBundle } from '../build-locales.mjs';

const project = await realpath(fileURLToPath(new URL('../../', import.meta.url)));
const source = await contentRoot(project, 'public');
await validateSourceTree(source);
await writeLocaleBundle();
for (const name of ['index.html', 'styles.css', 'app.js', 'i18n-core.js', 'i18n.js', 'locales.js', 'assets/autokey.svg']) {
  const info = await stat(path.join(source, name));
  if (!info.isFile() || info.size === 0) throw new Error(`Required content missing: ${name}`);
}
for (const name of ['output', 'output/hosting-builds']) {
  const directory = path.join(project, name);
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw new Error('Hosting output must not be a link');
}
const release = await mkdtemp(path.join(project, 'output', 'hosting-builds', 'release-'));
const root = path.join(release, 'site');
await cp(source, root, { recursive: true, dereference: false, errorOnExist: true, force: false });
await writeFile(path.join(project, 'output', 'hosting-build.json'), JSON.stringify({ root, createdAtUtc: new Date().toISOString() }, null, 2));
console.log(`Built immutable hosting snapshot: ${root}`);
