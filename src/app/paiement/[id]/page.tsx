"use client";
import { beninNationalNumber } from "@/lib/benin-phone";
import { DownloadReceipt } from "@/components/download-receipt";
import { CheckoutHeading } from "@/components/checkout-heading";
import { Icon } from "@/components/icon";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
type Attempt = { id: string; status: string; reference?: string };
export default function Payment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<{
    total: number;
    status: string;
    paymentStatus: string;
  } | null>(null);
  const [settings, setSettings] = useState<{
    paymentEnabled: boolean;
    operators: string[];
  } | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [operator, setOperator] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [o, s, a] = await Promise.all([
        api<typeof order>(`/orders/${id}`),
        api<typeof settings>("/settings"),
        api<Attempt[]>(`/orders/${id}/payments`),
      ]);
      setOrder(o);
      setSettings(s);
      setAttempts(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [id]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await api(`/orders/${id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          operator,
          phone: "229" + String(f.get("phone")).replace(/\D/g, ""),
        }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
      await load();
    } finally {
      setBusy(false);
    }
  }
  const labels: Record<string, string> = {
    initiating: "Initialisation en cours",
    pending: "En attente de votre validation sur le téléphone",
    unknown: "Statut inconnu — vérification serveur en cours",
    confirmed: "Paiement confirmé",
    failed: "Paiement refusé",
    exception: "Paiement reçu — examen nécessaire par l’atelier",
  };
  return (
    <section className="wrap page commerce-page payment-page">
      <CheckoutHeading
        step={3}
        eyebrow="PAIEMENT MOBILE MONEY"
        title={
          order?.paymentStatus === "confirmed"
            ? "C’est à vous."
            : "Plus qu’une étape."
        }
      />
      <div className="payment-layout">
        <aside className="payment-recap">
          <span className="eyebrow">VOTRE COMMANDE</span>
          <Icon
            name={order?.paymentStatus === "confirmed" ? "check" : "bag"}
            size={40}
          />
          <h2>
            {order?.paymentStatus === "confirmed"
              ? "Paiement confirmé"
              : "Votre prochain coup de cœur."}
          </h2>
          <p className="payment-total">
            {order ? money(order.total) : "Chargement…"}
          </p>
          <small>Référence {id.slice(0, 8).toUpperCase()}</small>
          <hr />
          <p>
            <Icon name="shield" size={18} /> Validation sécurisée sur votre
            téléphone
          </p>
          <p>
            <Icon name="orders" size={18} /> Suivi disponible dans vos commandes
          </p>
        </aside>
        <div className="payment-main panel">
          <span className="eyebrow">ON Y EST PRESQUE</span>
          <h2>
            {order?.paymentStatus === "confirmed"
              ? "Merci pour votre commande."
              : "Réglez avec Mobile Money."}
          </h2>
          <p className="muted">
            {order?.paymentStatus === "confirmed"
              ? "L’atelier prend le relais. Retrouvez l’avancement dans vos commandes."
              : "Choisissez votre opérateur, puis validez la demande sur votre téléphone."}
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {settings && !settings.paymentEnabled && (
            <p className="info">
              Le paiement attend l’activation du compte marchand FeexPay. Aucun
              encaissement ne sera lancé.
            </p>
          )}
          {attempts.map((a) => (
            <div key={a.id} className="payment-status" role="status">
              <h2>{labels[a.status] || a.status}</h2>
              {a.reference && <small>Référence : {a.reference}</small>}
              {!["confirmed", "failed", "exception"].includes(a.status) && (
                <button
                  className="text-link"
                  onClick={async () => {
                    try {
                      await api(`/payments/${a.id}/verify`, { method: "POST" });
                      await load();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Vérifier auprès de FeexPay{" "}
                  <Icon name="arrow-up-right" size={15} />
                </button>
              )}
            </div>
          ))}
          {!attempts.some((a) => a.status !== "failed") &&
            order?.status === "awaiting_payment" && (
              <form onSubmit={submit}>
                <label>
                  Opérateur
                  <select
                    required
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  >
                    <option value="">Choisissez l’opérateur</option>
                    {settings?.operators.map((o) => (
                      <option key={o} value={o}>
                        {o === "celtiis_bj" ? "Celtiis" : o.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Numéro Mobile Money
                  <span className="benin-phone">
                    <span aria-hidden="true">+229</span>
                    <input
                      aria-label="Numéro Mobile Money au Bénin"
                      aria-describedby="payment-phone-help"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      type="tel"
                      name="phone"
                      required
                      placeholder="01 XX XX XX XX"
                      pattern="01[0-9]{8}"
                      maxLength={20}
                      onChange={(e) => {
                        e.currentTarget.value = beninNationalNumber(
                          e.currentTarget.value,
                        );
                      }}
                      title="Numéro béninois de 10 chiffres commençant par 01"
                    />
                  </span>
                  <small id="payment-phone-help" className="phone-help">Entrez les 10 chiffres de votre numéro, sans +229.</small>
                </label>
                <button
                  className="button"
                  disabled={!settings?.paymentEnabled || busy}
                >
                  {busy ? "Initialisation…" : "Lancer le paiement"}
                </button>
                <p className="muted">
                  Validez ensuite sur votre téléphone. Ne partagez jamais votre
                  code secret avec l’atelier.
                </p>
              </form>
            )}
          {order?.paymentStatus === "confirmed" && (
            <DownloadReceipt orderId={id} />
          )}
          {order?.paymentStatus === "confirmed" && (
            <Link href="/paiements" className="button">
              Mon reçu et mes paiements <Icon name="download" size={18} />
            </Link>
          )}
          <Link href="/commandes" className="text-link payment-orders-link">
            Retrouver ma commande <Icon name="arrow-up-right" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
