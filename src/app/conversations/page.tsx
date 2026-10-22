"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, API } from "@/lib/api";
import { money } from "@/lib/types";
import { useStore } from "@/components/store";
import { AudioPlayer, VoiceRecorder } from "@/components/voice";
import { FashionImage } from "@/components/retail";
import { Icon } from "@/components/shell";
type Conversation = {
  id: string;
  subject: string;
  displayName: string;
  person: {id:string;name:string}|null;
  updatedAt: string;
  context: { name: string; slug: string; variant: string; image?:string; price?:number; category?:string } | null;
};
type Message = {
  id: string;
  userId: string;
  text: string;
  kind: string;
  createdAt: string;
};
type Offer = {
  id: string;
  description: string;
  price: number;
  version: number;
  expiresAt: string;
  status: string;
};
function Conversations() {
  const { user, tell } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const productId = params.get("produit");
  const variantId = params.get("variante");
  const threadId = params.get("fil");
  const opening = useRef<{
    key: string;
    promise: Promise<Conversation>;
  } | null>(null);
  const [list, setList] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [audioDuration,setAudioDuration] = useState(0);
  const [audio, setAudio] = useState<string | null>(null);
  const [mime, setMime] = useState("");
  const clientId = useRef<string>("");
  async function load() {
    try {
      const c = await api<Conversation[]>("/conversations");
      setList(c);

      return c;
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }
  useEffect(() => {
    if (!user) return;
    sessionStorage.removeItem('pletosie-after-login');
    let active = true;
    if (productId) {
      const key = user.id + ":" + productId + ":" + (variantId || "");
      if (opening.current?.key !== key)
        opening.current = {
          key,
          promise: api<Conversation>("/conversations", {
            method: "POST",
            body: JSON.stringify({
              productId,
              ...(variantId ? { variantId } : {}),
            }),
          }),
        };
      setBusy(true);
      setError("");
      void opening.current.promise
        .then((c) => {
          if (!active) return;
          setSelected(c);
          setList((previous) => [c, ...previous.filter((t) => t.id !== c.id)]);
          router.replace("/conversations?fil=" + encodeURIComponent(c.id));
        })
        .catch((e) => {
          if (active) {
            setError(e.message);
            opening.current = null;
          }
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    } else {
      setBusy(false);
      void load();
      if (threadId)
        void api<Conversation>("/conversations/" + encodeURIComponent(threadId))
          .then((c) => {
            if (active) setSelected(c);
          })
          .catch((e) => {
            if (active) setError(e.message);
          });
    }
    return () => {
      active = false;
    };
  }, [user?.id, productId, variantId, threadId, router]);
  useEffect(() => {
    if (!selected) return;
    setAudio(null);setMessages([]);setOffers([]);clientId.current="";
    let active = true;
    async function poll() {
      try {
        const [m, o] = await Promise.all([
          api<Message[]>(`/conversations/${selected!.id}/messages`),
          api<Offer[]>(`/conversations/${selected!.id}/offers`),
        ]);
        if (active) {
          setMessages(m);
          setOffers(o);
          if (document.visibilityState === "visible" && document.hasFocus())
            void api(`/conversations/${selected!.id}/read`, {
              method: "POST",
            }).catch(() => {});
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    }
    void poll();
    const interval = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selected]);
  useEffect(() => {
    if (!user && (productId || threadId))
      sessionStorage.setItem(
        "pletosie-after-login",
        window.location.pathname + window.location.search,
      );
  }, [user, productId, threadId]);
  async function create() {
    setBusy(true);
    try {
      const c = await api<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({
          ...(params.get("produit")
            ? { productId: params.get("produit") }
            : {}),
          ...(params.get("variante")
            ? { variantId: params.get("variante") }
            : {}),
        }),
      });
      setSelected(c);
      await load();
      router.replace("/conversations?fil=" + encodeURIComponent(c.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    if (!selected || !text.trim()) return;
    setBusy(true);
    setError("");
    if (!clientId.current) clientId.current = crypto.randomUUID();
    try {
      await api(`/conversations/${selected.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          kind: "text",
          text,
          clientId: clientId.current,
        }),
      });
      setText("");
      clientId.current = "";
      setMessages(
        await api<Message[]>(`/conversations/${selected.id}/messages`),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const context = selected?.context;
  return (
    <section className="wrap page conversations-page">
      <span className="eyebrow">VOTRE STYLE, EN DIRECT</span>
      <h1>Vos conversations.</h1>
      {!user ? (
        <div className="empty">
          <Icon name="chat" size={42} />
          <h2>Parlons de vos envies.</h2>
          <p>
            Connectez-vous pour échanger avec l’atelier, en toute
            confidentialité.
          </p>
          <Link href="/compte" className="button">
            Me connecter
          </Link>
        </div>
      ) : (
        <>
          <div className="message-top">
            <p className="muted">
              Une question sur une pièce ? Une idée à imaginer ensemble ?
            </p>
            <button className="button" disabled={busy} onClick={create}>
              {params.get("produit")
                ? "Discuter de cet article"
                : "Nouvelle conversation"}{" "}
              +
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="messaging">
            <aside>
              {list.length ? (
                list.map((c) => (
                  <button
                    className={
                      selected?.id === c.id ? "thread selected" : "thread"
                    }
                    key={c.id}
                    onClick={() => {
                      setSelected(c);
                      router.replace(
                        "/conversations?fil=" + encodeURIComponent(c.id),
                      );
                      setError("");
                      setMessages([]);
                    }}
                  >
                    <span className="thread-avatar">{(c.displayName || c.person?.name || "P").slice(0,1).toUpperCase()}</span>
                    <span>
                      <strong>{c.displayName || c.person?.name || "Atelier Pletosie"}</strong><small className="thread-subject">{c.context?.name || "Votre projet sur mesure"}</small>
                      <small>
                        {new Date(c.updatedAt).toLocaleDateString("fr-FR", {
                          timeZone: "Africa/Porto-Novo",
                        })}
                      </small>
                    </span>
                    <span>›</span>
                  </button>
                ))
              ) : (
                <p className="muted">Vos conversations apparaîtront ici.</p>
              )}
            </aside>
            <div className="chat-area">
              {selected ? (
                <>
                  <div className="chat-heading">
                    <div className="chat-person"><span className="thread-avatar">{(selected.displayName || "P").slice(0,1).toUpperCase()}</span><div><strong>{selected.displayName || selected.person?.name || "Atelier Pletosie"}</strong><small>{selected.context?.name || "Votre projet sur mesure"}</small></div></div><span>Échange privé</span>
                  </div>
                  {context && (
                    <Link
                      className="context-card"
                      href={`/produit/${context.slug}`}
                    >
                      {context.image && <FashionImage src={context.image} alt={context.name}/>}<div><small>À PROPOS DE CET ARTICLE</small><strong>{context.name}</strong><span>{[context.category,context.variant].filter(Boolean).join(" · ")}</span>{context.price!==undefined&&<b>{money(context.price)}</b>}</div><span className="context-arrow">↗</span>
                    </Link>
                  )}
                  <div className="message-list">
                    {!messages.length && (
                      <p className="muted">Le premier mot est à vous.</p>
                    )}
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={
                          m.userId === user.id ? "bubble mine" : "bubble"
                        }
                      >
                        {m.kind === "audio" ? (
                          <AudioPlayer privateAudio src={`${API}/messages/${m.id}/audio`} />
                        ) : (
                          <p>{m.text}</p>
                        )}
                        <small>
                          {new Date(m.createdAt).toLocaleString("fr-FR", {
                            timeZone: "Africa/Porto-Novo",
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })}
                        </small>
                      </div>
                    ))}
                    {offers.map((o) => (
                      <div className="offer-card" key={o.id}>
                        <span className="eyebrow">
                          PROPOSITION · VERSION {o.version}
                        </span>
                        <p>{o.description}</p>
                        <strong>{money(o.price)}</strong>
                        <small>
                          Valable jusqu’au{" "}
                          {new Date(o.expiresAt).toLocaleString("fr-FR", {
                            timeZone: "Africa/Porto-Novo",
                          })}
                        </small>
                        <span className="badge">
                          {o.status === "pending"
                            ? "À examiner"
                            : o.status === "superseded"
                              ? "Remplacée"
                              : o.status}
                        </span>
                        {user.role !== "admin" && o.status === "pending" && (
                          <Link className="button" href={`/offre/${o.id}`}>
                            Examiner la proposition
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                  {audio && (
                    <div className="audio-preview">
                      <AudioPlayer src={audio} duration={audioDuration}/>
                      <button className="voice-icon" aria-label="Supprimer le vocal" onClick={() => {setAudio(null);clientId.current=""}}><Icon name="trash"/></button>
                      <button className="button" disabled={busy}
                        onClick={() => {
                          void (async () => {
                            setBusy(true);
                            if (!clientId.current)
                              clientId.current = crypto.randomUUID();
                            try {
                              await api(
                                `/conversations/${selected.id}/messages`,
                                {
                                  method: "POST",
                                  body: JSON.stringify({
                                    kind: "audio",
                                    audio: audio.split(",")[1],
                                    mime,
                                    clientId: clientId.current,
                                  }),
                                },
                              );
                              setAudio(null);
                              clientId.current = "";
                              setMessages(
                                await api<Message[]>(
                                  `/conversations/${selected.id}/messages`,
                                ),
                              );
                            } catch (e) {
                              setError((e as Error).message);
                            } finally {
                              setBusy(false);
                            }
                          })();
                        }}
                      >
                        <Icon name="arrow" size={18}/> {busy ? "Envoi…" : "Envoyer le vocal"}
                      </button>

                    </div>
                  )}
                  <form
                    className="composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send();
                    }}
                  >
                    {!audio && <VoiceRecorder key={selected.id} disabled={busy} onError={setError} onReady={(data,type,duration)=>{setAudio(data);setMime(type);setAudioDuration(duration);clientId.current="";setError("")}}/>}
                    <textarea
                      aria-label="Votre message"
                      placeholder="Votre message à l’atelier…"
                      value={text}
                      maxLength={4000}
                      rows={2}
                      onChange={(e) => {
                        setText(e.target.value);
                        clientId.current = "";
                      }}
                    />
                    <button
                      className="button"
                      disabled={busy || !text.trim()}
                      aria-label="Envoyer le message"
                    >
                      <Icon name="arrow" />
                    </button>
                  </form>
                  <small className="chat-footnote">
                    Texte et vocaux uniquement. Aucun envoi d’image ni de vidéo.
                    3 minutes et 10 Mo maximum par vocal.
                  </small>
                  {user.role === "admin" && (
                    <details className="offer-form">
                      <summary>Créer une proposition personnalisée</summary>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const f = new FormData(form);
                          try {
                            await api(`/conversations/${selected.id}/offers`, {
                              method: "POST",
                              body: JSON.stringify({
                                description: f.get("description"),
                                price: Number(f.get("price")),
                                quantity: Number(f.get("quantity")),
                                deliveryFee: Number(f.get("deliveryFee")),
                                expiresAt: new Date(
                                  f.get("expiresAt") as string,
                                ).toISOString(),
                              }),
                            });
                            setOffers(
                              await api<Offer[]>(
                                `/conversations/${selected.id}/offers`,
                              ),
                            );
                            form.reset();
                            tell("Proposition enregistrée.");
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        <label>
                          Modifications et mesures
                          <textarea
                            name="description"
                            required
                            minLength={10}
                            maxLength={2000}
                          />
                        </label>
                        <label>
                          Prix final (FCFA)
                          <input
                            type="number"
                            name="price"
                            required
                            min="1"
                            step="1"
                          />
                        </label>
                        <label>
                          Quantité
                          <input
                            type="number"
                            name="quantity"
                            min="1"
                            max="20"
                            defaultValue="1"
                            required
                          />
                        </label>
                        <label>
                          Livraison (FCFA)
                          <input
                            type="number"
                            name="deliveryFee"
                            min="0"
                            defaultValue="0"
                            required
                          />
                        </label>
                        <label>
                          Expiration
                          <input
                            type="datetime-local"
                            name="expiresAt"
                            required
                          />
                        </label>
                        <button className="button">
                          Envoyer la proposition
                        </button>
                      </form>
                    </details>
                  )}
                </>
              ) : (
                <div className="empty">
                  <Icon name="needle" size={46} />
                  <h2>
                    Chaque création commence
                    <br />
                    par une conversation.
                  </h2>
                  <p>
                    Sélectionnez un échange ou commencez une nouvelle histoire.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p className="wrap">Chargement…</p>}>
      <Conversations />
    </Suspense>
  );
}
