import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createPreviewServer} from './dev-server.mjs';
import {OUTPUT_DIR} from './build.mjs';

await access(resolve(OUTPUT_DIR, 'index.html')).catch(() => {
  throw new Error('dist/ ausente. Execute npm run build primeiro.');
});

const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT precisa estar entre 1 e 65535.');
}
const server = createPreviewServer({root: OUTPUT_DIR, liveReload: false});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log('Raylis: prévia do pacote de produção em http://localhost:' + port + '/');
  console.log('Demonstração: http://localhost:' + port + '/?demo=1#catalogo');
  console.log('Ctrl+C encerra o servidor. Nenhuma publicação ocorre aqui.');
});
