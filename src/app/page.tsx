import { Shop } from "@/components/shop";
import { getProducts } from "@/lib/catalog";
import { Suspense } from "react";
export default async function Home() {
  return (
    <Suspense fallback={<p className="wrap page">L’atelier se prépare…</p>}>
      <Shop initialProducts={await getProducts()} />
    </Suspense>
  );
}
