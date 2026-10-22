import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/catalogue", "/produit/", "/guide-des-tailles", "/aide/"],
      disallow: [
        "/admin",
        "/compte",
        "/commande",
        "/commandes",
        "/conversations",
        "/panier",
        "/paiement/",
        "/offre/",
      ],
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
