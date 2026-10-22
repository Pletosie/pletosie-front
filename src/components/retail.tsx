"use client";
import { useEffect, useState } from "react";
const themes = [
  "citron",
  "marron",
  "violet",
  "olive",
  "bordeaux",
  "nuit",
  "terracotta",
  "petrole",
];
const themeNames: Record<string, string> = {
  nuit: "Bleu nuit",
  petrole: "Bleu pétrole",
};
export function ThemeSwitcher() {
  const [theme, setTheme] = useState("citron");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pletosie-theme");
      if (saved && themes.includes(saved)) {
        setTheme(saved);
        document.documentElement.dataset.theme = saved;
      }
    } catch {}
  }, []);
  return (
    <div className="theme-picker" aria-label="Couleur de la boutique">
      <span>Votre ambiance</span>
      {themes.map((t) => (
        <button
          key={t}
          aria-label={"Thème " + (themeNames[t] || t)}
          aria-pressed={theme === t}
          title={themeNames[t] || t}
          className={"theme-dot " + t}
          onClick={() => {
            setTheme(t);
            document.documentElement.dataset.theme = t;
            try {
              localStorage.setItem("pletosie-theme", t);
            } catch {}
          }}
        >
          <i />
          {themeNames[t] || t}
        </button>
      ))}
    </div>
  );
}
export function FashionImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const match = src.match(/^\/pieces\/(robe|ensemble|haut|jupe)-[^/]+\.svg$/);
  if (!match)
    return (
      <img
        className={className}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
      />
    );
  const pos: Record<string, string> = {
    robe: "0% 0%",
    ensemble: "100% 0%",
    haut: "0% 100%",
    jupe: "100% 100%",
  };
  return (
    <span role="img" aria-label={alt} className={"fashion-image " + className}>
      <span
        className="fashion-sprite"
        style={{
          backgroundImage:
            "url(/editorial/collection-" +
            (src.includes("-noir") ? "noir-" : "") +
            "pletosie.png)",
          backgroundPosition: pos[match[1]],
        }}
      />
    </span>
  );
}
