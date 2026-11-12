// Direção de arte Raylis: fotografias editoriais de categoria.
// Estas imagens não representam produtos cadastrados ou marcas reais.
// A interface é HTML/CSS/JS e mantém os controles acessíveis e interativos.
export const CATEGORY_ARTWORK = Object.freeze({
  chas: "./assets/photos/category-chas.webp",
  suplementos: "./assets/photos/category-suplementos.webp",
  vitaminas: "./assets/photos/category-vitaminas.webp",
  alimentos: "./assets/photos/category-alimentos.webp",
  cuidados: "./assets/photos/category-cuidados.webp",
  outros: "./assets/photos/category-outros.webp"
});
export const HERO_ARTWORK = "./assets/photos/hero-tea.webp";
export function categoryArtwork(categoryId) {
  return CATEGORY_ARTWORK[categoryId] || CATEGORY_ARTWORK.outros;
}
