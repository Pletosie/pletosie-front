import { Suspense } from "react";
import { Shop } from "@/components/shop";
import { getProducts } from "@/lib/catalog";
export const metadata = { title: "Collection" };
export default async function Catalogue() {
  return (
    <Suspense fallback={<p className="wrap">Chargement de la collection…</p>}>
      <Shop catalogue initialProducts={await getProducts()} />
    </Suspense>
  );
}
