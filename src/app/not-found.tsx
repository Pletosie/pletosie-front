import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap page empty">
      <span className="eyebrow">404</span>
      <h1>Cette pièce nous échappe.</h1>
      <p>La page demandée n’est pas disponible.</p>
      <Link className="button" href="/catalogue">
        Revenir à la collection
      </Link>
    </section>
  );
}
