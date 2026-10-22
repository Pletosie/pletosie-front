import Link from "next/link";
import { Icon } from "./icon";
export function CheckoutHeading({
  title,
  eyebrow,
  step,
}: {
  title: string;
  eyebrow: string;
  step: number;
}) {
  return (
    <header className="commerce-heading">
      <span className="commerce-emblem">
        <Icon name={step === 3 ? "shield" : "bag"} size={30} />
      </span>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <nav className="checkout-steps" aria-label="Étapes de la commande">
        {["Panier", "Livraison", "Paiement"].map((label, i) => (
          <span key={label} aria-current={step === i + 1 ? "step" : undefined}>
            <b>{step > i + 1 ? <Icon name="check" size={13} /> : i + 1}</b>
            {i === 0 && step > 1 ? <Link href="/panier">{label}</Link> : label}
          </span>
        ))}
      </nav>
    </header>
  );
}
