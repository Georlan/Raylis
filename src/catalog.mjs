// Modelo de dados e regras de navegação, desacoplados da interface.
// As categorias são provisórias até a confirmação do inventário da Raylis.
export const CATEGORIES = Object.freeze([
  {id:"chas", name:"Chás e infusões", description:"Explore infusões e preparos", code:"01"},
  {id:"suplementos", name:"Suplementos", description:"Confira diferentes formatos", code:"02"},
  {id:"vitaminas", name:"Vitaminas e minerais", description:"Explore esta seleção", code:"03"},
  {id:"alimentos", name:"Alimentos naturais", description:"Conheça as opções", code:"04"},
  {id:"cuidados", name:"Cuidados pessoais", description:"Produtos para o dia a dia", code:"05"},
  {id:"outros", name:"Outros produtos", description:"Mais possibilidades", code:"06"}
]);
const collator = new Intl.Collator("pt-BR", {sensitivity:"base", numeric:true});
export const PAGE_SIZE = 24;
export const VALID_STATUSES = ["available", "inquiry", "unavailable"];
export function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").replace(/\s+/g," ").trim();
}
export function sanitizeImageSrc(source) {
  if (typeof source !== "string" || !source.trim()) return "";
  const url = source.trim();
  if (/^https:\/\/[\w.-]+(?:[/:?#][^\s<>"']*)?$/i.test(url)) return url;
  if (/^(?:\.\/)?assets\/[\w./-]+\.(?:png|jpe?g|webp|avif|svg)$/i.test(url) && !url.includes("..")) return url;
  return "";
}
export function isValidProduct(item) {
  return !!item && typeof item === "object" && typeof item.id === "string" && item.id.trim().length > 0 &&
    typeof item.name === "string" && item.name.trim().length > 0 &&
    CATEGORIES.some(c => c.id === item.categoryId) &&
    (!item.status || VALID_STATUSES.includes(item.status));
}
export function cleanProducts(input) {
  if (!Array.isArray(input)) return [];
  const ids = new Set();
  return input.filter(item => {
    if (!isValidProduct(item) || ids.has(item.id)) return false;
    ids.add(item.id);
    return true;
  });
}
export function matchesProduct(item, {q="", category="", brand="", availability="all"}={}) {
  if (category && item.categoryId !== category) return false;
  if (brand && item.brand !== brand) return false;
  if (availability === "available" && item.status !== "available") return false;
  if (availability === "inquiry" && item.status !== "inquiry") return false;
  const query = normalize(q);
  if (!query) return true;
  const categoryName = CATEGORIES.find(c => c.id === item.categoryId)?.name ?? "";
  const searchText = normalize([item.name, item.brand, item.shortDescription, item.categoryId, categoryName, ...(Array.isArray(item.tags) ? item.tags : [])].join(" "));
  return query.split(" ").every(term => searchText.includes(term));
}
export function selectProducts(items, filters={}) {
  const matched = items.filter(item => matchesProduct(item,filters));
  const sort = filters.sort || "name-asc";
  return matched.sort((a,b) => {
    if(sort==="name-desc") return collator.compare(b.name,a.name);
    if(sort==="newest") {
      const d = (Date.parse(b.addedAt || "") || 0) - (Date.parse(a.addedAt || "") || 0);
      return d || collator.compare(a.name,b.name);
    }
    return collator.compare(a.name,b.name);
  });
}
export function categoryCounts(items, filters={}) {
  const eligible = items.filter(item => matchesProduct(item,{...filters,category:""}));
  const counts = Object.fromEntries(CATEGORIES.map(c=>[c.id,0]));
  for(const item of eligible) counts[item.categoryId]++;
  return {all:eligible.length, ...counts};
}
export function paginate(items, shown=PAGE_SIZE) {
  const count = Math.max(0, Math.min(items.length, Math.floor(Number(shown)||0)));
  return {visible:items.slice(0,count), total:items.length, hasMore:count<items.length};
}
export function createDemoProducts(size=520) {
  // Disponível apenas quando a URL contém ?demo=1. Nenhum item é real.
  return Array.from({length:size},(_,i)=>{
    const cat=CATEGORIES[i%CATEGORIES.length];
    return {
      id:`demo-${String(i+1).padStart(4,"0")}`,
      name:`Item ilustrativo ${String(i+1).padStart(3,"0")}`,
      categoryId:cat.id,
      brand:`Marca teste ${String.fromCharCode(65 + (i%3))}`,
      shortDescription:"Exemplo fictício usado somente para testar a busca e os filtros.",
      status:i%7===0?"inquiry":i%11===0?"unavailable":"available",
      tags:["demonstração",cat.name],
      addedAt:new Date(Date.UTC(2026,0,1+(i%300))).toISOString(),
      demo:true
    };
  });
}
