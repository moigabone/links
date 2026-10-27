# Liens

Carnet de liens de Gabin Clavier (portfolio, Codex…), sous le jardin 3D du chevalier, dans le style « Codex Nuit ».
Page statique : `index.html`, `styles.css` et `knight-garden.js` (scène Three.js), sans build ni dépendance à installer.

Pour la voir en local, sers le dossier avec n'importe quel serveur statique (par exemple Live Server).
Un serveur est nécessaire, car le module JavaScript ne se charge pas en ouvrant le fichier directement.

## Mise en ligne sur links.gabin-clavier.fr

Même hébergement que Codex : le repo est importé sur Vercel (preset « Other », aucune commande de build),
puis le domaine `links.gabin-clavier.fr` est ajouté au projet Vercel.
Le CNAME indiqué par Vercel est créé dans la zone DNS `gabin-clavier.fr` sur Cloudflare, en « DNS only » (nuage gris).
Chaque push sur `main` redéploie le site.
