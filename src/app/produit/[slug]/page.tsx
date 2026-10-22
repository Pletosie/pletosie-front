import { notFound } from "next/navigation";
import { getProducts } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/shop";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await getProducts()).find((p) => p.slug === slug);
  return { title: p?.name || "Article", description: p?.description };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <ProductDetail product={p} />
      <section className="wrap collection">
        <div className="section-title">
          <h2>Encore un coup de cœur ?</h2>
        </div>
        <div className="product-grid">
          {products
            .filter((other) => other.id !== p.id)
            .slice(0, 4)
            .map((other) => (
              <ProductCard key={other.id} product={other} />
            ))}
        </div>
      </section>
    </>
  );
}
