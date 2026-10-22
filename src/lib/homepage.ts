import type { Product } from "./types";
export type Homepage = {
  heroProductId: string;
  title: string;
  subtitle: string;
  selectionTitle: string;
  hero: string[];
  looks: string[];
  selection: string[];
  campaigns: string[];
};
export function defaultHomepage(products: Product[]): Homepage {
  products = products.filter((p) => p.published);
  return {
    heroProductId: "",
    title: "Entrez. Repérez. Craquez.",
    subtitle: "La pièce qui change tout ? Elle vous attend ici.",
    selectionTitle: "Votre prochain coup de cœur.",
    hero: products.slice(0, 2).map((p) => p.id),
    looks: ["Robes", "Ensembles", "Hauts", "Jupes"].flatMap((c) => {
      const p = products.find((p) => p.category === c);
      return p ? [p.id] : [];
    }),
    selection: products.slice(0, 24).map((p) => p.id),
    campaigns: products
      .filter((p) => ["Robes", "Ensembles"].includes(p.category))
      .slice(0, 2)
      .map((p) => p.id),
  };
}
export function homepageProducts(ids: string[], products: Product[]) {
  return ids.flatMap((id) => {
    const product = products.find((p) => p.id === id && p.published);
    return product ? [product] : [];
  });
}
