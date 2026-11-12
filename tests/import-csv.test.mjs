import test from "node:test";
import assert from "node:assert/strict";
import {parseCsv,convertRows} from "../scripts/import-csv.mjs";
test("importa CSV brasileiro com ponto e vírgula e texto entre aspas",()=>{
  const data='id;nome;categoria;marca;descricao;imagem;status;referencia;etiquetas;data_inclusao\r\n01;"Chá; exemplo";chas;Teste;"Descrição, com vírgula";;disponivel;C-1;"erva|infusao";2026-01-01\r\n';
  const rows=parseCsv(data);
  assert.equal(rows[0].nome,"Chá; exemplo");
  assert.equal(rows[0].descricao,"Descrição, com vírgula");
  const items=convertRows(rows);
  assert.equal(items[0].status,"available");
  assert.deepEqual(items[0].tags,["erva","infusao"]);
});
test("aceita CSV separado por vírgulas e aspas escapadas",()=>{
  const rows=parseCsv('id,nome,categoria\na,"Exemplo ""especial""",outros\n');
  assert.equal(rows[0].nome,'Exemplo "especial"');
});
test("recusa categorias desconhecidas, repetição de IDs e status não aceitos",()=>{
  assert.throws(()=>convertRows([{id:"1",nome:"X",categoria:"errada"}]),/categoria inválida/);
  assert.throws(()=>convertRows([{id:"1",nome:"X",categoria:"chas"},{id:"1",nome:"Y",categoria:"chas"}]),/repetido/);
  assert.throws(()=>convertRows([{id:"1",nome:"X",categoria:"chas",status:"inventado"}]),/status inválido/);
});
test("não interpreta linhas incompletas silenciosamente",()=>{
  assert.throws(()=>parseCsv("id;nome;categoria\n1;teste\n"),/quantidade de colunas/);
  assert.throws(()=>parseCsv("nome;marca\nTeste;Marca\n"),/Colunas obrigatórias/);
});
