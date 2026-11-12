import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {CATEGORIES,isValidProduct,sanitizeImageSrc} from "../src/catalog.mjs";

export const TEMPLATE_HEADERS=["id","nome","categoria","marca","descricao","imagem","status","referencia","etiquetas","data_inclusao"];

export function parseCsv(text){
  const data=String(text).replace(/^\uFEFF/,"");
  const firstLine=data.split(/\r?\n/,1)[0];
  const delimiter=(firstLine.match(/;/g)||[]).length>(firstLine.match(/,/g)||[]).length?";":",";
  const rows=[];
  let row=[],field="",quoted=false;
  for(let i=0;i<data.length;i++){
    const char=data[i];
    if(char==='"'){
      if(quoted && data[i+1]==='"'){field+='"';i++;}
      else if(!quoted && field==="")quoted=true;
      else if(quoted)quoted=false;
      else throw new Error("Aspas inválidas no CSV.");
    }else if(char===delimiter&&!quoted){row.push(field);field="";}
    else if((char==="\n"||char==="\r")&&!quoted){
      if(char==="\r"&&data[i+1]==="\n")i++;
      row.push(field);field="";
      if(row.some(value=>value.trim()))rows.push(row);
      row=[];
    }else{field+=char;}
  }
  if(quoted)throw new Error("CSV com aspas não fechadas.");
  row.push(field);
  if(row.some(value=>value.trim()))rows.push(row);
  if(!rows.length)throw new Error("CSV vazio.");
  const headers=rows.shift().map(value=>value.trim().toLowerCase());
  const missing=["id","nome","categoria"].filter(key=>!headers.includes(key));
  if(missing.length)throw new Error(`Colunas obrigatórias ausentes: ${missing.join(", ")}.`);
  return rows.map((cells,index)=>{
    if(cells.length!==headers.length)throw new Error(`Linha ${index+2}: quantidade de colunas incorreta (esperado ${headers.length}, encontrado ${cells.length}).`);
    return Object.fromEntries(headers.map((key,i)=>[key,cells[i].trim()]));
  });
}
export function convertRows(rows){
  const ids=new Set();
  const known=new Set(CATEGORIES.map(cat=>cat.id));
  return rows.map((row,index)=>{
    const line=index+2;
    const id=(row.id||"").trim();
    const name=(row.nome||"").trim();
    const categoryId=(row.categoria||"").trim();
    if(!id||!name)throw new Error(`Linha ${line}: id e nome são obrigatórios.`);
    if(ids.has(id))throw new Error(`Linha ${line}: id repetido (${id}).`);
    ids.add(id);
    if(!known.has(categoryId))throw new Error(`Linha ${line}: categoria inválida (${categoryId}). Use: ${[...known].join(", ")}.`);
    const statusInput=(row.status||"").trim().toLocaleLowerCase("pt-BR");
    const statusMap={"disponivel":"available","disponível":"available","available":"available","sob_consulta":"inquiry","sob consulta":"inquiry","inquiry":"inquiry","indisponivel":"unavailable","indisponível":"unavailable","unavailable":"unavailable","":"unavailable"};
    if(!(statusInput in statusMap))throw new Error(`Linha ${line}: status inválido (${row.status}).`);
    const imageUrl=(row.imagem||"").trim();
    if(imageUrl&&!sanitizeImageSrc(imageUrl))throw new Error(`Linha ${line}: URL de imagem inválida. Use https ou assets/.`);
    const addedAt=(row.data_inclusao||"").trim();
    if(addedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(addedAt)||Number.isNaN(Date.parse(addedAt))))throw new Error(`Linha ${line}: data_inclusao deve ser AAAA-MM-DD.`);
    const item={
      id,name,categoryId,
      ...(row.marca?{brand:row.marca}:{}),
      ...(row.descricao?{shortDescription:row.descricao}:{}),
      ...(imageUrl?{imageUrl}:{}),
      status:statusMap[statusInput],
      ...(row.referencia?{sku:row.referencia}:{}),
      ...(row.etiquetas?{tags:row.etiquetas.split("|").map(tag=>tag.trim()).filter(Boolean)}:{}),
      ...(addedAt?{addedAt}:{}),
    };
    if(!isValidProduct(item))throw new Error(`Linha ${line}: produto inválido.`);
    return item;
  });
}
export async function runCli(args){
  const file=args.find(arg=>!arg.startsWith("--"));
  if(!file)throw new Error("Uso: npm run import:csv -- caminho/para/produtos.csv [--check]");
  const csv=await readFile(resolve(file),"utf8");
  const items=convertRows(parseCsv(csv));
  if(!items.length)throw new Error("O arquivo não possui produtos. Nenhuma alteração foi realizada.");
  if(args.includes("--check")){console.log(`Validação concluída: ${items.length} produtos. Nenhum arquivo alterado.`);return;}
  const output=resolve("data/products.json");
  await writeFile(output,JSON.stringify(items,null,2)+"\n");
  console.log(`${items.length} produtos importados em data/products.json. Revise as alterações antes de publicar.`);
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  runCli(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
}
