"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
import { useStore } from "@/components/store";
type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  deadline?: string;
  items: { name: string; quantity: number; color: string; size: string }[];
  history: { status: string; date: string; note: string }[];
};
const statuses: Record<string, string> = {
  awaiting_payment: "En attente de paiement",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  in_delivery: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};
export default function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      setOrders(await api<Order[]>("/orders"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (user) void load();
  }, [user]);
  return (
    <section className="wrap page">
      <span className="eyebrow">VOTRE ESPACE</span>
      <h1>Mes commandes</h1>
      {!user ? (
        <Link className="button" href="/compte">
          Me connecter
        </Link>
      ) : (
        <>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p>Chargement…</p>
          ) : !orders.length ? (
            <div className="empty">
              <h2>Votre histoire avec l’atelier commence ici.</h2>
              <p>Vos commandes apparaîtront dans cet espace.</p>
              <Link href="/catalogue" className="button">
                Découvrir les pièces
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <article className="panel order" key={o.id}>
                <div className="section-title">
                  <div>
                    <span className="badge">
                      {statuses[o.status] || o.status}
                    </span>
                    <h2>{o.id.slice(0, 15).toUpperCase()}</h2>
                    <small>
                      {new Date(o.createdAt).toLocaleString("fr-FR", {
                        timeZone: "Africa/Porto-Novo",
                      })}
                    </small>
                  </div>
                  <strong>{money(o.total)}</strong>
                </div>
                {o.items.map((l, i) => (
                  <p key={i}>
                    {l.quantity} × {l.name} · {l.color} / {l.size}
                  </p>
                ))}
                {o.deadline && (
                  <p>
                    Livraison au plus tard le{" "}
                    {new Date(o.deadline).toLocaleDateString("fr-FR", {
                      timeZone: "Africa/Porto-Novo",
                    })}
                  </p>
                )}
                <p>
                  Paiement :{" "}
                  {o.paymentStatus === "confirmed"
                    ? "confirmé"
                    : o.paymentStatus === "pending"
                      ? "en attente"
                      : o.paymentStatus}
                </p>
                <div className="choices">
                  {o.status === "awaiting_payment" && (
                    <Link className="button" href={`/paiement/${o.id}`}>
                      Continuer vers le paiement
                    </Link>
                  )}
                  {!["cancelled", "delivered"].includes(o.status) && (
                    <button
                      className="button secondary"
                      onClick={async () => {
                        try {
                          await api(`/orders/${o.id}/cancel`, {
                            method: "POST",
                          });
                          await load();
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    >
                      Demander l’annulation
                    </button>
                  )}
                </div>
                <details>
                  <summary>Historique de la commande</summary>
                  {o.history.map((h, i) => (
                    <p key={i}>
                      {new Date(h.date).toLocaleString("fr-FR", {
                        timeZone: "Africa/Porto-Novo",
                      })}{" "}
                      · {h.note}
                    </p>
                  ))}
                </details>
              </article>
            ))
          )}
        </>
      )}
    </section>
  );
}
