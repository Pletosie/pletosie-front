"use client";
import Link from "next/link";
import { FashionImage } from "@/components/retail";
import { useStore } from "@/components/store";
import { money } from "@/lib/types";
import { Icon } from "@/components/icon";
export default function Cart() {
  const { lines, change, ready } = useStore();
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return (
    <section className="wrap page">
      <span className="eyebrow">VOTRE SÉLECTION</span>
      <h1>
        Mon panier{" "}
        <span className="muted">
          ({lines.reduce((s, l) => s + l.quantity, 0)})
        </span>
      </h1>
      {!ready ? (
        <p>Chargement du panier…</p>
      ) : !lines.length ? (
        <div className="empty">
          <Icon name="bag" size={42} />
          <h2>Votre prochaine pièce vous attend.</h2>
          <p>Explorez la collection et composez votre sélection.</p>
          <Link className="button" href="/catalogue">
            Découvrir la collection <Icon name="arrow" size={18} />
          </Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <div>
            {lines.map((l) => (
              <article className="cart-line" key={l.variantId}>
                <FashionImage src={l.image} alt={l.name} />
                <div>
                  <h2>{l.name}</h2>
                  <p>
                    {l.color} · Taille{" "}
                    {({ P1: "S", P2: "M", P3: "L" } as Record<string, string>)[
                      l.size
                    ] || l.size}
                  </p>
                  <strong>{money(l.price)}</strong>
                  <div className="cart-controls">
                    <button
                      onClick={() => change(l.variantId, l.quantity - 1)}
                      aria-label={`Réduire ${l.name}`}
                    >
                      <Icon name="minus" size={15} />
                    </button>
                    <span>{l.quantity}</span>
                    <button
                      onClick={() => change(l.variantId, l.quantity + 1)}
                      disabled={l.quantity >= 20}
                      aria-label={`Augmenter ${l.name}`}
                    >
                      <Icon name="plus" size={15} />
                    </button>
                    <button
                      className="remove"
                      onClick={() => change(l.variantId, 0)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
                <strong>{money(l.price * l.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary">
            <h2>Votre récapitulatif</h2>
            <p>
              <span>Sous-total</span>
              <strong>{money(total)}</strong>
            </p>
            <p>
              <span>Livraison</span>
              <span>À calculer</span>
            </p>
            <hr />
            <p>
              <strong>Total articles</strong>
              <strong>{money(total)}</strong>
            </p>
            <Link className="button" href="/commande">
              Continuer <Icon name="arrow" size={18} />
            </Link>
            <small>
              Les prix, stocks et frais seront revérifiés avant le paiement.
              Votre panier ne réserve pas les pièces.
            </small>
            <Link className="text-link" href="/catalogue">
              Poursuivre ma découverte
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
