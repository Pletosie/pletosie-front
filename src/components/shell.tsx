"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./retail";
import { usePathname } from "next/navigation";
import { useStore } from "./store";
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    play: <path d="m8 4 12 8-12 8Z" />,
    pause: <><path d="M8 4v16M16 4v16" strokeWidth="4" /></>,
    check: <path d="m4 12 5 5L20 6" />,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
    bell: <><path d="M4 17h16l-2-3V9a6 6 0 0 0-12 0v5ZM10 21h4"/></>,
    pin: <><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    chat: <path d="M21 11a9 9 0 0 1-9 9H4l-3 2 2-7a9 9 0 1 1 18-4Z" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    home: (
      <>
        <path d="m3 10 9-8 9 8v11H3Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="2" width="6" height="13" rx="3" />
        <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v4m-4 0h8" />
      </>
    ),
    truck: (
      <>
        <path d="M2 5h12v12H2Zm12 5h4l4 4v3h-8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    needle: (
      <>
        <path d="m4 20 14-17 3 3L4 20Z" />
        <path d="m16 6 2-2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const { lines, user, unread } = useStore();
  const path = usePathname();
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return (
    <>
      <a href="#contenu" className="skip">
        Aller au contenu
      </a>
      <div className="announcement">
        DU STYLE. DU CARACTÈRE. DU PLETOSIE.{" "}
        <span>Trouvez votre prochaine pièce forte.</span>
      </div>
      <header>
        <div className="header-inner">
          <Link className="brand" href="/">
            pletosie<span>WEAR YOUR ENERGY</span>
          </Link>
          <form action="/catalogue" className="search">
            <Icon name="search" />
            <input
              name="q"
              placeholder="Une robe, une envie, une pièce…"
              aria-label="Rechercher un article"
            />
            <button aria-label="Lancer la recherche">
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <div className="header-actions">
            <Link href="/conversations" aria-label="Conversations">
              <Icon name="chat" />
              {unread > 0 && <span className="unread-count">{unread}</span>}
            </Link>
            <Link href="/compte" aria-label="Mon compte">
              <Icon name="user" />
            </Link>
            <Link
              className="bag-link"
              href="/panier"
              aria-label={`Panier, ${count} articles`}
            >
              <Icon name="bag" />
              <span>{count}</span>
            </Link>
          </div>
        </div>
        <ThemeSwitcher />
        <nav className="categories">
          <Link
            className={path === "/catalogue" ? "active" : ""}
            href="/catalogue"
          >
            Toute la collection
          </Link>
          {["Robes", "Ensembles", "Hauts", "Jupes"].map((c) => (
            <Link key={c} href={`/catalogue?categorie=${c}`}>
              {c}
            </Link>
          ))}
          <Link href="/conversations" className="custom-link">
            Le sur-mesure <span>↗</span>
          </Link>
        </nav>
      </header>
      <main id="contenu">{children}</main>
      <footer>
        <div className="footer-brand">
          <Link className="brand" href="/">
            pletosie
          </Link>
          <p>
            Des pièces qui racontent votre histoire.
            <br />
            Imaginées et confectionnées avec soin.
          </p>
        </div>
        <div>
          <h3>La boutique</h3>
          <Link href="/catalogue">Nos collections</Link>
          <Link href="/conversations">Une envie sur mesure</Link>
          <Link href="/guide-des-tailles">Guide des tailles</Link>
        </div>
        <div>
          <h3>À votre écoute</h3>
          <Link href="/aide/livraison">Livraison</Link>
          <Link href="/aide/faq">Questions fréquentes</Link>
          <Link href="/conversations">Contacter l’atelier</Link>
        </div>
        <div>
          <h3>Votre espace</h3>
          <Link href="/compte">Mon compte</Link>
          <Link href="/commandes">Mes commandes</Link>
          {user?.role === "admin" && <Link href="/admin">Administration</Link>}
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Pletosie. Chaque détail compte.
          </span>
          <div>
            <Link href="/aide/conditions">Conditions de vente</Link>
            <Link href="/aide/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </footer>
      <nav className="mobile-nav">
        {[
          ["/", "home", "Accueil"],
          ["/catalogue", "search", "Explorer"],
          ["/panier", "bag", `Panier${count ? ` (${count})` : ""}`],
          ["/conversations", "chat", "Messages"],
          ["/compte", "user", "Compte"],
        ].map(([url, icon, label]) => (
          <Link className={path === url ? "active" : ""} key={url} href={url}>
            <Icon name={icon} size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
