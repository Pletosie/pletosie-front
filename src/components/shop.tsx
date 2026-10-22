"use client";
import Link from "next/link";
import { FashionImage } from "./retail";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { money } from "@/lib/types";
import { Icon } from "./icon";
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/produit/${p.slug}`} className="product-photo">
        <FashionImage src={p.image} alt={p.name} />
        <span className="product-tag">
          {p.madeToOrder ? "À confectionner" : "Collection atelier"}
        </span>
        <span className="discover">
          Découvrir la pièce <Icon name="arrow" size={17} />
        </span>
      </Link>
      <div className="card-meta">
        <span>{p.category}</span>
        <div className="swatches">
          {[...new Map(p.variants.map((v) => [v.color, v])).values()].map(
            (v) => (
              <span
                key={v.color}
                title={v.color}
                style={{ background: v.hex }}
              />
            ),
          )}
        </div>
      </div>
      <Link href={`/produit/${p.slug}`}>
        <h3>{p.name}</h3>
      </Link>
      <p className="price">{money(p.price)}</p>
    </article>
  );
}
export function Shop({
  initialProducts,
  catalogue = false,
}: {
  initialProducts: Product[];
  catalogue?: boolean;
}) {
  const params = useSearchParams();
  const [category, setCategory] = useState(
    params.get("categorie") || "Tout voir",
  );
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("tri") || "recent");
  const [size, setSize] = useState(params.get("taille") || "");
  const [color, setColor] = useState(params.get("couleur") || "");
  const [max, setMax] = useState(params.get("prix") || "");
  const [available, setAvailable] = useState(params.get("disponible") === "1");
  const [limit, setLimit] = useState(12);
  useEffect(() => {
    setCategory(params.get("categorie") || "Tout voir");
    setQ(params.get("q") || "");
  }, [params]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next.size ? `?${next}` : ""}`,
    );
    setLimit(12);
  }
  const products = initialProducts
    .filter(
      (p) =>
        (category === "Tout voir" || p.category === category) &&
        `${p.name} ${p.description} ${p.category}`
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (!max || p.price <= Number(max)) &&
        p.variants.some(
          (v) =>
            (!size || v.size === size) &&
            (!color || v.color === color) &&
            (!available || v.stock > 0),
        ),
    )
    .sort((a, b) =>
      sort === "asc"
        ? a.price - b.price
        : sort === "desc"
          ? b.price - a.price
          : 0,
    );
  return (
    <>
      {!catalogue && (
        <>
          <section className="retail-hero wrap">
            <div className="retail-hero-copy">
              <span className="eyebrow">LA COLLECTION PLETOSIE</span>
              <h1>
                Entrez.
                <br />
                Repérez.
                <br />
                <span>Craquez.</span>
              </h1>
              <p>
                La pièce qui change tout ?<br />
                Elle vous attend ici.
              </p>
              <Link href="/catalogue" className="button">
                Je trouve mon look <Icon name="arrow" size={20} />
              </Link>
              <Link href="#looks" className="hero-secondary">
                Explorer les styles <Icon name="arrow-down" size={14} />
              </Link>
            </div>
            <div className="retail-hero-art">
              <div className="hero-orbit" />
              <img
                src="/editorial/hero-pletosie.png"
                alt="Look de présentation Pletosie, blouse ivoire et pantalon chocolat"
                fetchPriority="high"
              />
              <span className="hero-burst">
                LE STYLE
                <br />
                C’EST VOUS <Icon name="arrow-up-right" size={15} />
              </span>
              {initialProducts.slice(0, 2).map((p, i) => (
                <Link
                  key={p.id}
                  href={"/produit/" + p.slug}
                  className={"floating-product floating-" + i}
                >
                  <FashionImage src={p.image} alt={p.name} />
                  <span>
                    {p.name}
                    <b>{money(p.price)}</b>
                  </span>
                  <Icon name="arrow-up-right" size={17} />
                </Link>
              ))}
            </div>
          </section>
          <div className="energy-strip">
            <span>VOTRE ALLURE</span>
            <b>
              <Icon name="asterisk" size={24} />
            </b>
            <span>VOTRE ÉNERGIE</span>
            <b>
              <Icon name="asterisk" size={24} />
            </b>
            <span>VOTRE PROCHAINE PIÈCE</span>
            <b>
              <Icon name="asterisk" size={24} />
            </b>
            <span>PLETOSIE</span>
          </div>
          <section className="look-section wrap" id="looks">
            <div className="section-title">
              <h2>À chaque envie, son look.</h2>
              <Link href="/catalogue" className="text-link">
                Tout explorer <Icon name="arrow-up-right" size={15} />
              </Link>
            </div>
            <div className="look-grid">
              {["Robes", "Ensembles", "Hauts", "Jupes"].map((c) => {
                const p = initialProducts.find((p) => p.category === c);
                return (
                  <Link
                    key={c}
                    href={"/catalogue?categorie=" + c}
                    className="look-card"
                  >
                    {p && <FashionImage src={p.image} alt={c} />}
                    <span>
                      {c}
                      <b>
                        <Icon name="arrow-up-right" size={16} />
                      </b>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
      <section className="collection wrap">
        <div className="section-title">
          <div>
            <span className="eyebrow">
              {catalogue ? "LA BOUTIQUE" : "À DÉCOUVRIR"}
            </span>
            {catalogue ? (
              <h1 className="section-heading">Toute la collection</h1>
            ) : (
              <h2 className="section-heading">Votre prochain coup de cœur.</h2>
            )}
          </div>
          <span className="muted">
            {products.length} pièce{products.length > 1 ? "s" : ""} à explorer
          </span>
        </div>
        <div className="catalog-toolbar">
          <div className="tabs">
            {["Tout voir", "Robes", "Ensembles", "Hauts", "Jupes"].map((c) => (
              <button
                key={c}
                className={category === c ? "selected" : ""}
                onClick={() => {
                  setCategory(c);
                  update("categorie", c === "Tout voir" ? "" : c);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="sort">
            Trier par{" "}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                update("tri", e.target.value);
              }}
            >
              <option value="recent">Nouveautés</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </label>
        </div>
        {catalogue && (
          <div className="filters">
            <input
              aria-label="Rechercher"
              placeholder="Rechercher une pièce…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                update("q", e.target.value);
              }}
            />
            <select
              aria-label="Taille"
              value={size}
              onChange={(e) => {
                setSize(e.target.value);
                update("taille", e.target.value);
              }}
            >
              <option value="">Toutes les tailles</option>
              {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Couleur"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                update("couleur", e.target.value);
              }}
            >
              <option value="">Tous les coloris</option>
              {[
                ...new Set(
                  initialProducts.flatMap((p) =>
                    p.variants.map((v) => v.color),
                  ),
                ),
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Budget maximum (FCFA)"
              aria-label="Prix maximum"
              value={max}
              onChange={(e) => {
                setMax(e.target.value);
                update("prix", e.target.value);
              }}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => {
                  setAvailable(e.target.checked);
                  update("disponible", e.target.checked ? "1" : "");
                }}
              />{" "}
              En stock
            </label>
          </div>
        )}
        <div className="demo-note">
          Collection démo · visuels de présentation générés, prix et stock de
          démonstration.
        </div>
        {products.length ? (
          <div className="product-grid">
            {products.slice(0, limit).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h2>
              {initialProducts.length
                ? "Aucune pièce ne correspond à votre recherche."
                : "L’atelier prépare sa collection."}
            </h2>
            <p>
              {initialProducts.length
                ? "Essayez une autre catégorie ou un autre filtre."
                : "Le catalogue sera disponible dès que le service sera connecté."}
            </p>
          </div>
        )}
        {products.length > limit && (
          <button
            className="button secondary load-more"
            onClick={() => setLimit((n) => n + 12)}
          >
            Voir plus de pièces
          </button>
        )}
      </section>
      {!catalogue && (
        <section className="campaign-grid wrap">
          {initialProducts
            .filter((p) => ["Robes", "Ensembles"].includes(p.category))
            .slice(0, 2)
            .map((p, i) => (
              <Link
                href={"/produit/" + p.slug}
                key={p.id}
                className={"campaign campaign-" + i}
              >
                <FashionImage src={p.image} alt={p.name} />
                <div>
                  <span className="eyebrow">
                    {i ? "LE LOOK COMPLET" : "LA PIÈCE FORTE"}
                  </span>
                  <h2>
                    {i
                      ? "Prête à faire sensation."
                      : "Une allure. Votre signature."}
                  </h2>
                  <span className="button">
                    Découvrir {p.name} <Icon name="arrow-up-right" size={15} />
                  </span>
                </div>
              </Link>
            ))}
        </section>
      )}
      <p className="footnote wrap">
        * Conditions et zones de livraison à valider avant l’ouverture des
        ventes.
      </p>
    </>
  );
}
