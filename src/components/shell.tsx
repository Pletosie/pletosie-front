"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./retail";
import { CategoryNavigation } from "./category-navigation";
import { usePathname } from "next/navigation";
import { useStore } from "./store";
import { Icon } from "./icon";
export { Icon } from "./icon";
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
            <Icon name="asterisk" size={22} />
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
              {unread > 0 && (
                <span className="unread-count header-count">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
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
              <span className="header-count">{count > 99 ? "99+" : count}</span>
            </Link>
          </div>
        </div>
        <ThemeSwitcher />
        <CategoryNavigation />
      </header>
      <main id="contenu">{children}</main>
      <footer>
        <div className="footer-brand">
          <Link className="brand" href="/">
            pletosie
            <Icon name="asterisk" size={22} />
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
