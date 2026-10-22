"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useStore } from "./store";
type PushState = {
  supported: boolean;
  enabled: boolean;
  configured: boolean;
  busy: boolean;
  error: string;
  notice: string;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  test: () => Promise<void>;
};
const Context = createContext<PushState | null>(null);
export function PushProvider({ children }: { children: React.ReactNode }) {
  const { user, tell } = useStore();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dismissed, setDismissed] = useState(true);
  const pathname = usePathname();
  const lastRoute = useRef("");
  const visits = useRef(0);
  const nextPrompt = useRef(0);
  function postpone() {
    nextPrompt.current = visits.current + 2;
    setDismissed(true);
  }
  useEffect(() => {
    if (lastRoute.current === pathname) return;
    lastRoute.current = pathname;
    visits.current += 1;
    if (visits.current >= nextPrompt.current) setDismissed(false);
  }, [pathname]);
  useEffect(() => {
    setSupported(
      window.isSecureContext &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
  }, []);
  useEffect(() => {
    setEnabled(false);
    if (!user || !supported) return;
    let active = true;

    void (async () => {
      try {
        const config = await api<{
          enabled: boolean;
          publicKey: string | null;
        }>("/push/config");
        if (!active) return;
        setConfigured(config.enabled);
        setKey(config.publicKey || "");
        if (!config.enabled) return;
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        const subscription = await registration.pushManager.getSubscription();
        if (
          subscription &&
          Notification.permission === "granted" &&
          localStorage.getItem("pletosie-push-owner") === user.id
        ) {
          await api("/push/subscribe", {
            method: "POST",
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              keys: subscription.toJSON().keys,
            }),
          });
          if (active) setEnabled(true);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();
    const onPush = (event: MessageEvent) => {
      if (event.data?.type === "PLETOSIE_PUSH") {
        window.dispatchEvent(new Event("pletosie-notifications-changed"));
        tell("Une nouvelle notification vous attend dans votre espace.");
      }
    };
    navigator.serviceWorker.addEventListener("message", onPush);
    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener("message", onPush);
    };
  }, [user?.id, supported]);
  async function enable() {
    if (!user || !supported || !key) return;
    setBusy(true);
    setError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          "Autorisez les notifications dans les paramètres de ce site pour recevoir les alertes.",
        );
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const registration = await navigator.serviceWorker.ready;
      const bytes = Uint8Array.from(
        atob(
          key.replace(/-/g, "+").replace(/_/g, "/") +
            "=".repeat((4 - (key.length % 4)) % 4),
        ),
        (c) => c.charCodeAt(0),
      );
      let subscription = await registration.pushManager.getSubscription();
      if (subscription?.options.applicationServerKey) {
        const current = Array.from(
          new Uint8Array(subscription.options.applicationServerKey),
        );
        if (current.join(",") !== Array.from(bytes).join(",")) {
          await api("/push/unsubscribe", {
            method: "POST",
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
          subscription = null;
        }
      }
      subscription =
        subscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: bytes,
        }));
      await api("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
        }),
      });
      localStorage.setItem("pletosie-push-owner", user.id);
      setEnabled(true);
      setNotice("Les notifications sont activées sur cet appareil.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    setBusy(true);
    setError("");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await api("/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      localStorage.removeItem("pletosie-push-owner");
      postpone();
      setEnabled(false);
      setNotice("Les notifications sont désactivées sur cet appareil.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    setError("");
    try {
      await api("/push/test", { method: "POST" });
      setNotice(
        "Notification de test en cours d’envoi. Elle peut mettre quelques secondes à apparaître.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Context.Provider
      value={{
        supported,
        enabled,
        configured,
        busy,
        error,
        notice,
        enable,
        disable,
        test,
      }}
    >
      {children}
      {supported && (!user || configured) && !enabled && !dismissed && (
        <aside
          className="push-invitation"
          aria-label="Recevoir les notifications"
        >
          <div>
            <strong>Ne manquez aucun message de l’atelier.</strong>
            <p>
              Recevez une alerte sur votre écran, même lorsque la page est
              fermée.
            </p>
            {error && <p role="alert">{error}</p>}
          </div>
          {!user ? (
            <Link className="button" href="/compte" onClick={postpone}>
              Me connecter pour activer
            </Link>
          ) : (
            <button
              className="button"
              disabled={busy}
              onClick={() => void enable()}
            >
              {busy ? "Activation…" : "Activer les notifications"}
            </button>
          )}
          <button
            className="text-link"
            onClick={() => {
              postpone();
            }}
          >
            Plus tard
          </button>
        </aside>
      )}
    </Context.Provider>
  );
}
export function NotificationSettings() {
  const push = useContext(Context);
  if (!push) return null;
  return (
    <section className="panel">
      <h2>Notifications sur cet appareil</h2>
      <p>
        Messages, propositions et suivi de commande : recevez une alerte même
        lorsque la page Pletosie est fermée.
      </p>
      {!push.supported ? (
        <p>
          Ce navigateur ne prend pas en charge les notifications push dans ce
          mode. Sur iPhone ou iPad, ajoutez Pletosie à l’écran d’accueil puis
          ouvrez l’application depuis son icône.
        </p>
      ) : !push.configured ? (
        <p>Les notifications attendent leur activation par l’atelier.</p>
      ) : (
        <div className="choices">
          <button
            className="button"
            disabled={push.busy}
            onClick={() => void (push.enabled ? push.disable() : push.enable())}
          >
            {push.busy
              ? "Un instant…"
              : push.enabled
                ? "Désactiver les notifications"
                : "Activer les notifications"}
          </button>
          {push.enabled && (
            <button
              className="button secondary"
              onClick={() => void push.test()}
            >
              Envoyer une notification de test
            </button>
          )}
        </div>
      )}
      {push.error && (
        <p role="alert" className="error">
          {push.error}
        </p>
      )}
      {push.notice && (
        <p role="status" className="info">
          {push.notice}
        </p>
      )}
    </section>
  );
}
