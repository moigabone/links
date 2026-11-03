# Liens

Carte interactive de mes sites (portfolio, Codex, Veille) et de tout ce qui les fait tourner, sous le jardin 3D du chevalier, dans le style « Codex Nuit ».
Un clic sur un site l’ouvre ; un clic sur une brique (Vercel, Supabase, Claude…) affiche son rôle, son coût et où elle se trouve dans le code ;
les filtres allument un projet et les parcours animent le chemin des données (la veille de 6 h 30, une connexion, un git push).

Page statique, sans build : `index.html`, `styles.css`, `map.js` (la carte), `map-data.js` (son contenu : briques, liens, parcours)
et `knight-garden.js` (scène Three.js).
Pour ajouter un site ou une brique, il suffit de modifier `map-data.js`.

Pour la voir en local, sers le dossier avec n'importe quel serveur statique (par exemple Live Server).
Un serveur est nécessaire, car le module JavaScript ne se charge pas en ouvrant le fichier directement.

## Mise en ligne sur links.gabin-clavier.fr

Même hébergement que Codex : le repo est importé sur Vercel (preset « Other », aucune commande de build),
puis le domaine `links.gabin-clavier.fr` est ajouté au projet Vercel.
Le CNAME indiqué par Vercel est créé dans la zone DNS `gabin-clavier.fr` sur Cloudflare, en « DNS only » (nuage gris).
Chaque push sur `main` redéploie le site.
