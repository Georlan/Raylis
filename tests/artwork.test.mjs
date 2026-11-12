import test from "node:test";
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {CATEGORY_ARTWORK,HERO_ARTWORK,categoryArtwork} from "../src/artwork.mjs";
import {CATEGORIES,createDemoProducts} from "../src/catalog.mjs";

test("seis fotografias individuais locais, uma para cada categoria",async()=>{
  const all=Object.entries(CATEGORY_ARTWORK);
  assert.equal(all.length,CATEGORIES.length);
  assert.equal(new Set(all.map(([,value])=>value)).size,CATEGORIES.length);
  for(const category of CATEGORIES){
    const path=categoryArtwork(category.id);
    assert.match(path,/^\.\/assets\/photos\/category-[a-z]+\.webp$/);
    await access(path);
  }
  assert.equal(categoryArtwork("inexistente"),CATEGORY_ARTWORK.outros);
});
test("fotografias WebP são válidas, leves e não dependem de serviços externos",async()=>{
  const paths=[HERO_ARTWORK,...Object.values(CATEGORY_ARTWORK)];
  for(const path of paths){
    const bytes=await readFile(path);
    assert.equal(bytes.subarray(0,4).toString(),"RIFF",path);
    assert.equal(bytes.subarray(8,12).toString(),"WEBP",path);
    assert.ok(bytes.length>3000,path);
    assert.ok(bytes.length<95000,path);
  }
  assert.equal(new Set(paths).size,7);
});
test("UI real usa fotos nas categorias e exibe rótulo de imagem ilustrativa",async()=>{
  const [html,app,style]=await Promise.all([
    readFile("index.html","utf8"),
    readFile("src/app.mjs","utf8"),
    readFile("styles/artwork.css","utf8")
  ]);
  assert.ok(html.includes('src="./assets/photos/hero-tea.webp"'));
  assert.ok(html.includes('styles/artwork.css'));
  assert.ok(app.includes('import {categoryArtwork} from "./artwork.mjs"'));
  assert.ok(app.includes('class="category-art"'));
  assert.ok(app.includes('class="category-illustration"'));
  assert.ok(app.includes("Imagem de categoria"));
  assert.ok(app.includes("aria-pressed"));
  assert.ok(app.includes('data-tile='));
  assert.ok(app.includes('data-quick-category'));
  assert.ok(style.includes(".category-tile.active"));
  assert.ok(style.includes("prefers-reduced-motion:reduce"));
});
test("imagens demonstrativas não habilitam venda de produtos fictícios",()=>{
  const items=createDemoProducts(520);
  assert.ok(items.every(item=>item.demo===true));
  assert.ok(items.every(item=>CATEGORY_ARTWORK[item.categoryId]));
});
