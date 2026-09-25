import { lstat, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

export async function contentRoot(projectRoot, name) {
  if (!['public', 'dist'].includes(name)) throw new Error('Unknown content root');
  const expected = path.join(projectRoot, name);
  const entry = await lstat(expected);
  if (entry.isSymbolicLink() || !entry.isDirectory() || await realpath(expected) !== expected) {
    throw new Error(`${name} must be a regular directory inside this website project`);
  }
  return expected;
}

export async function validateSourceTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Linked content is not allowed: ${filename}`);
    if (entry.isDirectory()) await validateSourceTree(filename);
    else if (!entry.isFile()) throw new Error(`Non-file content is not allowed: ${filename}`);
  }
}
