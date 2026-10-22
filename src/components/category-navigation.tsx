"use client";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "./icon";
const categories = ["Robes", "Ensembles", "Hauts", "Jupes"];
function Links({ active = "" }: { active?: string }) {
  return (
    <nav className="categories" aria-label="Collections">
      <Link
        className={active === "all" ? "active" : ""}
        aria-current={active === "all" ? "page" : undefined}
        href="/catalogue"
      >
        Toute la collection
      </Link>
      {categories.map((c) => (
        <Link
          key={c}
          className={active === c ? "active" : ""}
          aria-current={active === c ? "page" : undefined}
          href={`/catalogue?categorie=${c}`}
        >
          {c}
        </Link>
      ))}
      <Link href="/conversations" className="custom-link">
        Le sur-mesure <Icon name="arrow-up-right" size={16} />
      </Link>
    </nav>
  );
}
function Current() {
  const path = usePathname(),
    params = useSearchParams();
  const category = params.get("categorie");
  return (
    <Links
      active={
        path === "/catalogue"
          ? categories.includes(category || "")
            ? category!
            : "all"
          : ""
      }
    />
  );
}
export function CategoryNavigation() {
  return (
    <Suspense fallback={<Links />}>
      <Current />
    </Suspense>
  );
}
