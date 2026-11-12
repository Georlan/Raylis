import {copyFile, mkdir, readdir, rm, stat} from 'node:fs/promises';
import {dirname, extname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Only public, browser-readable files are copied to Cloudflare Pages.
// Node tooling, repository metadata, tests and secrets never enter dist.
export const PROJECT_ROOT = resolve(fileURLToPath(new URL('../', import.meta.url)));
export const OUTPUT_DIR = resolve(PROJECT_ROOT, 'dist');
export const ROOT_FILES = Object.freeze(['index.html', 'styles.css', '_headers', 'data/products.json']);
export const PUBLIC_DIRS = Object.freeze({
  assets: ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico'],
  styles: ['.css'],
  src: ['.mjs', '.js']
});

export function isAllowedPublicAsset(directory, filename) {
  if (!filename || filename.startsWith('.') || filename.includes('/') || filename.includes('\\')) return false;
  const extensions = PUBLIC_DIRS[directory];
  return Array.isArray(extensions) && extensions.includes(extname(filename).toLowerCase());
}

export async function buildSite() {
  await rm(OUTPUT_DIR, {recursive: true, force: true});
  await mkdir(OUTPUT_DIR, {recursive: true});
  let count = 0;
  let size = 0;

  async function copyPublic(sourceRelative, destinationRelative = sourceRelative) {
    const source = join(PROJECT_ROOT, sourceRelative);
    const destination = join(OUTPUT_DIR, destinationRelative);
    const info = await stat(source);
    if (!info.isFile()) throw new Error('Arquivo não regular: ' + sourceRelative);
    await mkdir(dirname(destination), {recursive: true});
    await copyFile(source, destination);
    count++;
    size += info.size;
  }

  async function copyDirectory(directory, relative = '') {
    const source = join(PROJECT_ROOT, directory, relative);
    const entries = await readdir(source, {withFileTypes: true});
    for (const entry of entries) {
      const pathWithin = join(relative, entry.name);
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) {
        throw new Error('Arquivo oculto ou link simbólico bloqueado: ' + join(directory, pathWithin));
      }
      if (entry.isDirectory()) {
        await copyDirectory(directory, pathWithin);
      } else if (entry.isFile() && isAllowedPublicAsset(directory, entry.name)) {
        await copyPublic(join(directory, pathWithin));
      } else {
        throw new Error('Arquivo não público dentro de ' + directory + ': ' + pathWithin);
      }
    }
  }

  for (const file of ROOT_FILES) await copyPublic(file);
  for (const directory of Object.keys(PUBLIC_DIRS)) await copyDirectory(directory);

  console.log('Cloudflare Pages: dist/ pronto (' + count + ' arquivos, ' + (size / 1024).toFixed(1) + ' KiB).');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite().catch(error => { console.error(error.message); process.exitCode = 1; });
}
