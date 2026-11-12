import {mkdir,readFile,writeFile,copyFile,rm,cp} from "node:fs/promises";
import {join,resolve} from "node:path";
import {inflateSync} from "node:zlib";

const root=resolve(new URL("../",import.meta.url).pathname);
const brandAssets=[
  ["raylis-logo","assets/raylis-logo.svg"],
  ["raylis-symbol","assets/raylis-symbol.svg"]
];
export async function materializeBrandAssets(){
  await mkdir(join(root,"assets"),{recursive:true});
  for(const [name,target] of brandAssets){
    const packed=(await readFile(join(root,"brand",name+".deflate.base64.txt"),"utf8")).trim();
    const buffer=inflateSync(Buffer.from(packed,"base64"));
    const text=buffer.toString("utf8");
    if(!text.startsWith("<svg ") || !text.endsWith("</svg>")) throw new Error("Asset SVG inválido: "+name);
    await writeFile(join(root,target),text);
  }
}
export async function buildSite(){
  await materializeBrandAssets();
  const output=join(root,"dist");
  await rm(output,{recursive:true,force:true});
  await mkdir(join(output,"src"),{recursive:true});
  await mkdir(join(output,"data"),{recursive:true});
  await mkdir(join(output,"assets"),{recursive:true});
  for(const file of ["index.html","styles.css"]){
    await copyFile(join(root,file),join(output,file));
  }
  for(const file of ["app.mjs","catalog.mjs"]){
    await copyFile(join(root,"src",file),join(output,"src",file));
  }
  await copyFile(join(root,"data/products.json"),join(output,"data/products.json"));
  for(const file of ["raylis-logo.svg","raylis-symbol.svg","favicon.svg"]){
    await copyFile(join(root,"assets",file),join(output,"assets",file));
  }
  console.log("Raylis: assets restaurados e site estático gerado em dist/.");
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
  if(process.argv.includes("--build")) await buildSite();
  else {await materializeBrandAssets();console.log("Raylis: identidade visual disponível em assets/.");}
}
