import test from "node:test";
import assert from "node:assert/strict";
import {CONTACT,whatsappLink,productInquiryLink} from "../src/contacts.mjs";

test("usa somente os canais oficiais informados pela loja",()=>{
  assert.equal(CONTACT.phoneDigits,"5588921917797");
  assert.equal(CONTACT.whatsappUrl,"https://wa.me/5588921917797");
  assert.equal(CONTACT.instagramUrl,"https://www.instagram.com/raylis_produtosnaturais/");
  assert.equal(CONTACT.instagramHandle,"@raylis_produtosnaturais");
});

test("WhatsApp geral abre sem mensagem e consulta usa codificação segura",()=>{
  assert.equal(whatsappLink(),CONTACT.whatsappUrl);
  const url=new URL(whatsappLink("Olá, Raylis! Chá & grãos?"));
  assert.equal(url.origin,"https://wa.me");
  assert.equal(url.pathname,"/5588921917797");
  assert.equal(url.searchParams.get("text"),"Olá, Raylis! Chá & grãos?");
});

test("consulta de produto real inclui nome, referência e pedido de disponibilidade",()=>{
  const url=productInquiryLink({id:"p-01",name:"Chá de exemplo",sku:"X 22",categoryId:"chas"});
  assert.ok(url);
  const msg=new URL(url).searchParams.get("text");
  assert.match(msg,/Chá de exemplo/);
  assert.match(msg,/ref\. X 22/);
  assert.match(msg,/disponibilidade/);
});

test("itens fictícios e dados inválidos não viram pedidos de compra",()=>{
  assert.equal(productInquiryLink({name:"Item ilustrativo 001",demo:true}),null);
  assert.equal(productInquiryLink({name:" "}),null);
  assert.equal(productInquiryLink(null),null);
});

test("canais são links externos sem serviço pago ou exposição de credenciais",()=>{
  assert.equal(new URL(CONTACT.instagramUrl).hostname,"www.instagram.com");
  assert.equal(new URL(CONTACT.whatsappUrl).hostname,"wa.me");
  assert.equal(CONTACT.phoneDigits.replace(/\D/g,""),CONTACT.phoneDigits);
});
