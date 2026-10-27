# Liens

Carnet de liens de Gabin Clavier (portfolio, Codex…), sous le ciel « Codex Nuit » :
un jardin 3D animé (Three.js) derrière une liste de liens.
Next.js (App Router), même structure et même style que [Codex](https://codex.gabin-clavier.fr).

- `lib/links.ts` : les liens affichés ; en ajouter un ici suffit
- `lib/knight-garden.js` : la scène 3D du jardin (chargée uniquement côté navigateur)
- `app/globals.css` : le thème Codex Nuit
- `app/manifest.ts` + `public/icons/` : application installable (PWA)

## Mise en route

`npm install` puis `npm run dev`, et ouvre http://localhost:3000.

## Mise en ligne sur links.gabin-clavier.fr

Comme Codex : importer le repo sur Vercel (aucune variable d'environnement nécessaire),
puis ajouter le domaine `links.gabin-clavier.fr` dans le projet Vercel.
Vercel indique l'enregistrement CNAME à créer dans la zone DNS `gabin-clavier.fr` sur Cloudflare,
en mode « DNS only » (nuage gris).
