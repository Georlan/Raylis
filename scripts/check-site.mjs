import {readFile,access} from "node:fs/promises";
import {CATEGORIES,cleanProducts} from "../src/catalog.mjs";
const required=["index.html","styles.css","src/app.mjs","src/catalog.mjs","data/products.json","data/products-template.csv","assets/raylis-logo.svg","assets/raylis-symbol.svg","assets/favicon.svg"];
for (const file of required) await access(file);
const html=await readFile("index.html","utf8");
for(const id of ["catalogo","categorias","inicio","search-input","filter-categories","product-grid","product-dialog"]){
  if(!html.includes(`id="${id}"`))throw new Error(`Elemento obrigatório ausente: #${id}`);
}
const data=JSON.parse(await readFile("data/products.json","utf8"));
if(!Array.isArray(data))throw new Error("O catálogo precisa ser uma lista JSON.");
if(cleanProducts(data).length!==data.length)throw new Error("O JSON contém itens inválidos ou IDs repetidos.");
if(new Set(CATEGORIES.map(c=>c.id)).size!==CATEGORIES.length)throw new Error("IDs de categorias duplicados.");
const htmlRefs=["assets/raylis-logo.svg","assets/raylis-symbol.svg"];
for(const asset of htmlRefs){
  const svg=await readFile(asset,"utf8");
  if(!svg.startsWith("<svg ")||!svg.includes("data:image/png;base64,")||!svg.endsWith("</svg>"))throw new Error(`Asset da marca inválido: ${asset}`);
  const encoded=svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];
  const bytes=Buffer.from(encoded||"","base64");
  if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error(`PNG incorporado inválido: ${asset}`);
}
const css=await readFile("styles.css","utf8");
for(const color of ["#064714","#185C20","#4E9128","#9CCB4C","#D5E58D"]){
  if(!css.includes(color))throw new Error(`Cor oficial ausente: ${color}`);
}
if(css.includes("fonts.googleapis.com"))throw new Error("A prévia não deve depender de carregamento externo de fontes.");
if(html.includes("raylis-mark.svg")||html.includes("botanical-illustration.svg"))throw new Error("Página ainda usa arte provisória.");
console.log(`Site validado: ${required.length} arquivos básicos e ${data.length} produtos válidos.`);
