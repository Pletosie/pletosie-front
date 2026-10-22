"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="wrap page empty">
      <h1>Une petite interruption.</h1>
      <p>Le service n’a pas pu répondre. Votre panier est conservé.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </section>
  );
}
