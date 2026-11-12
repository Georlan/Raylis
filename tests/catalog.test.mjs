import test from "node:test";
import assert from "node:assert/strict";
import {CATEGORIES,PAGE_SIZE,normalize,sanitizeImageSrc,isValidProduct,cleanProducts,selectProducts,categoryCounts,paginate,createDemoProducts} from "../src/catalog.mjs";
const items=[
  {id:"1",name:"Chá de demonstração",categoryId:"chas",brand:"Exemplo A",status:"available",tags:["camomila"],addedAt:"2026-01-01"},
  {id:"2",name:"Vitamina ilustrativa",categoryId:"vitaminas",brand:"Exemplo B",status:"inquiry",addedAt:"2026-02-01"},
  {id:"3",name:"Infusão teste",categoryId:"chas",brand:"Exemplo A",status:"unavailable",addedAt:"2026-01-12"}
];
test("normaliza acentuação e espaços",()=>{
  assert.equal(normalize("  CHÁ   de  Limão "),"cha de limao");
});
test("busca encontra nome, marca, categoria e tags",()=>{
  assert.deepEqual(selectProducts(items,{q:"cha demonstracao"}).map(p=>p.id),["1"]);
  assert.deepEqual(selectProducts(items,{q:"camomila"}).map(p=>p.id),["1"]);
  assert.deepEqual(selectProducts(items,{q:"vitaminas"}).map(p=>p.id),["2"]);
});
test("filtra simultaneamente categoria, disponibilidade e marca",()=>{
  assert.deepEqual(selectProducts(items,{category:"chas",brand:"Exemplo A",availability:"available"}).map(p=>p.id),["1"]);
  assert.equal(selectProducts(items,{category:"chas",availability:"inquiry"}).length,0);
});
test("contagem de facetas desconsidera apenas a categoria selecionada",()=>{
  const counts=categoryCounts(items,{category:"vitaminas",brand:"Exemplo A"});
  assert.equal(counts.all,2);
  assert.equal(counts.chas,2);
  assert.equal(counts.vitaminas,0);
});
test("ordenação é determinística e independente do idioma",()=>{
  assert.equal(selectProducts(items,{sort:"newest"})[0].id,"2");
  assert.equal(selectProducts(items,{sort:"name-desc"})[0].id,"2");
});
test("paginação nunca exibe mais que solicitado",()=>{
  assert.equal(paginate(items,2).visible.length,2);
  assert.equal(paginate(items,2).hasMore,true);
  assert.equal(paginate(items,200).hasMore,false);
  assert.equal(PAGE_SIZE,24);
});
test("demonstração contém 520 itens inequivocamente fictícios",()=>{
  const examples=createDemoProducts(520);
  assert.equal(examples.length,520);
  assert.equal(new Set(examples.map(p=>p.id)).size,520);
  assert.ok(examples.every(p=>p.demo && isValidProduct(p) && CATEGORIES.some(c=>c.id===p.categoryId)));
});
test("remove produtos inválidos e IDs duplicados",()=>{
  const duplicate=[...items,items[0],{id:"4",name:"X",categoryId:"categoria-inexistente"}];
  assert.equal(cleanProducts(duplicate).length,3);
});
test("impede URLs de imagem perigosas",()=>{
  assert.equal(sanitizeImageSrc("javascript:alert(1)"),"");
  assert.equal(sanitizeImageSrc("data:image/svg+xml;base64,abc"),"");
  assert.equal(sanitizeImageSrc("../secret.svg"),"");
  assert.equal(sanitizeImageSrc("assets/foto.jpg"),"assets/foto.jpg");
  assert.equal(sanitizeImageSrc("https://exemplo.com/foto.webp"),"https://exemplo.com/foto.webp");
});
