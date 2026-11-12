import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createPreviewServer} from "../scripts/dev-server.mjs";

test("prévia serve o catálogo estático sem backend ou dependências",async()=>{
  const server=createPreviewServer({liveReload:false});
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  const port=server.address().port;
  const url=`http://127.0.0.1:${port}`;
  try {
    const home=await fetch(url+"/?demo=1");
    assert.equal(home.status,200);
    assert.match(home.headers.get("content-type"),/text\/html/);
    const html=await home.text();
    assert.match(html,/Raylis/);
    assert.match(html,/src\/app.mjs/);

    const catalog=await fetch(url+"/data/products.json");
    assert.equal(catalog.status,200);
    assert.deepEqual(await catalog.json(),[]);

    const svg=await fetch(url+"/assets/raylis-mark.svg");
    assert.equal(svg.status,200);
    assert.match(svg.headers.get("content-type"),/image\/svg\+xml/);

    const head=await fetch(url+"/styles.css",{method:"HEAD"});
    assert.equal(head.status,200);
    assert.equal(await head.text(),"");

    const hidden=await fetch(url+"/.git/config");
    assert.equal(hidden.status,404);
  } finally {
    await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
});
