import {CATEGORIES,PAGE_SIZE,cleanProducts,selectProducts,categoryCounts,paginate,createDemoProducts,sanitizeImageSrc} from "./catalog.mjs";

const $ = id => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const demoMode = params.get("demo") === "1";
const categoryIds = new Set(CATEGORIES.map(item=>item.id));
const validAvailability = new Set(["all","available","inquiry"]);
const validSorts = new Set(["name-asc","name-desc","newest"]);
const state = {
  q:params.get("q") || "",
  category:categoryIds.has(params.get("categoria"))?params.get("categoria"):"",
  brand:params.get("marca") || "",
  availability:validAvailability.has(params.get("status"))?params.get("status"):"all",
  sort:validSorts.has(params.get("ordem"))?params.get("ordem"):"name-asc",
  shown:PAGE_SIZE
};
let catalogItems = [];
let loadError = false;
let searchTimer;
const escapeHtml = value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const categoryName = id => CATEGORIES.find(cat=>cat.id===id)?.name || "Outros";
const statusName = status => ({"available":"Disponível","inquiry":"Sob consulta","unavailable":"Indisponível"})[status] || "A confirmar";

function syncUrl(){
  const url=new URL(window.location.href);
  const fields={q:state.q,categoria:state.category,marca:state.brand,status:state.availability==="all"?"":state.availability,ordem:state.sort==="name-asc"?"":state.sort};
  Object.entries(fields).forEach(([key,value])=>value?url.searchParams.set(key,value):url.searchParams.delete(key));
  window.history.replaceState(null,"",url.pathname+url.search+url.hash);
}
function setState(patch){
  Object.assign(state,patch,{shown:PAGE_SIZE});
  closeFilters();
  render();
  syncUrl();
}
function clearFilters(){setState({q:"",category:"",brand:"",availability:"all",sort:"name-asc"});}

function renderTiles(){
  const counts=categoryCounts(catalogItems);
  $("category-tiles").innerHTML=CATEGORIES.map(cat=>`
    <button class="category-tile" type="button" data-tile="${cat.id}" aria-label="Explorar ${escapeHtml(cat.name)}">
      <span class="tile-number">CATEGORIA ${cat.code}</span>
      <span class="tile-name">${escapeHtml(cat.name)}</span>
      <span class="tile-bottom"><span>${catalogItems.length ? `${counts[cat.id]} itens` : "EM BREVE"}</span><span class="tile-arrow" aria-hidden="true">↗</span></span>
    </button>`).join("");
}
function renderBrands(){
  const brands=[...new Set(catalogItems.map(item=>item.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  if(state.brand && !brands.includes(state.brand)) state.brand="";
  $("brand-select").innerHTML='<option value="">Todas as marcas</option>'+brands.map(brand=>`<option value="${escapeHtml(brand)}">${escapeHtml(brand)}</option>`).join("");
  $("brand-select").value=state.brand;
  $("brand-select").disabled=brands.length===0;
}
function renderCategories(){
  const counts=categoryCounts(catalogItems,state);
  const all=[{id:"",name:"Todas as categorias",count:counts.all},...CATEGORIES.map(c=>({...c,count:counts[c.id]}))];
  $("filter-categories").innerHTML=all.map(item=>`
    <button class="filter-cat ${state.category===item.id?"active":""}" data-category="${escapeHtml(item.id)}" type="button" aria-pressed="${state.category===item.id}">
      <span>${escapeHtml(item.name)}</span><span>${item.count}</span>
    </button>`).join("");
}
function renderActiveFilters(){
  const tags=[];
  if(state.q) tags.push({field:"q",label:`Busca: ${state.q}`});
  if(state.category) tags.push({field:"category",label:categoryName(state.category)});
  if(state.brand) tags.push({field:"brand",label:state.brand});
  if(state.availability!=="all") tags.push({field:"availability",label:statusName(state.availability)});
  $("active-filters").innerHTML=tags.map(tag=>`<button class="filter-chip" type="button" data-remove="${tag.field}" aria-label="Remover filtro ${escapeHtml(tag.label)}">${escapeHtml(tag.label)} ×</button>`).join("");
}
function renderCard(item){
  const image=sanitizeImageSrc(item.imageUrl);
  return `<article class="product-card">
    <div class="product-visual">
      <span class="product-tag">${item.demo?"EXEMPLO FICTÍCIO":escapeHtml(statusName(item.status))}</span>
      ${image?`<img class="product-image" loading="lazy" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" />`:'<img class="placeholder-mark" src="./assets/raylis-mark.svg" alt="" loading="lazy" />'}
    </div>
    <div class="product-card-body">
      <span class="product-category">${escapeHtml(categoryName(item.categoryId))}</span>
      <h3 class="product-name">${escapeHtml(item.name)}</h3>
      <p class="product-meta">${escapeHtml(item.brand || (item.demo?"Apenas demonstração":"Informações em atualização"))}</p>
      <button class="product-view" type="button" data-product-id="${escapeHtml(item.id)}">Ver detalhes <span aria-hidden="true">↗</span></button>
    </div>
  </article>`;
}
function render(){
  $("search-input").value=state.q;
  $("search-clear").hidden=!state.q;
  $("sort-select").value=state.sort;
  $("brand-select").value=state.brand;
  document.querySelectorAll('input[name="availability"]').forEach(input=>input.checked=input.value===state.availability);
  renderCategories();
  renderActiveFilters();
  const items=selectProducts(catalogItems,state);
  const {visible,total,hasMore}=paginate(items,state.shown);
  $("product-grid").innerHTML=visible.map(renderCard).join("");
  $("product-grid").setAttribute("aria-busy","false");
  $("results-count").textContent=loadError?"Não foi possível carregar os produtos.":(!catalogItems.length?"Catálogo em preparação":`${total.toLocaleString("pt-BR")} ${total===1?"produto encontrado":"produtos encontrados"}`);
  const empty=total===0;
  $("empty-state").hidden=!empty;
  if(empty){
    const noCatalog=!catalogItems.length;
    $("empty-eyebrow").textContent=loadError?"FALHA NO CARREGAMENTO":noCatalog?"EM PREPARAÇÃO":"NENHUM RESULTADO";
    $("empty-title").textContent=loadError?"Não conseguimos carregar os itens.":noCatalog?"Novidades estão chegando.":"Não encontramos esse produto.";
    $("empty-description").textContent=loadError?"Tente atualizar a página. Se o problema continuar, o catálogo pode estar temporariamente indisponível.":noCatalog?"Estamos organizando os produtos para você encontrá-los com facilidade. Volte em breve para explorar o catálogo completo.":"Tente usar outro termo de busca ou remova alguns filtros para ver mais opções.";
    $("empty-action").hidden=noCatalog||loadError;
  }
  $("load-area").hidden=empty;
  if(!empty){
    $("load-progress").textContent=`Mostrando ${visible.length.toLocaleString("pt-BR")} de ${total.toLocaleString("pt-BR")} produtos`;
    $("progress-fill").style.width=`${Math.round(visible.length/total*100)}%`;
    $("load-more").hidden=!hasMore;
  }
}
function openProduct(id){
  const item=catalogItems.find(product=>product.id===id);
  if(!item)return;
  const image=sanitizeImageSrc(item.imageUrl);
  $("dialog-content").innerHTML=`
    <div class="dialog-visual">${image?`<img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}"/>`:'<img src="./assets/raylis-mark.svg" class="placeholder-mark" alt="" />'}</div>
    <div class="dialog-body">
      <p class="eyebrow">${escapeHtml(categoryName(item.categoryId))}</p>
      <h2 id="dialog-title">${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.shortDescription || "Descrição detalhada em atualização.")}</p>
      <div class="detail-list">
        <div class="detail-row"><span>Marca</span><strong>${escapeHtml(item.brand||"A confirmar")}</strong></div>
        <div class="detail-row"><span>Disponibilidade</span><strong>${escapeHtml(item.demo?"Não comercializado":statusName(item.status))}</strong></div>
        ${item.sku?`<div class="detail-row"><span>Referência</span><strong>${escapeHtml(item.sku)}</strong></div>`:""}
      </div>
      <div class="dialog-disclaimer">${item.demo?"Este item é fictício e existe apenas para demonstrar a navegação do catálogo.":"Detalhes, preços e formas de atendimento serão confirmados após o cadastro oficial."}</div>
    </div>`;
  $("product-dialog").showModal();
}
function openFilters(){
  $("filters-panel").classList.add("is-open");
  $("filter-toggle").setAttribute("aria-expanded","true");
  $("filters-backdrop").hidden=false;
  document.body.classList.add("no-scroll");
  $("filter-close").focus();
}
function closeFilters(){
  $("filters-panel").classList.remove("is-open");
  $("filter-toggle").setAttribute("aria-expanded","false");
  $("filters-backdrop").hidden=true;
  document.body.classList.remove("no-scroll");
}
function setupEvents(){
  $("search-form").addEventListener("submit",event=>{event.preventDefault();clearTimeout(searchTimer);setState({q:$("search-input").value.trim()});});
  $("search-input").addEventListener("input",event=>{
    const value=event.target.value;
    $("search-clear").hidden=!value;
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>setState({q:value.trim()}),180);
  });
  $("search-clear").addEventListener("click",()=>{clearTimeout(searchTimer);setState({q:""});$("search-input").focus();});
  $("sort-select").addEventListener("change",event=>setState({sort:event.target.value}));
  $("brand-select").addEventListener("change",event=>setState({brand:event.target.value}));
  document.querySelectorAll('input[name="availability"]').forEach(input=>input.addEventListener("change",event=>setState({availability:event.target.value})));
  $("filter-categories").addEventListener("click",event=>{const button=event.target.closest("[data-category]");if(button)setState({category:button.dataset.category});});
  $("category-tiles").addEventListener("click",event=>{const tile=event.target.closest("[data-tile]");if(!tile)return;setState({category:tile.dataset.tile});$("catalogo").scrollIntoView({behavior:"smooth"});});
  $("active-filters").addEventListener("click",event=>{const chip=event.target.closest("[data-remove]");if(!chip)return;const key=chip.dataset.remove;setState({[key]:key==="availability"?"all":""});});
  $("reset-filters").addEventListener("click",clearFilters);
  $("empty-action").addEventListener("click",clearFilters);
  $("load-more").addEventListener("click",()=>{state.shown+=PAGE_SIZE;render();});
  $("product-grid").addEventListener("click",event=>{const button=event.target.closest("[data-product-id]");if(button)openProduct(button.dataset.productId);});
  $("product-grid").addEventListener("error",event=>{const img=event.target;if(img.matches("img.product-image")){img.src="./assets/raylis-mark.svg";img.className="placeholder-mark";img.alt="";}},true);
  $("filter-toggle").addEventListener("click",openFilters);
  $("filter-close").addEventListener("click",()=>{closeFilters();$("filter-toggle").focus();});
  $("filters-backdrop").addEventListener("click",closeFilters);
  $("dialog-close").addEventListener("click",()=>$("product-dialog").close());
  $("product-dialog").addEventListener("click",event=>{if(event.target===$("product-dialog"))$("product-dialog").close();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeFilters();});
  const menu=$("menu-toggle"), mobile=$("mobile-nav");
  menu.addEventListener("click",()=>{const next=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(next));menu.setAttribute("aria-label",next?"Fechar menu":"Abrir menu");mobile.hidden=!next;});
  mobile.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobile.hidden=true;menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Abrir menu");}));
}
async function init(){
  $("year").textContent=new Date().getFullYear();
  $("mobile-nav").hidden=true;
  setupEvents();
  if(demoMode){
    $("demo-notice").hidden=false;
    catalogItems=createDemoProducts(520);
  } else {
    try {
      const response=await fetch("./data/products.json",{cache:"no-cache"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      catalogItems=cleanProducts(await response.json());
    } catch(error){loadError=true;console.error("Falha ao carregar catálogo:",error);}
  }
  renderBrands();
  renderTiles();
  render();
}
init();
