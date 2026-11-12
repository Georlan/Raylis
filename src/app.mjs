import {CATEGORIES,PAGE_SIZE,cleanProducts,selectProducts,categoryCounts,paginate,createDemoProducts,sanitizeImageSrc} from "./catalog.mjs";
import {CONTACT, productInquiryLink} from "./contacts.mjs";

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
const categoryIcons = {
  chas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C8 4 4 8 4 16a4 4 0 0 0 4 4c8 0 12-6 12-16Z"/><path d="M5 19c3-5 6-8 11-11"/></svg>',
  suplementos: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M8 8V4h8v4M9 13h6"/></svg>',
  vitaminas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.5 4.5 11 11a4.2 4.2 0 0 1-6 6l-11-11a4.2 4.2 0 0 1 6-6ZM8 16l8-8"/></svg>',
  alimentos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M18 3c-4 3-4 10 0 12v6"/></svg>',
  cuidados: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M9 17a3 3 0 0 0 3 3"/></svg>',
  outros: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
};


function setupContactLinks(){
  document.querySelectorAll('[data-contact="whatsapp"]').forEach(link=>link.href=CONTACT.whatsappUrl);
  document.querySelectorAll('[data-contact="instagram"]').forEach(link=>link.href=CONTACT.instagramUrl);
}

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
    <button class="category-tile ${state.category===cat.id?"active":""}" type="button" data-tile="${cat.id}" aria-label="Explorar ${escapeHtml(cat.name)}" aria-pressed="${state.category===cat.id}">
      <span class="tile-top"><span class="tile-icon">${categoryIcons[cat.id] || ""}</span><span class="tile-count">${catalogItems.length?counts[cat.id]:""}</span></span>
      <span class="tile-name">${escapeHtml(cat.name)}</span>
    </button>`).join("");
}
function renderQuickCategories(){
  const cats=[{id:"",name:"Todos"},...CATEGORIES];
  $("quick-categories").innerHTML=cats.map(cat=>`
    <button class="quick-category ${state.category===cat.id?"active":""}" type="button" data-quick-category="${cat.id}" aria-pressed="${state.category===cat.id}">${escapeHtml(cat.name)}</button>
  `).join("");
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
      ${image?`<img class="product-image" loading="lazy" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" />`:'<img class="placeholder-mark" src="./assets/raylis-symbol.svg" alt="" loading="lazy" />'}
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
  renderQuickCategories();
  renderTiles();
  renderActiveFilters();
  const filterCount=Number(!!state.category)+Number(!!state.brand)+Number(state.availability!=="all");
  $("filter-badge").textContent=filterCount;
  $("filter-badge").hidden=filterCount===0;
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
  const inquiryUrl=productInquiryLink(item);
  $("dialog-content").innerHTML=`
    <div class="dialog-visual">${image?`<img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}"/>`:'<img src="./assets/raylis-symbol.svg" class="placeholder-mark" alt="" />'}</div>
    <div class="dialog-body">
      <p class="eyebrow">${escapeHtml(categoryName(item.categoryId))}</p>
      <h2 id="dialog-title">${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.shortDescription || "Descrição detalhada em atualização.")}</p>
      <div class="detail-list">
        <div class="detail-row"><span>Marca</span><strong>${escapeHtml(item.brand||"A confirmar")}</strong></div>
        <div class="detail-row"><span>Disponibilidade</span><strong>${escapeHtml(item.demo?"Não comercializado":statusName(item.status))}</strong></div>
        ${item.sku?`<div class="detail-row"><span>Referência</span><strong>${escapeHtml(item.sku)}</strong></div>`:""}
      </div>
      <div class="dialog-disclaimer">${item.demo?"Este item é fictício e existe apenas para demonstrar a navegação do catálogo.":"Preços, disponibilidade e informações devem ser confirmados diretamente com a loja."}</div>
      ${inquiryUrl?`<a class="button button-primary dialog-inquiry" href="${escapeHtml(inquiryUrl)}" target="_blank" rel="noopener noreferrer">Consultar este produto pelo WhatsApp <span aria-hidden="true">↗</span></a>`:""}
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
function prefersReducedMotion(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}
function scrollCategories(direction){
  const rail=$("category-tiles");
  rail.scrollBy({left:direction*(rail.clientWidth*.72),behavior:prefersReducedMotion()?"auto":"smooth"});
}
function setupPointerEffects(){
  if(!window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion())return;
  const hero=$("hero-card");
  hero.addEventListener("pointermove",event=>{
    const rect=hero.getBoundingClientRect();
    hero.style.setProperty("--mouse-x",`${((event.clientX-rect.left)/rect.width-.5)*13}px`);
    hero.style.setProperty("--mouse-y",`${((event.clientY-rect.top)/rect.height-.5)*11}px`);
  });
  hero.addEventListener("pointerleave",()=>{hero.style.setProperty("--mouse-x","0px");hero.style.setProperty("--mouse-y","0px");});
  $("product-grid").addEventListener("pointermove",event=>{
    const card=event.target.closest(".product-card");
    if(!card)return;
    const rect=card.getBoundingClientRect();
    const x=((event.clientX-rect.left)/rect.width-.5)*3;
    const y=((event.clientY-rect.top)/rect.height-.5)*-3;
    card.style.setProperty("--tilt-x",`${x}deg`);
    card.style.setProperty("--tilt-y",`${y}deg`);
  });
  $("product-grid").addEventListener("pointerout",event=>{
    const card=event.target.closest(".product-card");
    if(card && !card.contains(event.relatedTarget)){card.style.removeProperty("--tilt-x");card.style.removeProperty("--tilt-y");}
  });
}
function setupSectionNavigation(){
  const header=document.querySelector(".site-header");
  const ids=["inicio","categorias","catalogo"];
  const nav=[...document.querySelectorAll("[data-nav-section]")];
  const update=()=>{
    header.classList.toggle("is-scrolled",window.scrollY>20);
    const threshold=window.scrollY+window.innerHeight*.42;
    let active="inicio";
    for(const id of ids){const section=$(id);if(section && section.getBoundingClientRect().top+window.scrollY<=threshold)active=id;}
    for(const item of nav){
      const selected=item.dataset.navSection===active;
      item.classList.toggle("is-active",selected);
      if(selected)item.setAttribute("aria-current","location");else item.removeAttribute("aria-current");
    }
  };
  window.addEventListener("scroll",update,{passive:true});
  window.addEventListener("resize",update,{passive:true});
  update();
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
  $("category-tiles").addEventListener("click",event=>{const tile=event.target.closest("[data-tile]");if(!tile)return;setState({category:tile.dataset.tile});$("catalogo").scrollIntoView({behavior:prefersReducedMotion()?"auto":"smooth"});});
  $("quick-categories").addEventListener("click",event=>{const button=event.target.closest("[data-quick-category]");if(button)setState({category:button.dataset.quickCategory});});
  $("category-prev").addEventListener("click",()=>scrollCategories(-1));
  $("category-next").addEventListener("click",()=>scrollCategories(1));
  $("header-search").addEventListener("click",()=>{
    $("catalogo").scrollIntoView({behavior:prefersReducedMotion()?"auto":"smooth"});
    setTimeout(()=>$("search-input").focus({preventScroll:true}),prefersReducedMotion()?0:320);
  });
  $("filter-apply").addEventListener("click",()=>{closeFilters();$("filter-toggle").focus();});
  $("active-filters").addEventListener("click",event=>{const chip=event.target.closest("[data-remove]");if(!chip)return;const key=chip.dataset.remove;setState({[key]:key==="availability"?"all":""});});
  $("reset-filters").addEventListener("click",clearFilters);
  $("empty-action").addEventListener("click",clearFilters);
  $("load-more").addEventListener("click",()=>{state.shown+=PAGE_SIZE;render();});
  $("product-grid").addEventListener("click",event=>{const button=event.target.closest("[data-product-id]");if(button)openProduct(button.dataset.productId);});
  $("product-grid").addEventListener("error",event=>{const img=event.target;if(img.matches("img.product-image")){img.src="./assets/raylis-symbol.svg";img.className="placeholder-mark";img.alt="";}},true);
  $("filter-toggle").addEventListener("click",openFilters);
  $("filter-close").addEventListener("click",()=>{closeFilters();$("filter-toggle").focus();});
  $("filters-backdrop").addEventListener("click",closeFilters);
  $("dialog-close").addEventListener("click",()=>$("product-dialog").close());
  $("product-dialog").addEventListener("click",event=>{if(event.target===$("product-dialog"))$("product-dialog").close();});
  setupPointerEffects();
  setupSectionNavigation();
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeFilters();});
  const menu=$("menu-toggle"), mobile=$("mobile-nav");
  menu.addEventListener("click",()=>{const next=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(next));menu.setAttribute("aria-label",next?"Fechar menu":"Abrir menu");mobile.hidden=!next;});
  mobile.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobile.hidden=true;menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Abrir menu");}));
}
async function init(){
  $("year").textContent=new Date().getFullYear();
  setupContactLinks();
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
  render();
}
init();
