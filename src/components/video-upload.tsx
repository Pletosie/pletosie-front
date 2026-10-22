"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "./icon";
type Ticket = {
  url: string;
  apiKey: string;
  signature: string;
  params: Record<string, string | number>;
};
export function VideoUpload({
  videos,
  onChange,
  onBusy,
}: {
  videos: string[];
  onChange: (videos: string[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="video-editor">
      <h3>La création en vidéo</h3>
      <p>
        Ajoutez jusqu’à 3 vidéos. MP4, WebM ou MOV · 50 Mo et 3 minutes maximum
        par vidéo.
      </p>
      <input
        type="file"
        aria-label="Importer une vidéo de la création"
        accept="video/mp4,video/webm,video/quicktime,.mov"
        disabled={busy || videos.length >= 3}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setError("");
          if (file.size > 50 * 1024 * 1024) {
            setError("La vidéo dépasse 50 Mo.");
            return;
          }
          setBusy(true);
          onBusy(true);
          try {
            const ticket = await api<Ticket>("/admin/videos/upload-ticket", {
              method: "POST",
              body: "{}",
            });
            const data = new FormData();
            data.append("file", file);
            data.append("api_key", ticket.apiKey);
            data.append("signature", ticket.signature);
            for (const [key, value] of Object.entries(ticket.params))
              data.append(key, String(value));
            const upload = await fetch(ticket.url, {
              method: "POST",
              body: data,
            });
            if (!upload.ok)
              throw new Error("L’import de la vidéo a échoué. Réessayez.");
            const result = await upload.json();
            const verified = await api<{ url: string }>(
              "/admin/videos/verify",
              {
                method: "POST",
                body: JSON.stringify({ publicId: result.public_id }),
              },
            );
            onChange([...videos, verified.url]);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
            onBusy(false);
          }
        }}
      />
      {busy && <p role="status">Import et vérification de la vidéo…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="video-editor-list">
        {videos.map((url, i) => (
          <div key={url}>
            <video
              src={url}
              controls
              playsInline
              preload="metadata"
              aria-label={"Vidéo " + (i + 1)}
            />
            <button
              type="button"
              disabled={busy}
              className="text-link"
              onClick={() => onChange(videos.filter((v) => v !== url))}
            >
              <Icon name="trash" size={16} /> Retirer la vidéo {i + 1}
            </button>
          </div>
        ))}
      </div>
      <p className="muted">
        Enregistrez l’article pour publier les vidéos ajoutées ou retirées.
      </p>
    </section>
  );
}
