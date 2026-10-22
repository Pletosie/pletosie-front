"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { Line, User } from "@/lib/types";
import { api } from "@/lib/api";
type Store = {
  lines: Line[];
  add: (line: Line) => void;
  change: (id: string, quantity: number) => void;
  clear: () => void;
  user: User | null;
  refresh: () => Promise<void>;
  notice: string;
  tell: (message: string) => void;
  ready: boolean;
  unread: number;
};
const Context = createContext<Store | null>(null);
export const useStore = () => useContext(Context)!;
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, tell] = useState("");
  const synced = useRef<string | null>(null);
  const [unread, setUnread] = useState(0);
  async function refresh() {
    try {
      setUser(await api<User>("/auth/me"));
    } catch {
      setUser(null);
    }
  }
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pletosie-cart") || "[]");
      if (Array.isArray(saved))
        setLines(
          saved
            .filter(
              (l) =>
                l &&
                typeof l.variantId === "string" &&
                Number.isInteger(l.quantity) &&
                l.quantity > 0,
            )
            .map((l: Line) => ({
              ...l,
              size:
                ({ P1: "S", P2: "M", P3: "L" } as Record<string, string>)[
                  l.size
                ] || l.size,
            })),
        );
    } catch {}
    setReady(true);
    void refresh();
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("pletosie-cart", JSON.stringify(lines));
  }, [lines, ready]);
  useEffect(() => {
    if (!user || !ready) {
      synced.current = null;
      setUnread(0);
      return;
    }
    let active = true;
    void api<Line[]>("/cart")
      .then((remote) => {
        if (!active) return;
        setLines((local) => {
          const merged = new Map(
            remote.map((l) => [
              l.variantId,
              {
                ...l,
                size:
                  ({ P1: "S", P2: "M", P3: "L" } as Record<string, string>)[
                    l.size
                  ] || l.size,
              },
            ]),
          );
          for (const line of local) {
            const existing = merged.get(line.variantId);
            merged.set(line.variantId, {
              ...line,
              quantity: Math.min(
                20,
                Math.max(line.quantity, existing?.quantity || 0),
              ),
            });
          }
          return [...merged.values()].slice(0, 30);
        });
        synced.current = user.id;
      })
      .catch(() => {
        if (active)
          tell(
            "Synchronisation du panier indisponible. Votre sélection locale est conservée.",
          );
      });
    async function notifications() {
      try {
        const n =
          await api<{ read: boolean; kind: string }[]>("/notifications");
        if (active)
          setUnread(n.filter((x) => !x.read && x.kind === "message").length);
      } catch {}
    }
    void notifications();
    const interval = setInterval(notifications, 15000);
    window.addEventListener("pletosie-notifications-changed", notifications);
    window.addEventListener("focus", notifications);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener(
        "pletosie-notifications-changed",
        notifications,
      );
      window.removeEventListener("focus", notifications);
    };
  }, [user?.id, ready]);
  useEffect(() => {
    if (!ready || !user || synced.current !== user.id) return;
    const timer = setTimeout(() => {
      void api("/cart", {
        method: "PUT",
        body: JSON.stringify({
          items: lines.map(({ productId, variantId, quantity }) => ({
            productId,
            variantId,
            quantity,
          })),
        }),
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [lines, user, ready]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => tell(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  function add(line: Line) {
    setLines((previous) => {
      const found = previous.find((l) => l.variantId === line.variantId);
      return found
        ? previous.map((l) =>
            l.variantId === line.variantId
              ? { ...l, quantity: Math.min(20, l.quantity + line.quantity) }
              : l,
          )
        : [...previous, line];
    });
    tell("Votre pièce a été ajoutée au panier.");
    void api("/analytics", {
      method: "POST",
      body: JSON.stringify({
        kind: "cart_add",
        productId: line.productId,
        quantity: line.quantity,
      }),
    }).catch(() => {});
  }
  return (
    <Context.Provider
      value={{
        lines,
        add,
        change: (id, quantity) =>
          setLines((prev) =>
            prev
              .map((l) =>
                l.variantId === id
                  ? { ...l, quantity: Math.min(20, quantity) }
                  : l,
              )
              .filter((l) => l.quantity > 0),
          ),
        clear: () => setLines([]),
        user,
        refresh,
        notice,
        tell,
        ready,
        unread,
      }}
    >
      {children}
      {notice && (
        <div role="status" className="toast">
          ✓ {notice}
        </div>
      )}
    </Context.Provider>
  );
}
