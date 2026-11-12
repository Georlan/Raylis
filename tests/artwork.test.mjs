import test from "node:test";
import assert from "node:assert/strict";
import {readFile,access} from "node:fs/promises";
import {CATEGORY_ARTWORK,HERO_ARTWORK,categoryArtwork} from "../src/artwork.mjs";
import {CATEGORIES,createDemoProducts} from "../src/catalog.mjs";

test("cada categoria possui um asset local próprio e separado",async()=>{
  const all=Object.entries(CATEGORY_ARTWORK);
  assert.equal(all.length,CATEGORIES.length);
  assert.equal(new Set(all.map(([,value])=>value)).size,CATEGORIES.length);
  for(const category of CATEGORIES){
    const path=categoryArtwork(category.id);
    assert.match(path,/^\.\/assets\/illustrations\/category-[a-z]+\.svg$/);
    await access(path);
  }
  assert.equal(categoryArtwork("categoria-nao-cadastrada"),CATEGORY_ARTWORK.outros);
});

test("ilustrações SVG têm recorte próprio e não contêm marcas ou texto gerados",async()=>{
  const paths=[HERO_ARTWORK,...Object.values(CATEGORY_ARTWORK)];
  for(const path of paths){
    const source=await readFile(path,"utf8");
    assert.match(source,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="/);
    assert.ok(source.endsWith("</svg>"),path);
    assert.doesNotMatch(source,/(?:<image\b|data:image\/|https?:\/\/(?!www\.w3\.org\/2000\/svg))/);
    assert.doesNotMatch(source,/<text(?:\s|>)/);
    assert.ok(source.length<12000,"Arquivo vetorial precisa continuar leve");
  }
});

test("site utiliza os assets de forma programática e não em um mockup estático",async()=>{
  const [html,app,style]=await Promise.all([
    readFile("index.html","utf8"),
    readFile("src/app.mjs","utf8"),
    readFile("styles/artwork.css","utf8")
  ]);
  assert.ok(html.includes('src="./assets/illustrations/hero-ritual.svg"'));
  assert.ok(html.includes("styles/artwork.css"));
  assert.ok(app.includes('import {categoryArtwork} from "./artwork.mjs"'));
  assert.ok(app.includes('class="category-art"'));
  assert.ok(app.includes('class="category-illustration"'));
  assert.ok(app.includes("Imagem de categoria"));
  assert.ok(style.includes(".hero-artwork"));
  assert.ok(style.includes(".category-tile.active"));
  assert.ok(style.includes("prefers-reduced-motion:reduce"));
});

test("o catálogo demonstrativo não é convertido em mercadoria real pelas ilustrações",()=>{
  const items=createDemoProducts(520);
  assert.ok(items.every(item=>item.demo===true));
  assert.ok(items.every(item=>CATEGORY_ARTWORK[item.categoryId]));
});
