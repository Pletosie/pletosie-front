"use client";
import Link from "next/link";
import { FashionImage } from "./retail";
import { useEffect, useState } from "react";
import { type Product, money } from "@/lib/types";
import { api } from "@/lib/api";
import { useStore } from "./store";
import { Icon } from "./icon";
export function ProductDetail({ product: p }: { product: Product }) {
  const { add } = useStore();
  const colors = [...new Map(p.variants.map((v) => [v.color, v])).values()];
  const [color, setColor] = useState(colors[0]?.color || "");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const variant = p.variants.find((v) => v.color === color && v.size === size);
  const photo = p.variants.find((v) => v.color === color)?.image || p.image;
  useEffect(() => {
    void api("/analytics", {
      method: "POST",
      body: JSON.stringify({
        kind: "product_view",
        productId: p.id,
        quantity: 1,
      }),
    }).catch(() => {});
  }, [p.id]);
  return (
    <section className="wrap detail">
      <div className="breadcrumbs">
        <Link href="/catalogue">Collection</Link> / {p.category} / {p.name}
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-image">
            <FashionImage
              src={photo}
              alt={`${p.name}, coloris ${color}`}
              priority
            />
            <span className="product-tag">Visuel de présentation</span>
            <div className="photo-colors">
              {colors.map((v) => (
                <button
                  key={v.color}
                  aria-label={"Voir le coloris " + v.color}
                  aria-pressed={color === v.color}
                  onClick={() => {
                    setColor(v.color);
                    setSize("");
                  }}
                >
                  <FashionImage src={v.image} alt={v.color} />
                </button>
              ))}
            </div>
          </div>
          {Boolean(p.videos?.length) && (
            <section className="creation-videos">
              <h2>La pièce en mouvement.</h2>
              {p.videos?.map((url, i) => (
                <video
                  key={url}
                  src={url}
                  controls
                  playsInline
                  preload="none"
                  aria-label={p.name + ", vidéo " + (i + 1)}
                />
              ))}
            </section>
          )}
        </div>
        <div className="detail-info">
          <span className="eyebrow">
            L’ATELIER · {p.category.toUpperCase()}
          </span>
          <h1>{p.name}</h1>
          <p className="detail-price">{money(variant?.price ?? p.price)}</p>
          <p className="muted">
            Choisissez votre couleur, trouvez votre taille. Faites-en votre
            prochaine pièce forte.
          </p>
          <hr />
          <fieldset>
            <legend>
              Coloris · <strong>{color}</strong>
            </legend>
            <div className="choices">
              {colors.map((v) => (
                <button
                  key={v.color}
                  className={
                    color === v.color ? "color-choice chosen" : "color-choice"
                  }
                  onClick={() => {
                    setColor(v.color);
                    setSize("");
                  }}
                >
                  <span style={{ background: v.hex }} />
                  {v.color}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>
              Taille{" "}
              <Link href="/guide-des-tailles" className="size-guide">
                Guide des mesures <Icon name="arrow-up-right" size={13} />
              </Link>
            </legend>
            <div className="choices">
              {["XS", "S", "M", "L", "XL", "XXL"].map((s) => {
                const found = p.variants.find(
                  (v) => v.color === color && v.size === s,
                );
                return (
                  <button
                    key={s}
                    disabled={!found || found.stock < 1}
                    className={size === s ? "size chosen" : "size"}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="buy-row">
            <label className="quantity">
              Qté{" "}
              <input
                type="number"
                min="1"
                max={Math.min(20, variant?.stock || 20)}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <button
              className="button"
              onClick={() => {
                if (!variant) {
                  setError("Choisissez votre taille.");
                  return;
                }
                if (
                  !Number.isInteger(quantity) ||
                  quantity < 1 ||
                  quantity > Math.min(20, variant.stock)
                ) {
                  setError("Vérifiez la quantité disponible.");
                  return;
                }
                setError("");
                add({
                  productId: p.id,
                  variantId: variant.id,
                  quantity,
                  name: p.name,
                  color,
                  size,
                  price: variant.price,
                  image: photo,
                });
              }}
            >
              <Icon name="bag" size={19} /> Ajouter au panier
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Link
            href={`/conversations?produit=${p.id}${variant ? `&variante=${variant.id}` : ""}`}
            className="discuss"
          >
            <Icon name="chat" size={19} /> Discuter de cet article{" "}
            <Icon name="arrow-up-right" size={17} />
          </Link>
          <div className="product-facts">
            <p>
              <Icon name="needle" size={18} />{" "}
              {p.madeToOrder
                ? "Confection à la commande · capacité limitée"
                : "Pièce disponible selon le stock indiqué"}
            </p>
            <p>
              <Icon name="truck" size={18} /> Objectif de livraison : 3 jours
              après paiement
            </p>
          </div>
          <details open>
            <summary>Matière & entretien</summary>
            <p>
              {p.material}. {p.care}
            </p>
          </details>
          <details>
            <summary>Les détails de votre pièce</summary>
            <p>{p.description}</p>
            <p>
              Référence : {variant?.id || p.id}. Les mesures du guide sont
              spécifiques à Pletosie. Vérifiez-les avant de commander.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
