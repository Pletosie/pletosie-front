import { Icon } from "@/components/icon";
import { notFound } from "next/navigation";
const pages: Record<string, { title: string; paragraphs: string[] }> = {
  livraison: {
    title: "Votre pièce, jusqu’à vous.",
    paragraphs: [
      "L’objectif de Pletosie est une livraison sous trois jours après confirmation du paiement, y compris pour les pièces personnalisées.",
      "Les zones desservies, frais, jours de service et modalités de remise restent à valider par la marque. Les ventes restent fermées tant que ces paramètres ne sont pas configurés.",
      "Votre adresse est enregistrée avec la commande. Un changement ultérieur de profil ne modifie pas une livraison déjà prévue.",
    ],
  },
  faq: {
    title: "Les réponses de l’atelier.",
    paragraphs: [
      "Comment choisir ma taille ? Consultez le guide de mesures de la marque et échangez avec la créatrice si vous avez un doute. Les tailles ne correspondent pas automatiquement à des tailles universelles.",
      "Puis-je personnaliser une pièce ? Ouvrez une conversation depuis sa fiche produit. La créatrice pourra préciser les modifications et établir une proposition.",
      "Comment payer ? Le paiement intégral par FeexPay est prévu. Les opérateurs MTN, Moov et Celtiis seront proposés uniquement après activation effective sur le compte marchand.",
      "Puis-je annuler ? La règle prévue est une limite de 24 heures après confirmation du paiement. Les modalités de remboursement doivent encore être validées. Une réclamation reste toujours possible dans les conversations.",
    ],
  },
  conditions: {
    title: "Conditions de vente — projet.",
    paragraphs: [
      "Ce texte est un projet de travail et ne constitue pas les conditions commerciales définitives. L’ouverture des ventes est désactivée en attendant validation.",
      "Pletosie prévoit un paiement intégral à la commande et une livraison sous trois jours. Les zones, frais et règles de calcul du délai seront précisés avant l’achat.",
      "L’annulation est prévue jusqu’à 24 heures après confirmation du paiement. Les frais, le canal et le délai de remboursement restent à arrêter.",
      "La marque souhaite ne pas proposer d’échanges ni de retours. La formulation définitive doit être vérifiée au regard des obligations applicables. Vous pourrez signaler un défaut, une erreur ou une non-livraison à l’atelier.",
      "L’identité et les coordonnées commerciales de la vendeuse, les règles définitives et la version des conditions seront publiées avant lancement.",
    ],
  },
  confidentialite: {
    title: "Vos données, avec attention.",
    paragraphs: [
      "La connexion utilise Google. Pletosie reçoit votre identifiant Google, votre nom et votre adresse email vérifiée pour créer votre espace et retrouver vos commandes et conversations. Pletosie ne reçoit pas votre mot de passe Google. La session est conservée dans un cookie HttpOnly.",
      "Le panier visiteur est enregistré sur votre appareil. Les coordonnées de livraison sont conservées dans un instantané de commande.",
      "Les consultations et ajouts au panier sont enregistrés comme événements techniques. Les durées de conservation et la configuration de mesure d’audience doivent être arrêtées avant production.",
      "Les prestataires prévus sont FeexPay pour le paiement et Cloudinary pour les médias. Les intégrations et le stockage privé des vocaux restent à configurer.",
      "Le responsable du traitement, son contact et les modalités d’exercice des droits seront renseignés par la marque avant ouverture.",
    ],
  },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: pages[slug]?.title || "Aide" };
}
export default async function Help({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) notFound();
  return (
    <section className="wrap page prose">
      <span className="eyebrow">À VOTRE ÉCOUTE</span>
      <h1>{p.title}</h1>
      {p.paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      <a className="text-link" href="/conversations">
        Échanger avec l’atelier <Icon name="arrow-up-right" size={15} />
      </a>
    </section>
  );
}
