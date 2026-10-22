"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
import { useStore } from "@/components/store";
import { Icon } from "@/components/icon";
import { DownloadReceipt } from "@/components/download-receipt";
type Payment = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  operator: string;
  reference?: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  receiptNumber: string;
  receiptAvailable: boolean;
};
const labels: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  initiating: "En cours",
  created: "Créé",
  unknown: "En vérification",
  failed: "Non abouti",
  exception: "À examiner",
};
export default function Payments() {
  const { user, authReady } = useStore();
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    if (!user) return;
    let active = true;
    setPayments([]);
    setLoading(true);
    setError("");
    api<Payment[]>("/payments/history")
      .then((p) => {
        if (active) setPayments(p);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) {
          setLoadedOwner(user.id);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user?.id]);
  const visiblePayments = loadedOwner === user?.id ? payments : [];
  const confirmed = visiblePayments.filter((p) => p.receiptAvailable);
  const list = visiblePayments.filter(
    (p) =>
      filter === "all" ||
      (filter === "confirmed" ? p.receiptAvailable : !p.receiptAvailable),
  );
  return (
    <section className="wrap page payments-history">
      <div className="section-title">
        <div>
          <span className="eyebrow">VOTRE ESPACE</span>
          <h1>Mes paiements.</h1>
          <p className="muted">
            Vos règlements, leurs statuts et vos reçus, au même endroit.
          </p>
        </div>
        <Link href="/commandes" className="button secondary">
          Mes commandes <Icon name="orders" size={18} />
        </Link>
      </div>
      {!authReady ? (
        <p>Chargement de votre espace…</p>
      ) : !user ? (
        <div className="empty">
          <h2>Retrouvez vos paiements.</h2>
          <Link href="/compte" className="button">
            Me connecter
          </Link>
        </div>
      ) : (
        <>
          <div className="payment-history-summary">
            <span className="payment-history-emblem">
              <Icon name="shield" size={32} />
            </span>
            <div>
              <span>Montant confirmé</span>
              <strong>
                {money(confirmed.reduce((sum, p) => sum + p.amount, 0))}
              </strong>
              <small>
                {confirmed.length} paiement{confirmed.length > 1 ? "s" : ""}{" "}
                confirmé{confirmed.length > 1 ? "s" : ""} parmi les 100
                dernières tentatives
              </small>
            </div>
          </div>
          <nav
            className="tabs payment-history-tabs"
            aria-label="Filtrer les paiements"
          >
            {[
              ["all", "Tout"],
              ["confirmed", "Confirmés"],
              ["other", "En attente ou à vérifier"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={filter === key ? "selected" : ""}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {loading || loadedOwner !== user.id ? (
            <p>Chargement des paiements…</p>
          ) : !list.length ? (
            <div className="empty">
              <Icon name="shield" size={42} />
              <h2>
                {payments.length
                  ? "Aucun paiement dans cette sélection."
                  : "Vos prochains coups de cœur commenceront ici."}
              </h2>
              <p>
                Un reçu devient disponible après confirmation effective du
                paiement.
              </p>
              <Link href="/catalogue" className="button">
                Explorer la collection
              </Link>
            </div>
          ) : (
            <div className="payment-history-list">
              {list.map((p) => (
                <article className="panel payment-history-card" key={p.id}>
                  <div className="section-title">
                    <div>
                      <span className="badge">
                        {labels[p.status] || p.status}
                      </span>
                      <h2>{money(p.amount)}</h2>
                      <small>
                        {new Date(p.createdAt).toLocaleString("fr-FR", {
                          timeZone: "Africa/Porto-Novo",
                        })}
                      </small>
                    </div>
                    <Icon
                      name={p.receiptAvailable ? "check" : "orders"}
                      size={26}
                    />
                  </div>
                  <dl>
                    <div>
                      <dt>Commande</dt>
                      <dd>{p.orderId.slice(0, 15).toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt>Opérateur</dt>
                      <dd>
                        {p.operator === "celtiis_bj"
                          ? "Celtiis"
                          : p.operator.toUpperCase()}
                      </dd>
                    </div>
                    {p.reference && (
                      <div>
                        <dt>Transaction</dt>
                        <dd>{p.reference}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="choices">
                    {p.receiptAvailable && <DownloadReceipt paymentId={p.id} />}
                    <Link href={"/paiement/" + p.orderId} className="text-link">
                      Voir le paiement <Icon name="arrow-up-right" size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
