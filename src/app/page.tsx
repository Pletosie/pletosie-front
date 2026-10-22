import { SERVER_API } from "@/lib/api";
import type { Homepage } from "@/lib/homepage";
import { Shop } from "@/components/shop";
import { getProducts } from "@/lib/catalog";
import { Suspense } from "react";
export default async function Home() {
  const productsPromise = getProducts();
  let homepage: Homepage | null = null;
  try {
    const response = await fetch(SERVER_API + "/homepage", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) homepage = await response.json();
  } catch {}
  return (
    <Suspense fallback={<p className="wrap page">L’atelier se prépare…</p>}>
      <Shop initialProducts={await productsPromise} homepage={homepage} />
    </Suspense>
  );
}
