import type { Metadata } from "next";
import { StoreProvider } from "@/components/store";
import { Shell } from "@/components/shell";
import { PushProvider } from "@/components/push-notifications";
import "./globals.css";
import "./retail.css";
import "./community.css";
import "./catalog.css";
import "./commerce.css";
export const metadata: Metadata = {
  title: {
    default: "Pletosie — Des pièces qui vous ressemblent",
    template: "%s · Pletosie",
  },
  description:
    "Découvrez l’atelier Pletosie : vêtements de créatrice, collections et pièces personnalisées.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pletosie", statusBarStyle: "default" },
  icons: { apple: "/icons/icon-192.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <StoreProvider>
          <PushProvider>
            <Shell>{children}</Shell>
          </PushProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
