"use client";
import { useState } from "react";
import { API, api } from "@/lib/api";
import { Icon } from "./icon";
export function DownloadReceipt({
  orderId,
  paymentId,
}: {
  orderId?: string;
  paymentId?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <span className="receipt-download">
      <button
        type="button"
        className="button secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            let id = paymentId;
            if (!id) {
              const attempts = await api<{ id: string; status: string }[]>(
                "/orders/" + encodeURIComponent(orderId!) + "/payments",
              );
              id = attempts.find((a) => a.status === "confirmed")?.id;
            }
            if (!id)
              throw new Error(
                "Le reçu sera disponible dès la confirmation du paiement.",
              );
            const response = await fetch(
              API + "/payments/" + encodeURIComponent(id) + "/receipt",
              { credentials: "include", cache: "no-store" },
            );
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(
                data.message || "Le reçu est momentanément indisponible.",
              );
            }
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = "Pletosie-RC-" + id + ".pdf";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 30000);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Icon name="download" size={17} />
        {busy ? "Préparation…" : "Télécharger le reçu"}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
