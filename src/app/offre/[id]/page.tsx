"use client";
import { CheckoutHeading } from "@/components/checkout-heading";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
type Offer = {
  id: string;
  description: string;
  price: number;
  deliveryFee: number;
  quantity: number;
  version: number;
  expiresAt: string;
  status: string;
};
export default function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [zones, setZones] = useState<{ id: string; name: string }[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setKey(crypto.randomUUID());
    void Promise.all([
      api<Offer>(`/offers/${id}`),
      api<{ zones: typeof zones; commerceEnabled: boolean }>("/settings"),
    ])
      .then(([o, s]) => {
        setOffer(o);
        setZones(s.zones);
        setEnabled(s.commerceEnabled);
      })
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <section className="wrap page commerce-page offer-page">
      <CheckoutHeading
        step={2}
        eyebrow="VOTRE PROPOSITION PERSONNALISÉE"
        title="Une création. Pour vous."
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {offer && (
        <>
          <div className="panel">
            <span className="badge">
              Version {offer.version} · {offer.status}
            </span>
            <p>{offer.description}</p>
            <p>
              {offer.quantity} pièce(s) · Prix de la proposition :{" "}
              {money(offer.price)}
              <br />
              Livraison : {money(offer.deliveryFee)}
            </p>
            <strong>Total : {money(offer.price + offer.deliveryFee)}</strong>
            <p>
              Valable jusqu’au{" "}
              {new Date(offer.expiresAt).toLocaleString("fr-FR", {
                timeZone: "Africa/Porto-Novo",
              })}
              . Livraison prévue sous trois jours après paiement, sous réserve
              de capacité.
            </p>
          </div>
          {!enabled && (
            <p className="info">
              Les ventes restent fermées avant validation des paramètres
              commerciaux et du compte marchand.
            </p>
          )}
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const f = new FormData(e.currentTarget);
              try {
                const o = await api<{ id: string }>(`/offers/${id}/accept`, {
                  method: "POST",
                  body: JSON.stringify({
                    key,
                    address: {
                      name: f.get("name"),
                      phone: f.get("phone"),
                      details: f.get("details"),
                      zone: f.get("zone"),
                    },
                    termsVersion: "2026-10-draft",
                    accepted: f.get("accepted") === "on",
                    expectedTotal: offer.price + offer.deliveryFee,
                  }),
                });
                router.push(`/paiement/${o.id}`);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2>Votre livraison</h2>
            <label>
              Destinataire
              <input name="name" required minLength={2} />
            </label>
            <label>
              Téléphone
              <input name="phone" type="tel" required minLength={8} />
            </label>
            <label>
              Zone
              <select name="zone" required>
                <option value="">Votre zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Adresse et repère
              <textarea name="details" minLength={10} required />
            </label>
            <label className="check">
              <input name="accepted" type="checkbox" required />
              J’accepte cette version de la proposition et les conditions de
              vente.
            </label>
            <button
              className="button"
              disabled={busy || !enabled || offer.status !== "pending"}
            >
              Accepter et commander
            </button>
          </form>
        </>
      )}
    </section>
  );
}
