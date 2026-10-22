import { SizeGuide } from "@/components/size-guide";
export const metadata = { title: "Guide des tailles" };
export default function Guide() {
  return (
    <section className="wrap page prose">
      <span className="eyebrow">LA JUSTE MESURE</span>
      <h1>Une pièce à votre mesure.</h1>
      <p>
        Les tailles Pletosie sont propres à la marque. Elles ne présument aucune
        équivalence universelle avec les tailles S, M ou L.
      </p>
      <SizeGuide />
      <h2>Comment prendre vos mesures</h2>
      <p>
        Utilisez un mètre ruban souple, sans serrer. Tenez-vous naturellement et
        notez vos mesures en centimètres.
      </p>
      <ol>
        <li>
          <strong>Poitrine :</strong> mesurez horizontalement à l’endroit le
          plus fort.
        </li>
        <li>
          <strong>Taille :</strong> mesurez à l’endroit le plus fin du buste.
        </li>
        <li>
          <strong>Hanches :</strong> mesurez au point le plus large.
        </li>
      </ol>
      <h2>Mesures du corps et du vêtement</h2>
      <p>
        Les mesures du corps décrivent votre morphologie. Celles du vêtement
        comprennent l’aisance de la coupe. Le guide publié distinguera ces deux
        informations pour chaque catégorie.
      </p>
      <a className="button" href="/conversations">
        Demander conseil à la créatrice
      </a>
    </section>
  );
}
