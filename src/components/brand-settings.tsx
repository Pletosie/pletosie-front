"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
type Zone = { id: string; name: string; fee: number };
type Measurement = { size: string; chest: number; waist: number; hips: number };
export function BrandSettings() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [version, setVersion] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rows, setRows] = useState<Measurement[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void Promise.all([
      api<{ zones: Zone[] }>("/settings"),
      api<{
        version: string;
        instructions: string;
        measurements: Measurement[];
      } | null>("/size-guide"),
    ])
      .then(([s, g]) => {
        setZones(s.zones);
        if (g) {
          setVersion(g.version);
          setInstructions(g.instructions);
          setRows(g.measurements);
        }
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await api("/admin/delivery-zones", {
              method: "PUT",
              body: JSON.stringify({ zones, reason: f.get("reason") }),
            });
            setNotice("Zones et frais de livraison enregistrés.");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <h2>Zones et frais de livraison</h2>
        <p>
          Les zones absentes de cette liste ne peuvent pas être choisies à la
          commande. Les montants sont en francs CFA entiers.
        </p>
        {zones.map((z, i) => (
          <div className="form-grid" key={i}>
            <label>
              Référence de zone
              <input
                required
                value={z.id}
                onChange={(e) =>
                  setZones(
                    zones.map((x, j) =>
                      i === j ? { ...x, id: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Nom de la zone
              <input
                required
                value={z.name}
                onChange={(e) =>
                  setZones(
                    zones.map((x, j) =>
                      i === j ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Frais (FCFA)
              <input
                type="number"
                min="0"
                step="1"
                required
                value={z.fee}
                onChange={(e) =>
                  setZones(
                    zones.map((x, j) =>
                      i === j ? { ...x, fee: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              onClick={() => setZones(zones.filter((_, j) => j !== i))}
            >
              Retirer cette zone
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button secondary"
          onClick={() => setZones([...zones, { id: "", name: "", fee: 0 }])}
        >
          Ajouter une zone
        </button>
        <label>
          Motif de modification
          <input name="reason" required minLength={3} />
        </label>
        <button className="button">Enregistrer la livraison</button>
      </form>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api("/admin/size-guide", {
              method: "PUT",
              body: JSON.stringify({
                version,
                instructions,
                measurements: rows,
              }),
            });
            setNotice("Guide de mesures publié.");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <h2>Le guide des tailles de la marque</h2>
        <p>
          Mesures du corps en centimètres. Les anciennes commandes conservent
          une copie du guide applicable lors de l’achat.
        </p>
        <label>
          Version du guide
          <input
            required
            minLength={2}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Ex. 2026-collection-1"
          />
        </label>
        <label>
          Instructions de prise de mesures
          <textarea
            required
            minLength={10}
            maxLength={1000}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>
        {rows.map((r, i) => (
          <div className="form-grid" key={i}>
            <label>
              Taille
              <input
                required
                value={r.size}
                onChange={(e) =>
                  setRows(
                    rows.map((x, j) =>
                      j === i ? { ...x, size: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            {[
              ["chest", "Poitrine (cm)"],
              ["waist", "Taille (cm)"],
              ["hips", "Hanches (cm)"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  required
                  min="1"
                  max="300"
                  value={r[key as keyof Measurement]}
                  onChange={(e) =>
                    setRows(
                      rows.map((x, j) =>
                        j === i ? { ...x, [key]: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
            >
              Retirer cette taille
            </button>
          </div>
        ))}
        <div className="choices">
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setRows([...rows, { size: "", chest: 1, waist: 1, hips: 1 }])
            }
          >
            Ajouter une taille
          </button>
          <button className="button">Publier le guide</button>
        </div>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="info">
          {notice}
        </p>
      )}
    </>
  );
}
