"use client";
import { Icon } from "@/components/icon";
import Link from "next/link";
import { Operations } from "@/components/operations";
import { BrandSettings } from "@/components/brand-settings";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { type Product, money } from "@/lib/types";
import { useStore } from "@/components/store";
type Metrics = {
  orders: number;
  paidOrders: number;
  revenue: number;
  deliveryRevenue: number;
  late: number;
  lowStock: {
    id: string;
    name: string;
    color: string;
    size: string;
    stock: number;
  }[];
  ranking: {
    id: string;
    name: string;
    views: number;
    adds: number;
    addedUnits: number;
    soldUnits: number;
  }[];
};
type AdminOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  address: { name: string; phone: string; details: string; zone: string };
  items: { name: string; quantity: number; color: string; size: string }[];
};
type Audit = {
  id: string;
  action: string;
  reason: string;
  createdAt: string;
  reference: string;
};
const statusNames: Record<string, string> = {
  awaiting_payment: "En attente de paiement",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  in_delivery: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};
const initial = {
  name: "",
  slug: "",
  category: "Robes",
  description: "",
  material: "",
  care: "",
  price: 15000,
  image: "/pieces/robe-terracotta.svg",
  published: false,
  madeToOrder: false,
  variants: [
    {
      id: "",
      color: "Terracotta",
      hex: "#b57552",
      size: "S",
      stock: 0,
      price: 15000,
      image: "/pieces/robe-terracotta.svg",
    },
  ],
  reason: "",
};
export default function Admin() {
  const { user, tell } = useStore();
  const [tab, setTab] = useState("Vue d’ensemble");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<typeof initial | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const [m, p, o, a] = await Promise.all([
        api<Metrics>("/admin/metrics"),
        api<Product[]>("/admin/products"),
        api<AdminOrder[]>("/admin/orders"),
        api<Audit[]>("/admin/audit"),
      ]);
      setMetrics(m);
      setProducts(p);
      setOrders(o);
      setAudit(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      await api(`/admin/products${editing ? `/${editing}` : ""}`, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      setForm(null);
      await load();
      tell("Produit enregistré.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportOrders() {
    const cell = (s: unknown) =>
      `"${String(s ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const rows = [
      ["Référence", "Client", "Statut", "Paiement", "Total XOF"],
      ...orders.map((o) => [
        o.id,
        o.address.name,
        o.status,
        o.paymentStatus,
        o.total,
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pletosie-commandes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!user)
    return (
      <section className="wrap page">
        <h1>L’espace de l’atelier</h1>
        <Link className="button" href="/compte">
          Se connecter
        </Link>
      </section>
    );
  if (user.role !== "admin")
    return (
      <section className="wrap page">
        <h1>Accès réservé à l’administration.</h1>
        <Link href="/compte">Mon compte</Link>
      </section>
    );
  return (
    <section className="wrap page admin">
      <div className="section-title">
        <div>
          <span className="eyebrow">L’ESPACE CRÉATRICE</span>
          <h1>Bonjour, l’atelier.</h1>
        </div>
        <Link href="/conversations" className="button secondary">
          Les conversations <Icon name="arrow-up-right" size={15} />
        </Link>
      </div>
      <nav className="admin-tabs">
        {[
          "Vue d’ensemble",
          "Produits",
          "Stocks",
          "Commandes",
          "Analyses",
          "Journal",
          "Paramètres",
        ].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => {
              setTab(t);
              setError("");
            }}
          >
            {t}
          </button>
        ))}
      </nav>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {tab === "Vue d’ensemble" && (
        <>
          <div className="stats-grid">
            {[
              ["Ventes produits encaissées", money(metrics?.revenue || 0)],
              ["Commandes payées", metrics?.paidOrders || 0],
              ["Commandes en retard", metrics?.late || 0],
              ["Variantes à surveiller", metrics?.lowStock.length || 0],
            ].map(([label, value]) => (
              <div className="stat" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="account-grid">
            <div className="panel">
              <h2>L’atelier en un regard</h2>
              <p>
                {products.length} produits · {orders.length} commandes
              </p>
              <p>
                Les frais de livraison sont isolés des ventes produits. Le
                chiffre d’affaires n’est pas un bénéfice.
              </p>
              <button className="text-link" onClick={() => setTab("Produits")}>
                Gérer la collection <Icon name="arrow-up-right" size={15} />
              </button>
            </div>
            <div className="panel">
              <h2>Avant l’ouverture des ventes</h2>
              <p>
                FeexPay, zones et frais, mesures de la marque, conditions
                commerciales et coordonnées restent à valider.
              </p>
              <button
                className="text-link"
                onClick={() => setTab("Paramètres")}
              >
                Voir les paramètres <Icon name="arrow-up-right" size={15} />
              </button>
            </div>
          </div>
        </>
      )}
      {tab === "Produits" && (
        <>
          <div className="message-top">
            <input
              aria-label="Rechercher un produit"
              placeholder="Rechercher une pièce…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  ...initial,
                  variants: initial.variants.map((v) => ({
                    ...v,
                    id: crypto.randomUUID(),
                  })),
                });
              }}
            >
              Ajouter une pièce <Icon name="plus" size={17} />
            </button>
          </div>
          {form && (
            <form className="panel product-editor" onSubmit={save}>
              <div className="section-title">
                <h2>{editing ? "Modifier la pièce" : "Nouvelle pièce"}</h2>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  aria-label="Fermer"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <div className="form-grid">
                {[
                  ["name", "Nom"],
                  ["slug", "Référence URL"],
                  ["material", "Matière"],
                  ["care", "Entretien"],
                  ["image", "Chemin image ou URL Cloudinary"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      required
                      value={String(form[key as keyof typeof form])}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <label>
                  Catégorie
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {["Robes", "Ensembles", "Hauts", "Jupes"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Prix de référence (FCFA)
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <label>
                Description
                <textarea
                  required
                  minLength={10}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />
                Publié dans la boutique
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.madeToOrder}
                  onChange={(e) =>
                    setForm({ ...form, madeToOrder: e.target.checked })
                  }
                />
                À confectionner (quota de l’atelier requis)
              </label>
              <h3>Variantes · stock ou quota disponible</h3>
              {form.variants.map((v, i) => (
                <div className="variant-editor" key={i}>
                  {[
                    ["color", "Coloris"],
                    ["hex", "Couleur hex"],
                    ["size", "Taille"],
                    ["price", "Prix"],
                    ["stock", "Stock"],
                    ["image", "Image"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      {key === "size" ? (
                        <select
                          value={v.size}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              variants: form.variants.map((x, j) =>
                                j === i ? { ...x, size: e.target.value } : x,
                              ),
                            })
                          }
                        >
                          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                            <option key={size}>{size}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          required
                          type={
                            ["price", "stock"].includes(key) ? "number" : "text"
                          }
                          min={key === "price" ? 1 : 0}
                          step={1}
                          value={v[key as keyof typeof v]}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              variants: form.variants.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      [key]: ["price", "stock"].includes(key)
                                        ? Number(e.target.value)
                                        : e.target.value,
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                      )}
                    </label>
                  ))}
                  <button
                    type="button"
                    disabled={form.variants.length === 1}
                    onClick={() =>
                      setForm({
                        ...form,
                        variants: form.variants.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                className="button secondary"
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    variants: [
                      ...form.variants,
                      {
                        ...form.variants[0],
                        id: crypto.randomUUID(),
                        stock: 0,
                      },
                    ],
                  })
                }
              >
                Ajouter une variante
              </button>
              <label>
                Motif de modification
                <input
                  required
                  minLength={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>
              <button className="button" disabled={busy}>
                {busy ? "Enregistrement…" : "Enregistrer la pièce"}
              </button>
            </form>
          )}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Pièce</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Publication</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) =>
                    `${p.name} ${p.slug}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product">
                          <img src={p.image} alt="" />
                          {p.name}
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>{money(p.price)}</td>
                      <td>
                        <span className="badge">
                          {p.published ? "Publiée" : "Masquée"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => {
                            setEditing(p.id);
                            setForm({
                              name: p.name,
                              slug: p.slug,
                              category: p.category,
                              description: p.description,
                              material: p.material,
                              care: p.care,
                              price: p.price,
                              image: p.image,
                              published: p.published,
                              madeToOrder: p.madeToOrder,
                              variants: p.variants.map((v) => ({ ...v })),
                              reason: "",
                            });
                            window.scrollTo({ top: 200, behavior: "smooth" });
                          }}
                        >
                          Modifier <Icon name="arrow-up-right" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === "Stocks" && (
        <>
          <Operations />
          <h2>Le stock, variante par variante</h2>
          <p className="muted">
            Chaque ajustement est effectué dans l’édition du produit avec un
            motif obligatoire et un journal d’audit. Les commandes actives
            protègent le stock contre un écrasement manuel.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Pièce</th>
                  <th>Coloris</th>
                  <th>Taille</th>
                  <th>Disponible</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap((p) =>
                  p.variants.map((v) => (
                    <tr key={`${p.id}-${v.id}`}>
                      <td>{p.name}</td>
                      <td>{v.color}</td>
                      <td>{v.size}</td>
                      <td>{v.stock}</td>
                      <td>
                        <span className={`badge ${v.stock <= 2 ? "warn" : ""}`}>
                          {v.stock === 0
                            ? "Épuisé"
                            : v.stock <= 2
                              ? "Stock faible"
                              : "Disponible"}
                        </span>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === "Commandes" && (
        <>
          <div className="message-top">
            <h2>{orders.length} commandes</h2>
            <button className="button secondary" onClick={exportOrders}>
              Exporter CSV <Icon name="download" size={17} />
            </button>
          </div>
          {!orders.length ? (
            <div className="empty">
              <h2>Les premières histoires restent à écrire.</h2>
              <p>Les commandes clients apparaîtront ici.</p>
            </div>
          ) : (
            orders.map((o) => (
              <article className="panel" key={o.id}>
                <div className="section-title">
                  <h2>{o.id.slice(0, 15)}</h2>
                  <strong>{money(o.total)}</strong>
                </div>
                <p>
                  <span className="badge">
                    {statusNames[o.status] || o.status}
                  </span>{" "}
                  · Paiement {o.paymentStatus}
                </p>
                <p>
                  {o.address.name} · {o.address.phone}
                  <br />
                  {o.address.details} · {o.address.zone}
                </p>
                {o.items.map((i, n) => (
                  <p key={n}>
                    {i.quantity} × {i.name} · {i.color} · {i.size}
                  </p>
                ))}
                {o.paymentStatus === "confirmed" && (
                  <select
                    aria-label="Faire avancer la commande"
                    value=""
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      try {
                        await api(`/admin/orders/${o.id}/status`, {
                          method: "PUT",
                          body: JSON.stringify({
                            status: e.target.value,
                            reason: "Mise à jour depuis l’administration",
                          }),
                        });
                        await load();
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    <option value="">Faire avancer la commande</option>
                    {["preparing", "ready", "in_delivery", "delivered"].map(
                      (s) => (
                        <option value={s} key={s}>
                          {statusNames[s]}
                        </option>
                      ),
                    )}
                  </select>
                )}
                <button className="text-link" onClick={() => window.print()}>
                  Imprimer le récapitulatif
                </button>
              </article>
            ))
          )}
        </>
      )}
      {tab === "Analyses" && (
        <>
          <h2>Des indicateurs distincts, des décisions claires.</h2>
          <p className="muted">
            Événements bruts, sans déduplication des vues. Les comptes
            administrateurs sont exclus. Le trafic de développement doit être
            purgé avant lancement. Périmètre : 20 000 derniers événements et 5
            000 dernières commandes.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Consultations</th>
                  <th>Ajouts</th>
                  <th>Unités ajoutées</th>
                  <th>Unités payées</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.ranking.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.views}</td>
                    <td>{p.adds}</td>
                    <td>{p.addedUnits}</td>
                    <td>{p.soldUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Encaissements produits : {money(metrics?.revenue || 0)} · Livraison
            : {money(metrics?.deliveryRevenue || 0)}
          </p>
        </>
      )}
      {tab === "Journal" && (
        <>
          <h2>Les opérations sensibles</h2>
          {audit.length ? (
            audit.map((a) => (
              <div className="audit-row" key={a.id}>
                <strong>{a.action}</strong>
                <span>{a.reason}</span>
                <small>
                  {new Date(a.createdAt).toLocaleString("fr-FR", {
                    timeZone: "Africa/Porto-Novo",
                  })}
                </small>
              </div>
            ))
          ) : (
            <p>Aucune opération enregistrée.</p>
          )}
        </>
      )}
      {tab === "Paramètres" && (
        <>
          <BrandSettings />
          <div className="panel prose">
            <h2>La préparation de l’ouverture</h2>
            <p>
              Les secrets sont configurés uniquement côté serveur, dans le
              fichier d’environnement. Ils ne sont jamais renvoyés au
              navigateur.
            </p>
            <ul>
              <li>Définir les zones et frais de livraison.</li>
              <li>Vérifier FeexPay et les opérateurs effectivement activés.</li>
              <li>
                Renseigner le guide des tailles et les visuels définitifs.
              </li>
              <li>
                Valider les conditions, les remboursements et la
                confidentialité.
              </li>
              <li>
                Configurer Cloudinary privé, l’envoi vocal et la récupération
                d’accès.
              </li>
              <li>
                Choisir l’hébergement et vérifier une restauration PostgreSQL.
              </li>
            </ul>
            <p>
              La confection et les propositions utilisent le quota par jour
              configuré dans l’onglet Stocks. Sans quota disponible, la commande
              est bloquée.
            </p>
            <Link href="/aide/conditions" className="text-link">
              Voir le projet de conditions{" "}
              <Icon name="arrow-up-right" size={15} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
