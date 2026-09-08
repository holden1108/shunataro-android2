import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'dist');
const target = path.join(root, 'android/app/src/main/assets/web');
// Refuse to package without a successful Vite build.
const html = await readFile(path.join(source, 'index.html'), 'utf8');
if (!html.includes('./assets/')) throw new Error('Vite build must use relative asset URLs (base: ./).');
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
// Native app is fully offline; use Android's installed Japanese font.
for (const entry of await readdir(path.join(target, 'assets'))) {
  if (!entry.endsWith('.css')) continue;
  const file = path.join(target, 'assets', entry);
  const css = await readFile(file, 'utf8');
  await writeFile(file, css.replace(/@import\s*(?:url\([^)]*\)|"[^"]*"|'[^']*')\s*;/g, ''));
}
// Catch a broken base path or missing packaged bundle before Gradle runs.
for (const match of html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)) {
  await readFile(path.join(target, match[1]));
}
console.log('Android web assets prepared.');
