"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/types";
type Capacity = { id: string; quota: number; reserved: number };
type Refund = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  reason: string;
};
export function Operations() {
  const [capacity, setCapacity] = useState<Capacity[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function load() {
    try {
      const [c, r] = await Promise.all([
        api<Capacity[]>("/admin/capacity"),
        api<Refund[]>("/admin/refunds"),
      ]);
      setCapacity(c);
      setRefunds(r);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <div className="panel">
        <h2>La capacité de confection</h2>
        <p>
          Quota simple par jour d’acceptation de commande (fuseau de
          Porto-Novo). Les réservations payées consomment le quota du jour.
          Choisissez des quotas permettant de respecter trois jours maximum, y
          compris pour les personnalisations.
        </p>
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await api("/admin/capacity", {
                method: "PUT",
                body: JSON.stringify({
                  date: f.get("date"),
                  quota: Number(f.get("quota")),
                  reason: f.get("reason"),
                }),
              });
              await load();
              setNotice("Capacité enregistrée.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <label>
            Jour d’acceptation
            <input type="date" name="date" required />
          </label>
          <label>
            Nombre de pièces maximum
            <input
              type="number"
              name="quota"
              min="0"
              max="500"
              required
              step="1"
            />
          </label>
          <label>
            Motif
            <input name="reason" required minLength={3} />
          </label>
          <button className="button">Enregistrer le quota</button>
        </form>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Jour</th>
                <th>Quota</th>
                <th>Réservé / consommé</th>
                <th>Disponible</th>
              </tr>
            </thead>
            <tbody>
              {capacity.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.quota}</td>
                  <td>{c.reserved}</td>
                  <td>{c.quota - c.reserved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel">
        <h2>Les remboursements</h2>
        <p>
          Une demande n’est marquée remboursée qu’après un transfert effectif.
          La référence du transfert est obligatoire. Aucun virement n’est
          exécuté par ce formulaire.
        </p>
        {!refunds.length ? (
          <p>Aucune demande.</p>
        ) : (
          refunds.map((r) => (
            <div className="panel" key={r.id}>
              <h3>
                {r.orderId.slice(0, 15)} · {money(r.amount)}
              </h3>
              <p>
                {r.reason} · {r.status}
              </p>
              {r.status === "pending" && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    try {
                      await api(`/admin/refunds/${r.id}`, {
                        method: "PUT",
                        body: JSON.stringify({
                          status: "confirmed",
                          reason: f.get("reason"),
                          transferReference: f.get("transferReference"),
                        }),
                      });
                      await load();
                      setNotice("Remboursement enregistré et tracé.");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <label>
                    Référence du transfert effectif
                    <input name="transferReference" required minLength={3} />
                  </label>
                  <label>
                    Motif et constat
                    <input name="reason" required minLength={3} />
                  </label>
                  <button className="button">
                    Confirmer le remboursement effectué
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="info" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
