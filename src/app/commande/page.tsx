"use client";
import { CheckoutHeading } from "@/components/checkout-heading";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { beninNationalNumber } from "@/lib/benin-phone";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
import { useStore } from "@/components/store";
type Settings = {
  zones: { id: string; name: string; fee: number }[];
  commerceEnabled: boolean;
};
export default function Checkout() {
  const { lines, user, clear } = useStore();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [zone, setZone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  useEffect(() => setKey(crypto.randomUUID()), []);
  useEffect(() => {
    api<Settings>("/settings")
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, []);
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const fee = settings?.zones.find((z) => z.id === zone)?.fee || 0;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const order = await api<{ id: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: lines.map(({ productId, variantId, quantity }) => ({
            productId,
            variantId,
            quantity,
          })),
          address: {
            name: f.get("name"),
            phone: "229" + beninNationalNumber(String(f.get("phone"))),
            details: f.get("details"),
            zone,
          },
          key,
          termsVersion: "2026-10-draft",
          accepted: f.get("accepted") === "on",
          expectedTotal: subtotal + fee,
        }),
      });
      clear();
      router.push(`/paiement/${order.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="wrap page commerce-page">
      <CheckoutHeading
        step={2}
        eyebrow="DERNIERS DÉTAILS"
        title="À vous de jouer."
      />
      {!user ? (
        <div className="empty">
          <h2>Connectez-vous pour continuer.</h2>
          <p>Votre panier reste conservé sur cet appareil.</p>
          <Link href="/compte" className="button">
            Accéder à mon compte
          </Link>
        </div>
      ) : !lines.length ? (
        <div className="empty">
          <h2>Votre panier est vide.</h2>
          <Link href="/catalogue" className="button">
            Explorer la collection
          </Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <form className="panel" onSubmit={submit}>
            <h2>Où livrer votre sélection ?</h2>
            {settings && !settings.commerceEnabled && (
              <p className="info">
                Les ventes ne sont pas encore ouvertes. Les zones, les
                conditions commerciales et FeexPay doivent être validés avant
                tout paiement.
              </p>
            )}
            <label>
              Nom du destinataire
              <input
                name="name"
                required
                minLength={2}
                defaultValue={user.name}
              />
            </label>
            <label>
              Téléphone
              <span className="benin-phone">
                <span aria-hidden="true">+229</span>
                <input name="phone" type="tel" required autoComplete="tel-national"
                  aria-label="Téléphone au Bénin" aria-describedby="delivery-phone-help"
                  inputMode="numeric" pattern="01[0-9]{8}" maxLength={20}
                  placeholder="01 XX XX XX XX"
                  title="Numéro béninois de 10 chiffres commençant par 01"
                  onChange={(e) => { e.currentTarget.value = beninNationalNumber(e.currentTarget.value); }} />
              </span>
              <small id="delivery-phone-help" className="phone-help">Entrez les 10 chiffres de votre numéro, sans +229.</small>
            </label>
            <label>
              Zone de livraison
              <select
                required
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              >
                <option value="">Choisissez votre zone</option>
                {settings?.zones.map((z) => (
                  <option value={z.id} key={z.id}>
                    {z.name} · {money(z.fee)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Adresse et repère
              <textarea
                name="details"
                required
                minLength={10}
                maxLength={500}
                rows={3}
              />
            </label>
            <label className="check">
              <input type="checkbox" name="accepted" required />
              J’accepte les{" "}
              <Link href="/aide/conditions">conditions de vente</Link>.
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button"
              disabled={busy || !settings?.commerceEnabled}
            >
              {busy ? "Vérification…" : "Vérifier et commander"}
            </button>
          </form>
          <aside className="summary">
            <h2>Votre sélection</h2>
            {lines.map((l) => (
              <p key={l.variantId}>
                <span>
                  {l.name} × {l.quantity}
                  <small>
                    {l.color} · {l.size}
                  </small>
                </span>
                <strong>{money(l.price * l.quantity)}</strong>
              </p>
            ))}
            <hr />
            <p>
              <span>Livraison</span>
              <strong>{zone ? money(fee) : "À préciser"}</strong>
            </p>
            <p>
              <strong>Total</strong>
              <strong>{money(subtotal + fee)}</strong>
            </p>
            <small>
              Paiement intégral par Mobile Money après vérification serveur.
              Aucun paiement ne sera présenté comme réussi sans confirmation du
              prestataire.
            </small>
          </aside>
        </div>
      )}
    </section>
  );
}
