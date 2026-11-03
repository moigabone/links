// Contenu de la carte : les briques, leurs liens et les parcours animés

export const PROJECTS = [
  ['portfolio', 'Portfolio'],
  ['codex', 'Codex'],
  ['veille', 'Veille'],
];

// Une rangée par étage, de l'accès aux coulisses
export const TIERS = [
  ['acces', 'Accès'],
  ['sites', 'Les sites'],
  ['hebergement', 'Hébergement'],
  ['donnees', 'Données et e-mails'],
  ['collecte', 'La collecte du matin'],
];

const ALL = ['portfolio', 'codex', 'veille'];

export const NODES = [
  { id: 'visiteurs', tier: 'acces', name: 'Toi et tes amis', sub: 'Navigateur ou appli installée', projects: ALL,
    role: 'Ouvrent les sites depuis un navigateur, ou depuis les applis installées sur le téléphone (Codex, Veille).' },
  { id: 'cloudflare', tier: 'acces', name: 'Cloudflare', sub: 'DNS de gabin-clavier.fr', projects: ALL,
    role: 'Annuaire du domaine : chaque sous-domaine pointe vers son hébergeur, et les enregistrements de Resend prouvent que les e-mails viennent bien de moi.',
    cost: '0 €, offre gratuite', url: 'https://www.cloudflare.com' },
  { id: 'ovh', tier: 'acces', name: 'OVH', sub: 'Domaine et boîte mail', projects: ALL,
    role: 'Là où le domaine gabin-clavier.fr est acheté. Il confie son DNS à Cloudflare et garde ma boîte mail contact@.',
    cost: 'Abonnement du domaine', url: 'https://www.ovhcloud.com' },

  { id: 'portfolio', tier: 'sites', site: true, name: 'Portfolio', sub: 'gabin-clavier.fr', href: 'https://gabin-clavier.fr', accent: 'gilt', projects: ['portfolio'],
    role: 'Mon portfolio 3D : un immeuble modélisé dans Blender, exploré au scroll.' },
  { id: 'codex', tier: 'sites', site: true, name: 'Codex', sub: 'codex.gabin-clavier.fr', href: 'https://codex.gabin-clavier.fr', accent: 'neon', projects: ['codex'],
    role: 'Ce que je regarde, lis et joue, et où j’en suis.' },
  { id: 'veille', tier: 'sites', site: true, name: 'Veille', sub: 'veille.gabin-clavier.fr', href: 'https://veille.gabin-clavier.fr', accent: 'sky', projects: ['veille'],
    role: 'Le récap de l’actu du matin, par thème. Sur invitation.' },
  { id: 'links', tier: 'sites', site: true, here: true, name: 'Cette carte', sub: 'links.gabin-clavier.fr', projects: [],
    role: 'Tu es ici.' },

  { id: 'pages', tier: 'hebergement', name: 'Cloudflare Pages', sub: 'Héberge le portfolio', projects: ['portfolio'],
    role: 'Construit le portfolio (Next.js exporté en pages statiques) et le met en ligne à chaque push sur master.',
    cost: '0 €, offre gratuite', code: ['moigabone/portfolio'], url: 'https://pages.cloudflare.com' },
  { id: 'vercel', tier: 'hebergement', name: 'Vercel', sub: 'Héberge Codex, Veille et la carte', projects: ['codex', 'veille'],
    role: 'Sert le Codex (Next.js) et les pages statiques de la Veille et de cette carte. Chaque push sur main redéploie le site en une minute.',
    cost: '0 €, offre Hobby', code: ['moigabone/codex', 'moigabone/veille', 'moigabone/links'], url: 'https://vercel.com' },
  { id: 'github', tier: 'hebergement', name: 'GitHub', sub: 'Le code de tout ça', projects: ALL,
    role: 'Les dépôts publics des quatre sites. Un push déclenche le déploiement chez l’hébergeur.',
    cost: '0 €', url: 'https://github.com/moigabone' },

  { id: 'tmdb', tier: 'donnees', name: 'TMDB · AniList', sub: 'Fiches films et anime', projects: ['codex'],
    role: 'Les bases de films, séries, anime et manga interrogées quand j’ajoute une fiche au Codex.',
    cost: '0 €' },
  { id: 'supabase', tier: 'donnees', name: 'Supabase', sub: 'Base, comptes, réveil', projects: ['codex', 'veille'],
    role: 'Base Postgres partagée par le Codex et la Veille : fiches, éditions du jour, comptes par code e-mail et règles d’accès (RLS). Son pg_cron réveille la collecte chaque matin.',
    cost: '0 €, offre gratuite', code: ['veille/supabase/*.sql', 'codex/supabase/schema.sql'], url: 'https://supabase.com' },
  { id: 'rss', tier: 'collecte', name: '30 flux RSS', sub: 'La presse, en 7 thèmes', projects: ['veille'],
    role: 'Tech, cyber, IA, finance, économie, politique et monde, avec des médias de gauche comme de droite en politique. On ne garde que titres, chapôs et liens.',
    cost: '0 €', code: ['veille/sources.json'] },
  { id: 'actions', tier: 'collecte', name: 'GitHub Actions', sub: 'La collecte du matin', projects: ['veille'],
    role: 'Fait tourner la collecte (Node 22) : lecture des flux, résumés par l’IA, publication. Son propre planning sert de secours si Supabase ne l’a pas lancée.',
    cost: '0 €', code: ['veille/.github/workflows/collecte.yml', 'veille/collector/collect.mjs'] },
  { id: 'claude', tier: 'collecte', name: 'Claude Haiku 5.5', sub: 'Les résumés', projects: ['veille'],
    role: 'Regroupe les articles qui parlent du même sujet, garde les 3 à 5 plus importants par thème et les résume en français.',
    cost: '≈ 0,013 $ par édition, 0,40 $ par mois', url: 'https://www.anthropic.com/claude' },
  { id: 'resend', tier: 'donnees', name: 'Resend', sub: 'Les codes par e-mail', projects: ['codex', 'veille'],
    role: 'Envoie les codes de connexion depuis noreply@gabin-clavier.fr, signés (DKIM) pour ne pas finir dans les spams.',
    cost: '0 €, jusqu’à 3 000 e-mails par mois', url: 'https://resend.com' },
];

// [départ, arrivée, ce qui passe, projets concernés]
export const EDGES = [
  ['visiteurs', 'cloudflare', 'demande l’adresse du site', ALL],
  ['ovh', 'cloudflare', 'confie le DNS du domaine', ALL],
  ['cloudflare', 'portfolio', 'gabin-clavier.fr', ['portfolio']],
  ['cloudflare', 'codex', 'codex.', ['codex']],
  ['cloudflare', 'veille', 'veille.', ['veille']],
  ['cloudflare', 'links', 'links.', []],
  ['pages', 'portfolio', 'sert les pages', ['portfolio']],
  ['vercel', 'codex', 'sert les pages', ['codex']],
  ['vercel', 'veille', 'sert les pages', ['veille']],
  ['vercel', 'links', 'sert la carte', []],
  ['github', 'pages', 'push sur master', ['portfolio']],
  ['github', 'vercel', 'push sur main', ['codex', 'veille']],
  ['codex', 'supabase', 'fiches et connexion', ['codex']],
  ['veille', 'supabase', 'éditions, Lu / Plus tard', ['veille']],
  ['codex', 'tmdb', 'recherche une fiche', ['codex']],
  ['supabase', 'actions', 'lance la collecte à 6 h 30', ['veille']],
  ['actions', 'rss', 'lit les articles', ['veille']],
  ['actions', 'claude', 'fait résumer', ['veille']],
  ['actions', 'supabase', 'publie l’édition', ['veille']],
  ['supabase', 'resend', 'envoie les codes', ['codex', 'veille']],
];

// Parcours animés : chaque étape suit un lien (de → vers) ou met une brique en avant
export const FLOWS = [
  {
    id: 'matin', label: 'La veille de 6 h 30', project: 'veille', steps: [
      { node: 'supabase', text: '6 h 30 : la tâche planifiée de Supabase (pg_cron) appelle GitHub.' },
      { edge: ['supabase', 'actions'], text: 'GitHub Actions démarre la collecte du matin.' },
      { edge: ['actions', 'rss'], text: 'Elle lit les 30 flux : environ 350 articles parus depuis la veille, sans doublons.' },
      { edge: ['actions', 'claude'], text: 'Claude Haiku regroupe les sujets et rédige les résumés, pour environ 1 centime.' },
      { edge: ['actions', 'supabase'], text: 'L’édition du jour est enregistrée dans Supabase.' },
      { edge: ['veille', 'supabase'], text: 'Le site de la Veille la lit, seulement pour les invités connectés.' },
    ],
  },
  {
    id: 'connexion', label: 'Une connexion', project: 'veille', steps: [
      { edge: ['visiteurs', 'cloudflare'], text: 'Tu tapes veille.gabin-clavier.fr : Cloudflare répond avec l’adresse de Vercel.' },
      { edge: ['vercel', 'veille'], text: 'Vercel sert la page de la Veille.' },
      { edge: ['veille', 'supabase'], text: 'Tu entres ton e-mail (et le code d’invitation la première fois) : Supabase vérifie la liste des invités.' },
      { edge: ['supabase', 'resend'], text: 'Resend t’envoie un code depuis noreply@gabin-clavier.fr.' },
      { edge: ['veille', 'supabase'], text: 'Code bon : les règles d’accès laissent lire l’édition et enregistrent tes Lu / Plus tard.' },
    ],
  },
  {
    id: 'push', label: 'Un git push', project: null, steps: [
      { node: 'github', text: 'Je pousse une modification sur GitHub.' },
      { edge: ['github', 'vercel'], text: 'Vercel reconstruit le Codex, la Veille ou cette carte…' },
      { edge: ['github', 'pages'], text: '…et Cloudflare Pages le portfolio.' },
      { edge: ['vercel', 'codex'], text: 'Environ une minute plus tard, la nouvelle version est en ligne.' },
    ],
  },
];
