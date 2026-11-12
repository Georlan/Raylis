import {access, readFile, readdir, stat} from 'node:fs/promises';
import {extname, join} from 'node:path';
import {OUTPUT_DIR, PUBLIC_DIRS, ROOT_FILES, isAllowedPublicAsset} from './build.mjs';

async function walk(relative = '') {
  const entries = await readdir(join(OUTPUT_DIR, relative), {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const current = join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walk(current));
    else if (entry.isFile()) files.push(current.replaceAll('\\', '/'));
    else throw new Error('Artefato inesperado: ' + current);
  }
  return files;
}

export async function checkDist() {
  const artifacts = await walk();
  const allowed = new Set(ROOT_FILES);
  const dirs = new Set(Object.keys(PUBLIC_DIRS));

  for (const artifact of artifacts) {
    if (allowed.has(artifact)) continue;
    const [dir, ...rest] = artifact.split('/');
    if (!dirs.has(dir) || !rest.length || !isAllowedPublicAsset(dir, rest.at(-1))) {
      throw new Error('Arquivo interno exposto em dist/: ' + artifact);
    }
  }
  for (const file of ROOT_FILES) {
    if (!artifacts.includes(file)) throw new Error('Arquivo de deploy ausente: ' + file);
  }
  const html = await readFile(join(OUTPUT_DIR, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="\.\/([^"?#]+)(?:[?#][^"]*)?"/g)) {
    const ref = match[1];
    await access(join(OUTPUT_DIR, ref));
  }
  const references = [
    'src/app.mjs', 'src/artwork.mjs', 'src/contacts.mjs', 'src/catalog.mjs',
    'styles/app-ui.css', 'styles/contacts.css', 'styles/artwork.css',
    'data/products.json', 'assets/favicon.svg', 'assets/photos/hero-editorial.webp',
    '_headers'
  ];
  for (const file of references) await access(join(OUTPUT_DIR, file));

  const data = JSON.parse(await readFile(join(OUTPUT_DIR, 'data/products.json'), 'utf8'));
  if (!Array.isArray(data)) throw new Error('data/products.json não é uma lista.');

  const headers = await readFile(join(OUTPUT_DIR, '_headers'), 'utf8');
  if (!headers.includes('X-Robots-Tag: noindex')) throw new Error('O bloqueio temporário de indexação não está ativo.');

  for (const file of ['package.json', '.env', '.git', '.github/workflows/ci.yml', 'README.md', 'scripts/dev-server.mjs', 'tests/catalog.test.mjs', 'data/products-template.csv']) {
    if (artifacts.includes(file)) throw new Error('Arquivo privado enviado por engano: ' + file);
  }

  console.log('Distribuição validada: ' + artifacts.length + ' arquivos públicos, nenhum script interno ou credencial.');
}
if (process.argv[1] && process.argv[1].endsWith('check-dist.mjs')) {
  checkDist().catch(error => { console.error(error.message); process.exitCode = 1; });
}
