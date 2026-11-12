import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {HERO_ARTWORK} from "../src/artwork.mjs";

test("cabeçalho usa navegação real e mantém contato oficial", async()=>{
  const html=await readFile("index.html","utf8");
  for(const id of ["inicio","categorias","catalogo","contato"]){
    assert.ok(html.includes(`data-header-section="${id}"`));
  }
  assert.match(html,/href="https:\/\/wa\.me\/5588921917797"/);
  assert.match(html,/id="header-search"/);
  assert.match(html,/id="menu-toggle"/);
});

test("hero tem imagem isolada e texto acessível em HTML, sem mockup estático",async()=>{
  const html=await readFile("index.html","utf8");
  assert.ok(html.includes('id="hero-title"'));
  assert.ok(html.includes('class="hero-content"'));
  assert.ok(html.includes('class="hero-visual"'));
  assert.ok(html.includes('src="./assets/photos/hero-editorial.webp"'));
  assert.ok(html.includes("JAGUARIBARA, CE"));
  const bytes=await readFile(HERO_ARTWORK);
  assert.equal(bytes.subarray(0,4).toString(),"RIFF");
  assert.equal(bytes.subarray(8,12).toString(),"WEBP");
  assert.ok(bytes.length<90000);
});

test("componentes visuais têm versão mobile e movimento reduzido",async()=>{
  const css=await readFile("styles/artwork.css","utf8");
  assert.match(css,/\.hero-visual\s*\{/);
  assert.match(css,/mask-image:linear-gradient\(to right/);
  assert.match(css,/@media\(max-width:580px\)/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("navegação ativa é atualizada conforme a seção no viewport",async()=>{
  const app=await readFile("src/app.mjs","utf8");
  const ui=await readFile("styles/app-ui.css","utf8");
  assert.match(app,/const headerLinks=\[\.\.\.document\.querySelectorAll\("\[data-header-section\]"\)\]/);
  assert.match(app,/link\.setAttribute\("aria-current","location"\)/);
  assert.ok(ui.includes('.header-nav a[aria-current="location"]::after'));
});
