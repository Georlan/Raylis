import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const [html,style,app,asset]=await Promise.all([
  readFile("index.html","utf8"),
  readFile("styles/app-ui.css","utf8"),
  readFile("src/app.mjs","utf8"),
  readFile("assets/whatsapp.svg","utf8")
]);

test("página construída com HTML real e sem mockup de aplicativo",()=>{
  for (const key of ["id=\"hero-card\"","id=\"category-tiles\"","id=\"quick-categories\"","id=\"product-grid\"","id=\"filter-toggle\"","id=\"filter-apply\"","id=\"header-search\""]) {
    assert.ok(html.includes(key),`Esperado elemento ${key}`);
  }
  assert.ok(html.includes('src="./src/app.mjs"'));
  assert.ok(!html.includes("mockup_raylis"));
  assert.ok(!html.includes("imagegen.png"));
  assert.ok(!html.includes("adicionar à sacola"));
  assert.ok(!html.includes("carrinho de compras"));
});

test("ícone de WhatsApp é arquivo vetorial isolado usado em vários atalhos",()=>{
  assert.match(asset,/<svg[\s\S]*viewBox="0 0 96 96"/);
  assert.match(asset,/<title id="title">WhatsApp<\/title>/);
  assert.ok(html.split('src="./assets/whatsapp.svg"').length>=4);
  assert.ok(html.includes('href="https://wa.me/5588921917797"'));
});

test("categorias e filtros são elementos interativos reais",()=>{
  assert.ok(app.includes('renderQuickCategories()'));
  assert.ok(app.includes('data-quick-category'));
  assert.ok(app.includes('aria-pressed'));
  assert.ok(app.includes('scrollCategories('));
  assert.ok(app.includes('setupSectionNavigation()'));
  assert.ok(app.includes('productInquiryLink(item)'));
});

test("animações e layout respeitam mobile e movimento reduzido",()=>{
  assert.match(style,/@media\(max-width:760px\)/);
  assert.match(style, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/\.filters-panel\.is-open/);
  assert.match(style,/\.product-grid/);
  assert.match(style,/\.quick-dock/);
  assert.match(app,/prefersReducedMotion\(\)/);
});

test("copy do layout não promete produtos, preços ou pedidos inexistentes",()=>{
  const texts=html.replace(/<[^>]*>/g," ").toLowerCase();
  assert.ok(!texts.includes("r$"));
  assert.ok(!texts.includes("em estoque"));
  assert.ok(!texts.includes("comprar agora"));
  assert.ok(!texts.includes("pedidos recentes"));
});
