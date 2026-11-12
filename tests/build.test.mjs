import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOT_FILES, PUBLIC_DIRS, isAllowedPublicAsset} from '../scripts/build.mjs';

test('o build publica somente os arquivos de interface aprovados', () => {
  assert.deepEqual(ROOT_FILES, ['index.html', 'styles.css', '_headers', 'data/products.json']);
  assert.ok(PUBLIC_DIRS.assets.includes('.webp'));
  assert.ok(PUBLIC_DIRS.src.includes('.mjs'));
  assert.ok(PUBLIC_DIRS.styles.includes('.css'));
});

test('o build não aceita credenciais, arquivos ocultos ou anexos inesperados', () => {
  assert.equal(isAllowedPublicAsset('assets', 'foto.webp'), true);
  assert.equal(isAllowedPublicAsset('styles', 'app-ui.css'), true);
  assert.equal(isAllowedPublicAsset('src', 'catalog.mjs'), true);
  for (const path of ['.env', '.DS_Store', 'package.json', 'products.csv', 'api-key.txt', 'secret.pem', '../.env']) {
    assert.equal(isAllowedPublicAsset('assets', path), false, path);
  }
  assert.equal(isAllowedPublicAsset('src', 'private.json'), false);
  assert.equal(isAllowedPublicAsset('styles', 'tokens.env'), false);
  assert.equal(isAllowedPublicAsset('data', 'products.json'), false);
});
