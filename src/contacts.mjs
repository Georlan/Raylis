/**
 * Canais confirmados pelo responsável da marca.
 * Site estático: nenhum serviço, token, API ou backend necessário.
 */
export const CONTACT = Object.freeze({
  phoneDigits: "5588921917797",
  phoneLabel: "+55 (88) 92191-7797",
  whatsappUrl: "https://wa.me/5588921917797",
  instagramUrl: "https://www.instagram.com/raylis_produtosnaturais/",
  instagramHandle: "@raylis_produtosnaturais",
  city: "Jaguaribara",
  state: "CE"
});

export function whatsappLink(message = "") {
  const text = String(message ?? "").trim();
  return text
    ? `${CONTACT.whatsappUrl}?text=${encodeURIComponent(text)}`
    : CONTACT.whatsappUrl;
}

export function productInquiryLink(product) {
  if (!product || product.demo || typeof product.name !== "string" || !product.name.trim()) {
    return null;
  }
  const name = product.name.trim();
  const reference = typeof product.sku === "string" && product.sku.trim()
    ? ` (ref. ${product.sku.trim()})`
    : "";
  return whatsappLink(`Olá, Raylis! Vi ${name}${reference} no catálogo e gostaria de saber mais sobre a disponibilidade e os detalhes do produto.`);
}
