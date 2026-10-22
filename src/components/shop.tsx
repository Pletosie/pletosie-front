"use client";
import {
  defaultHomepage,
  homepageProducts,
  type Homepage,
} from "@/lib/homepage";
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
  homepage,
}: {
  initialProducts: Product[];
  catalogue?: boolean;
  homepage?: Homepage | null;
}) {
  const config = homepage || defaultHomepage(initialProducts);
  const heroProduct = initialProducts.find(
    (p) => p.id === config.heroProductId,
  );
  const featured = homepageProducts(config.selection, initialProducts);
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
    setSort(params.get("tri") || "recent");
    setSize(params.get("taille") || "");
    setColor(params.get("couleur") || "");
    setMax(params.get("prix") || "");
    setAvailable(params.get("disponible") === "1");
    setLimit(12);
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
  const activeFilters = [
    q,
    size,
    color,
    max,
    available,
    sort !== "recent",
  ].filter(Boolean).length;
  function resetFilters() {
    setQ("");
    setSize("");
    setColor("");
    setMax("");
    setAvailable(false);
    setSort("recent");
    setLimit(12);
    const next = new URLSearchParams();
    if (category !== "Tout voir") next.set("categorie", category);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (next.size ? `?${next}` : ""),
    );
  }
  const products = (catalogue ? initialProducts : featured)
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
                {config.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span>{config.title.split(" ").at(-1)}</span>
              </h1>
              <p>{config.subtitle}</p>
              <Link
                href={
                  heroProduct ? "/produit/" + heroProduct.slug : "/catalogue"
                }
                className="button"
              >
                Je trouve mon look <Icon name="arrow" size={20} />
              </Link>
              <Link href="#looks" className="hero-secondary">
                Explorer les styles <Icon name="arrow-down" size={14} />
              </Link>
            </div>
            <div className="retail-hero-art">
              <div className="hero-orbit" />
              {heroProduct ? (
                <FashionImage
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  className="hero-main-image"
                  priority
                />
              ) : (
                <img
                  src="/editorial/hero-pletosie.png"
                  alt="La collection Pletosie"
                  fetchPriority="high"
                />
              )}
              <span className="hero-burst">
                LE STYLE
                <br />
                C’EST VOUS <Icon name="arrow-up-right" size={15} />
              </span>
              {homepageProducts(config.hero, initialProducts).map((p, i) => (
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
              {homepageProducts(config.looks, initialProducts).map((p) => {
                const c = p.category;
                return (
                  <Link
                    key={p.id}
                    href={"/catalogue?categorie=" + encodeURIComponent(c)}
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
      <section
        className={
          catalogue ? "collection wrap catalogue-page" : "collection wrap"
        }
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">
              {catalogue ? "LA BOUTIQUE" : "À DÉCOUVRIR"}
            </span>
            {catalogue ? (
              <h1 className="section-heading">
                {category !== "Tout voir"
                  ? category
                  : q
                    ? "Votre recherche"
                    : "Toute la collection"}
              </h1>
            ) : (
              <h2 className="section-heading">{config.selectionTitle}</h2>
            )}
          </div>
          <span className="muted">
            {products.length} pièce{products.length > 1 ? "s" : ""} à explorer
          </span>
        </div>
        <div className="catalog-toolbar">
          <nav className="tabs" aria-label="Filtrer par catégorie">
            {["Tout voir", "Robes", "Ensembles", "Hauts", "Jupes"].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "selected" : ""}
                onClick={() => {
                  setCategory(c);
                  update("categorie", c === "Tout voir" ? "" : c);
                }}
              >
                {c}
              </button>
            ))}
          </nav>
          <label className="sort">
            Trier par{" "}
            <span className="catalog-select">
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
              <Icon name="chevron-down" size={15} />
            </span>
          </label>
        </div>
        {catalogue && (
          <section
            className="catalog-filter-panel"
            aria-label="Affiner la collection"
          >
            <div className="catalog-filter-heading">
              <span>
                <Icon name="filters" size={17} /> Affiner votre sélection{" "}
                {activeFilters > 0 && <b>{activeFilters}</b>}
              </span>
              {activeFilters > 0 && (
                <button className="filter-reset" onClick={resetFilters}>
                  <Icon name="close" size={14} /> Réinitialiser
                </button>
              )}
            </div>
            <div className="filters">
              <label className="catalog-filter-field filter-search">
                <span>Rechercher</span>
                <span className="catalog-search-input">
                  <Icon name="search" size={18} />
                  <input
                    aria-label="Rechercher une pièce"
                    placeholder="Nom, style, envie…"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      update("q", e.target.value);
                    }}
                  />
                </span>
              </label>
              <label className="catalog-filter-field">
                <span>Taille</span>
                <span className="catalog-select">
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
                  <Icon name="chevron-down" size={15} />
                </span>
              </label>
              <label className="catalog-filter-field">
                <span>Coloris</span>
                <span className="catalog-select">
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
                  <Icon name="chevron-down" size={15} />
                </span>
              </label>
              <label className="catalog-filter-field">
                <span>Budget maximum</span>
                <span className="catalog-budget">
                  <input
                    type="number"
                    min="0"
                    aria-label="Prix maximum en FCFA"
                    placeholder="Votre budget"
                    value={max}
                    onChange={(e) => {
                      setMax(e.target.value);
                      update("prix", e.target.value);
                    }}
                  />
                  <span>FCFA</span>
                </span>
              </label>
              <label className="check catalog-stock">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => {
                    setAvailable(e.target.checked);
                    update("disponible", e.target.checked ? "1" : "");
                  }}
                />
                <span>En stock uniquement</span>
              </label>
            </div>
          </section>
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
          {homepageProducts(config.campaigns, initialProducts).map((p, i) => (
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
