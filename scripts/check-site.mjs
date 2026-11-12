import {readFile,access} from "node:fs/promises";
import {CATEGORIES,cleanProducts} from "../src/catalog.mjs";
const required=["index.html","styles.css","src/app.mjs","src/catalog.mjs","data/products.json","data/products-template.csv","assets/raylis-mark.svg","assets/botanical-illustration.svg","assets/favicon.svg"];
for (const file of required) await access(file);
const html=await readFile("index.html","utf8");
for(const id of ["catalogo","categorias","inicio","search-input","filter-categories","product-grid","product-dialog"]){
  if(!html.includes(`id="${id}"`))throw new Error(`Elemento obrigatório ausente: #${id}`);
}
const data=JSON.parse(await readFile("data/products.json","utf8"));
if(!Array.isArray(data))throw new Error("O catálogo precisa ser uma lista JSON.");
if(cleanProducts(data).length!==data.length)throw new Error("O JSON contém itens inválidos ou IDs repetidos.");
if(new Set(CATEGORIES.map(c=>c.id)).size!==CATEGORIES.length)throw new Error("IDs de categorias duplicados.");
console.log(`Site validado: ${required.length} arquivos básicos e ${data.length} produtos válidos.`);
