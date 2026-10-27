// Liens affichés sur la page : en ajouter un ici suffit.
export type SiteLink = {
  name: string;
  href: string;
  description?: string;
  /** Couleur d'accent : or par défaut, néon rose pour mettre un lien en avant */
  accent?: "gilt" | "neon";
};

export const LINKS: SiteLink[] = [
  { name: "Portfolio", href: "https://gabin-clavier.fr" },
  {
    name: "Codex",
    href: "https://codex.gabin-clavier.fr",
    description: "Ce que je regarde, lis et joue, et où j’en suis.",
    accent: "neon",
  },
];
