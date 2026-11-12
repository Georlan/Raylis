// Ilustrações editoriais próprias da Raylis, sem marcas de terceiros ou produtos inventados.
// O mapeamento só contém arquivos locais de SVG e pode ser reutilizado nas telas.
export const CATEGORY_ARTWORK=Object.freeze({
  chas:"./assets/illustrations/category-chas.svg",
  suplementos:"./assets/illustrations/category-suplementos.svg",
  vitaminas:"./assets/illustrations/category-vitaminas.svg",
  alimentos:"./assets/illustrations/category-alimentos.svg",
  cuidados:"./assets/illustrations/category-cuidados.svg",
  outros:"./assets/illustrations/category-outros.svg"
});
export const HERO_ARTWORK="./assets/illustrations/hero-ritual.svg";
export function categoryArtwork(categoryId){
  return CATEGORY_ARTWORK[categoryId] || CATEGORY_ARTWORK.outros;
}
