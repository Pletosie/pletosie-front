"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useStore } from "./store";
import { NotificationSettings } from "./push-notifications";
type Address = {
  id: string;
  name: string;
  phone: string;
  zone: string;
  details: string;
};
type Notification = {
  id: string;
  title: string;
  href: string;
  read: boolean;
  createdAt: string;
};
export function AccountDetails() {
  const { user, refresh, tell } = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void Promise.all([
      api<Address[]>("/addresses"),
      api<Notification[]>("/notifications"),
    ])
      .then(([a, n]) => {
        setAddresses(a);
        setNotifications(n);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <NotificationSettings />
      <div className="panel">
        <h2>Mes coordonnées</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await api("/profile", {
                method: "PUT",
                body: JSON.stringify({ name: f.get("name") }),
              });
              await refresh();
              tell("Profil mis à jour.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <label>
            Mon nom
            <input
              name="name"
              required
              minLength={2}
              defaultValue={user?.name}
            />
          </label>
          <p>{user?.email}</p>
          <button className="button secondary">Enregistrer</button>
        </form>
      </div>
      <div className="panel">
        <h2>Mes adresses</h2>
        {addresses.map((a) => (
          <p key={a.id}>
            <strong>
              {a.name} · {a.phone}
            </strong>
            <br />
            {a.details} · {a.zone}
          </p>
        ))}
        <details>
          <summary>Ajouter une adresse</summary>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              try {
                const a = await api<Address>("/addresses", {
                  method: "POST",
                  body: JSON.stringify(Object.fromEntries(f)),
                });
                setAddresses((p) => [...p, a]);
                form.reset();
                tell("Adresse enregistrée.");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            {[
              ["name", "Destinataire"],
              ["phone", "Téléphone"],
              ["zone", "Zone"],
              ["details", "Adresse et repère"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  required
                  minLength={key === "details" ? 10 : key === "phone" ? 8 : 2}
                />
              </label>
            ))}
            <button className="button">Enregistrer l’adresse</button>
          </form>
        </details>
      </div>
      <div className="panel">
        <h2>Mes notifications</h2>
        {!notifications.length ? (
          <p>Aucune notification pour le moment.</p>
        ) : (
          notifications.map((n) => (
            <div className="audit-row" key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  void api(`/notifications/${n.id}/read`, { method: "POST" });
                }}
              >
                {!n.read ? "● " : ""}
                {n.title} ↗
              </Link>
              <small>
                {new Date(n.createdAt).toLocaleString("fr-FR", {
                  timeZone: "Africa/Porto-Novo",
                })}
              </small>
            </div>
          ))
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </>
  );
}
