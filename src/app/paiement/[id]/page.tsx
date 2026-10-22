"use client";
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
          phone: String(f.get("phone")).replace(/\D/g, ""),
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
    <section className="wrap page auth-card">
      <span className="eyebrow">PAIEMENT MOBILE MONEY</span>
      <h1>
        {order?.paymentStatus === "confirmed"
          ? "Merci, votre paiement est confirmé."
          : "Votre pièce, une étape plus près."}
      </h1>
      {order && <p className="detail-price">{money(order.total)}</p>}
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
        <div key={a.id} className="panel">
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
              <input
                type="tel"
                name="phone"
                required
                placeholder="22901XXXXXXXX"
                pattern="22901[0-9]{8}"
              />
            </label>
            <button
              className="button"
              disabled={!settings?.paymentEnabled || busy}
            >
              {busy ? "Initialisation…" : "Lancer le paiement"}
            </button>
            <p className="muted">
              Validez ensuite sur votre téléphone. Ne partagez jamais votre code
              secret avec l’atelier.
            </p>
          </form>
        )}
      <Link href="/commandes" className="text-link">
        Retrouver ma commande <Icon name="arrow-up-right" size={15} />
      </Link>
    </section>
  );
}
