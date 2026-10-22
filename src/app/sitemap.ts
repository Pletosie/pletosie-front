import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL;
  if (!base) return [];
  const products = await getProducts();
  return [
    "",
    "/catalogue",
    "/guide-des-tailles",
    "/aide/livraison",
    "/aide/faq",
    ...products.map((p) => `/produit/${p.slug}`),
  ].map((path) => ({ url: `${base}${path}` }));
}
