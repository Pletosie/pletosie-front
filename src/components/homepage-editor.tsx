"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { defaultHomepage, type Homepage } from "@/lib/homepage";
import { FashionImage } from "./retail";
import { Icon } from "./icon";
const sections = [
  { key: "hero", title: "Les cartes du grand visuel", max: 2 },
  { key: "looks", title: "Les cartes de catégories", max: 4 },
  { key: "selection", title: "La sélection de produits", max: 24 },
  { key: "campaigns", title: "Les bannières de fin de page", max: 2 },
] as const;
export function HomepageEditor({ products }: { products: Product[] }) {
  const published = products.filter((p) => p.published);
  const [form, setForm] = useState<Homepage | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    api<Homepage | null>("/homepage")
      .then((value) =>
        setForm(
          value && Array.isArray(value.hero)
            ? value
            : defaultHomepage(products),
        ),
      )
      .catch((e) => {
        setFailed(true);
        setMessage(e.message);
      });
  }, [products]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  if (!form)
    return <p role="status">{message || "Chargement de la composition…"}</p>;
  function change(next: Homepage) {
    setForm(next);
    setDirty(true);
    setMessage("");
  }
  const unavailable = [
    ...new Set(
      [
        form.heroProductId,
        ...form.hero,
        ...form.looks,
        ...form.selection,
        ...form.campaigns,
      ].filter(Boolean),
    ),
  ].some((id) => !published.some((p) => p.id === id));
  return (
    <form
      className="homepage-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          setForm(
            await api<Homepage>("/admin/homepage", {
              method: "PUT",
              body: JSON.stringify(form),
            }),
          );
          setDirty(false);
          setFailed(false);
          setMessage(
            "Votre accueil est publié. Les changements apparaissent dès la prochaine visite.",
          );
        } catch (e) {
          setFailed(true);
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="home-editor-heading">
        <div>
          <span className="eyebrow">VOTRE VITRINE</span>
          <h2>Composez votre accueil.</h2>
          <p>
            Choisissez les pièces, leur emplacement et leur ordre. Une section
            vide ne présente aucun article.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="button secondary"
        >
          Voir le site <Icon name="arrow-up-right" size={18} />
        </a>
      </div>
      <section className="panel">
        <h3>Le grand visuel</h3>
        <div className="home-editor-fields">
          <label>
            Accroche
            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => change({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Sous-titre
            <input
              required
              maxLength={200}
              value={form.subtitle}
              onChange={(e) => change({ ...form, subtitle: e.target.value })}
            />
          </label>
          <label>
            Photo principale
            <select
              value={form.heroProductId}
              onChange={(e) =>
                change({ ...form, heroProductId: e.target.value })
              }
            >
              <option value="">Visuel éditorial actuel</option>
              {published.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Titre de la sélection
            <input
              required
              maxLength={100}
              value={form.selectionTitle}
              onChange={(e) =>
                change({ ...form, selectionTitle: e.target.value })
              }
            />
          </label>
        </div>
      </section>
      {sections.map((section) => (
        <section className="panel" key={section.key}>
          <div className="home-editor-heading">
            <h3>{section.title}</h3>
            <span className="badge">
              {form[section.key].length} / {section.max}
            </span>
          </div>
          <div className="home-slot-list">
            {form[section.key].map((id, index) => {
              const product = published.find((p) => p.id === id);
              const update = (ids: string[]) =>
                change({ ...form, [section.key]: ids });
              return (
                <div className="home-slot" key={index}>
                  <span className="home-position">{index + 1}</span>
                  {product ? (
                    <FashionImage
                      src={product.image}
                      alt={product.name}
                      className="home-slot-image"
                    />
                  ) : (
                    <span className="home-slot-missing">Retiré</span>
                  )}
                  <label>
                    Article à cet emplacement
                    <select
                      aria-label={
                        section.title + ", emplacement " + (index + 1)
                      }
                      value={id}
                      onChange={(e) =>
                        update(
                          form[section.key].map((value, i) =>
                            i === index ? e.target.value : value,
                          ),
                        )
                      }
                    >
                      {!product && (
                        <option value={id}>
                          Article indisponible : à remplacer
                        </option>
                      )}
                      {published
                        .filter(
                          (p) =>
                            p.id === id || !form[section.key].includes(p.id),
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {p.category}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="home-slot-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      aria-label="Monter l’article"
                      onClick={() => {
                        const ids = [...form[section.key]];
                        [ids[index - 1], ids[index]] = [
                          ids[index],
                          ids[index - 1],
                        ];
                        update(ids);
                      }}
                    >
                      <Icon name="arrow-up" size={17} />
                    </button>
                    <button
                      type="button"
                      disabled={index === form[section.key].length - 1}
                      aria-label="Descendre l’article"
                      onClick={() => {
                        const ids = [...form[section.key]];
                        [ids[index + 1], ids[index]] = [
                          ids[index],
                          ids[index + 1],
                        ];
                        update(ids);
                      }}
                    >
                      <Icon name="arrow-down" size={17} />
                    </button>
                    <button
                      type="button"
                      aria-label="Retirer cet emplacement"
                      onClick={() =>
                        update(form[section.key].filter((_, i) => i !== index))
                      }
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="button secondary"
            type="button"
            disabled={
              form[section.key].length >= section.max ||
              !published.some((p) => !form[section.key].includes(p.id))
            }
            onClick={() => {
              const product = published.find(
                (p) => !form[section.key].includes(p.id),
              );
              if (product)
                change({
                  ...form,
                  [section.key]: [...form[section.key], product.id],
                });
            }}
          >
            <Icon name="plus" size={17} /> Ajouter un emplacement
          </button>
        </section>
      ))}
      {unavailable && (
        <p className="info">
          Une pièce a été retirée de la vente. Remplacez-la ou retirez son
          emplacement avant de publier.
        </p>
      )}
      <div className="home-publish">
        <p role={failed ? "alert" : "status"}>
          {message || (dirty ? "Modifications non publiées" : "Prêt à publier")}
        </p>
        <button className="button" disabled={busy || unavailable}>
          {busy ? "Publication…" : "Publier l’accueil"}{" "}
          <Icon name="check" size={18} />
        </button>
      </div>
    </form>
  );
}
