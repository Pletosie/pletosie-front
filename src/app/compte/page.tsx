"use client";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountDetails } from "@/components/account-details";
import { api, API } from "@/lib/api";
import { useStore } from "@/components/store";
export default function Account() {
  const router = useRouter();
  const { user, refresh, ready } = useStore();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    const target = sessionStorage.getItem("pletosie-after-login");
    if (target) {
      sessionStorage.removeItem("pletosie-after-login");
      if (target.startsWith("/conversations?")) router.replace(target);
    }
  }, [user, router]);
  useEffect(() => {
    void api<{ google: boolean }>("/auth/providers")
      .then((p) => setEnabled(p.google))
      .catch(() =>
        setError(
          "Connexion momentanément indisponible. Réessayez dans un instant.",
        ),
      );
    const reason = new URLSearchParams(window.location.search).get("connexion");
    if (reason) {
      setError(
        reason === "annulee"
          ? "La connexion Google a été annulée."
          : reason === "configuration"
            ? "La connexion Google sera disponible prochainement."
            : "La connexion Google n’a pas abouti. Réessayez ou contactez l’atelier.",
      );
      window.history.replaceState(null, "", "/compte");
    }
  }, []);
  return (
    <section
      className={user ? "wrap page account-page" : "wrap page login-page"}
    >
      {user ? (
        <>
          <div className="account-hero">
            <div>
              <span className="eyebrow">VOTRE COMPTE PLETOSIE</span>
              <h1>
                Bonjour, {user.name.split(" ")[0]}
                <span>
                  <Icon name="asterisk" size={24} />
                </span>
              </h1>
              <p>Vos looks. Vos commandes. Votre espace.</p>
              <Link href="/catalogue" className="button">
                Trouver ma prochaine pièce <Icon name="arrow" size={18} />
              </Link>
            </div>
            <div className="account-avatar" aria-hidden="true">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          </div>
          <div className="account-grid">
            <Link href="/commandes" className="panel">
              <span className="account-icon order-emblem">
                <Icon name="orders" size={32} />
              </span>
              <h2>
                Mes commandes <Icon name="arrow-up-right" size={19} />
              </h2>
              <p>Suivez la préparation et la livraison de vos pièces.</p>
            </Link>
            <Link href="/conversations" className="panel">
              <span className="account-icon">
                <Icon name="chat" />
              </span>
              <h2>
                Mes conversations <Icon name="arrow-up-right" size={19} />
              </h2>
              <p>Un échange direct avec la créatrice.</p>
            </Link>
            {user.role === "admin" && (
              <Link className="panel" href="/admin">
                <span className="account-icon">
                  <Icon name="grid" />
                </span>
                <h2>
                  Administration <Icon name="arrow-up-right" size={19} />
                </h2>
                <p>Pilotez votre atelier et votre boutique.</p>
              </Link>
            )}
          </div>
          <div className="account-panels">
            <AccountDetails />
          </div>
          <button
            className="button secondary"
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                await refresh();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Me déconnecter
          </button>
        </>
      ) : (
        <div className="auth-layout">
          <div className="auth-visual">
            <img
              src="/editorial/hero-pletosie.png"
              alt="Look de présentation Pletosie"
            />
            <div>
              <span>PLETOSIE CLUB</span>
              <h2>
                Du style.
                <br />
                Du caractère.
                <br />
                <em>Et vous.</em>
              </h2>
              <span className="auth-sticker">
                VOTRE PROCHAIN
                <br />
                COUP DE CŒUR <Icon name="arrow-up-right" size={15} />
              </span>
            </div>
          </div>
          <div className="auth-card">
            <span className="eyebrow">VOTRE STYLE COMMENCE ICI</span>
            <h1>Prête à trouver votre prochain look ?</h1>
            <p className="muted">
              Un clic pour retrouver vos commandes, discuter avec l’atelier et
              passer à votre prochaine envie.
            </p>
            {enabled ? (
              <a href={`${API}/auth/google`} className="button google-button">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2.1 3.1v2.6h3.4c2-1.9 3-4.5 3-7.6ZM12 22c2.7 0 4.9-.9 6.6-2.4l-3.4-2.6c-.9.6-2 .9-3.2.9-2.6 0-4.9-1.8-5.7-4.2H2.8v2.7A10 10 0 0 0 12 22ZM6.3 13.7a6 6 0 0 1 0-3.4V7.6H2.8a10 10 0 0 0 0 8.8l3.5-2.7ZM12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.2 5.6l3.5 2.7A6 6 0 0 1 12 6.1Z"
                  />
                </svg>
                Continuer avec Google
              </a>
            ) : (
              <button className="button secondary" disabled>
                {enabled === null || !ready
                  ? "Chargement…"
                  : "Connexion Google bientôt disponible"}
              </button>
            )}
            <div className="auth-perks">
              <span>
                <Icon name="bag" size={19} /> Vos commandes au même endroit
              </span>
              <span>
                <Icon name="chat" size={19} /> Des échanges directs avec
                l’atelier
              </span>
              <span>
                <Icon name="bell" size={19} /> Vos messages et le suivi en temps
                réel
              </span>
            </div>
            <p className="auth-note">
              Première visite ? Votre compte se crée avec Google.
            </p>
            <small>
              Nous utilisons votre nom et votre adresse email pour créer votre
              espace.{" "}
              <Link className="text-link" href="/aide/confidentialite">
                Confidentialité
              </Link>
            </small>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
