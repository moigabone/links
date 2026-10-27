import type { MetadataRoute } from "next";

// Application installable (téléphone, tablette), comme Codex
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Liens – Gabin Clavier",
    short_name: "Liens",
    description: "Carnet de liens de Gabin Clavier : portfolio et Codex.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#06051a",
    theme_color: "#06051a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
