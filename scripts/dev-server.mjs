import {createServer} from "node:http";
import {readFile, stat, realpath} from "node:fs/promises";
import {watch} from "node:fs";
import {extname, join, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";

const PROJECT_ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon"
};
const EVENTS_PATH = "/__raylis_events";
const RELOAD_SCRIPT = `<script>
(() => {
  const stream = new EventSource("${EVENTS_PATH}");
  stream.addEventListener("reload", () => window.location.reload());
})();
</script>`;

export function createPreviewServer({root=PROJECT_ROOT,liveReload=true}={}){
  const base = resolve(root);
  const clients = new Set();
  const server = createServer(async(req,res)=>{
    if(!["GET","HEAD"].includes(req.method)){
      res.writeHead(405,{"Allow":"GET, HEAD"}); res.end(); return;
    }
    let pathname;
    try {pathname = new URL(req.url,"http://localhost").pathname;}
    catch {res.writeHead(400); res.end("Endereço inválido"); return;}
    if(pathname === EVENTS_PATH && liveReload){
      res.writeHead(200,{
        "Content-Type":"text/event-stream",
        "Cache-Control":"no-cache",
        "Connection":"keep-alive",
        "X-Content-Type-Options":"nosniff"
      });
      if(req.method==="HEAD"){res.end();return;}
      res.write(": conectado\n\n");
      clients.add(res);
      req.on("close",()=>clients.delete(res));
      return;
    }
    let decoded;
    try { decoded = decodeURIComponent(pathname); }
    catch {res.writeHead(400);res.end("Endereço inválido");return;}
    if(decoded.includes("\0")||decoded.includes("\\")||decoded.split("/").includes("..")){
      res.writeHead(400);res.end("Caminho inválido");return;
    }
    if(decoded==="/")decoded="/index.html";
    const location=resolve(base,"."+decoded);
    if(location!==base && !location.startsWith(base+sep)){
      res.writeHead(403);res.end("Acesso negado");return;
    }
    if(location.includes(`${sep}.git${sep}`)||location.includes(`${sep}node_modules${sep}`)||location.endsWith(`${sep}.env`)||location.includes(`${sep}.github${sep}`)){
      res.writeHead(404);res.end("Não encontrado");return;
    }
    try{
      const actual = await realpath(location);
      if(actual!==base && !actual.startsWith(base+sep)){
        res.writeHead(403);res.end("Acesso negado");return;
      }
      const information=await stat(actual);
      if(!information.isFile())throw new Error("Não é arquivo");
      const extension=extname(actual).toLowerCase();
      if(!MIME_TYPES[extension]){res.writeHead(404);res.end("Não encontrado");return;}
      let bytes=await readFile(actual);
      if(extension===".html" && liveReload){
        bytes=Buffer.from(bytes.toString("utf8").replace("</body>",RELOAD_SCRIPT+"</body>"));
      }
      res.writeHead(200,{
        "Content-Type":MIME_TYPES[extension],
        "Cache-Control":"no-store",
        "X-Content-Type-Options":"nosniff",
        "Content-Length":bytes.length
      });
      if(req.method==="HEAD"){res.end();return;}
      res.end(bytes);
    } catch(error){
      if(error.code!=="ENOENT" && error.message!=="Não é arquivo")console.error("Falha ao ler arquivo:",error.message);
      res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});
      res.end("Arquivo não encontrado");
    }
  });
  const notifyChange = () => {
    for(const client of clients)client.write("event: reload\ndata: update\n\n");
  };
  let watcher;
  if(liveReload){
    try{
      watcher=watch(base,{recursive:true},(event,file)=>{
        if(!file) return;
        if(String(file).split(/[\\/]/).some(part=>[".git","node_modules"].includes(part)))return;
        notifyChange();
      });
      watcher.on("error",error=>console.warn("Atualização automática indisponível:",error.message));
    }catch(error){console.warn("Atualização automática indisponível (atualize com F5):",error.message);}
  }
  server.on("close",()=>{
    watcher?.close();
    for(const client of clients)client.end();
    clients.clear();
  });
  return server;
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||8000);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error("PORT precisa ser entre 1 e 65535.");
  const server=createPreviewServer();
  server.on("error",error=>{console.error("Não foi possível iniciar a prévia:",error.message);process.exitCode=1;});
  server.listen(port,"127.0.0.1",()=>{
    console.log(`\n🌿 Raylis — prévia local iniciada\n\n  Página:  http://localhost:${port}/\n  Testes:  http://localhost:${port}/?demo=1#catalogo\n\n  Edite os arquivos e acompanhe as mudanças no navegador.\n  Ctrl+C encerra o servidor. Nenhuma hospedagem ou banco de dados necessário.\n`);
  });
}
