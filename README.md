# Baby Shower de Bébé Lafrenière

Plateforme web (Next.js 14 + Supabase) pour gérer les confirmations de présence (RSVP)
et les messages de bienvenue pour le baby shower du **28 novembre 2026**, au
207 rue St-Roch, Trois-Rivières.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth par courriel/mot de passe)
- Tailwind CSS + composants façon shadcn/ui (Radix UI)
- React Hook Form + Zod
- Déploiement recommandé : Vercel

## 1. Installation locale

```bash
npm install
cp .env.example .env.local
```

Remplis `.env.local` avec :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SITE_URL` | URL du site (ex. `http://localhost:3000` en dev) |
| `ADMIN_EMAILS` | Courriel(s) autorisé·s à accéder à `/admin`, séparés par des virgules |

## 2. Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Ouvre **SQL Editor** et exécute le contenu de [`schema.sql`](./schema.sql) — cela crée la
   table `rsvp_responses` et les politiques RLS (insertion publique, lecture/modification
   réservées aux comptes authentifiés).
3. Crée ton compte administrateur manuellement (aucune inscription publique n'est possible) :
   **Authentication > Users > Add user**, avec ton courriel (le même que dans `ADMIN_EMAILS`),
   un mot de passe de ton choix, et **Auto Confirm User** coché.

## 3. Lancer le projet

```bash
npm run dev
```

- Page d'accueil : `http://localhost:3000`
- Formulaire RSVP : `http://localhost:3000/rsvp`
- Registre de cadeaux : `http://localhost:3000/registre`
- Connexion admin : `http://localhost:3000/admin/login`

## 4. Déploiement sur Vercel

1. Pousse le projet sur un dépôt Git (GitHub/GitLab/Bitbucket).
2. Sur [vercel.com](https://vercel.com), clique **Add New Project** et importe le dépôt.
3. Ajoute les variables d'environnement suivantes dans **Project Settings > Environment
   Variables** (mêmes valeurs que `.env.local`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (l'URL finale, ex. `https://baby-shower-lafreniere.vercel.app`)
   - `ADMIN_EMAILS`
4. Déploie. Une fois le domaine final connu, mets à jour `NEXT_PUBLIC_SITE_URL` avec le vrai
   domaine, puis redéploie.

## Personnalisation

- **Contenu de l'événement** (titre, date, heure, lieu) : [`lib/site-config.ts`](./lib/site-config.ts).
- **Palette de couleurs** (thème safari vert sauge) : variables CSS dans
  [`app/globals.css`](./app/globals.css) et couleurs `sage.*` dans
  [`tailwind.config.ts`](./tailwind.config.ts).
- **Champs du formulaire** : [`lib/validations/rsvp.ts`](./lib/validations/rsvp.ts) (schéma Zod)
  et [`components/rsvp-form.tsx`](./components/rsvp-form.tsx). Le formulaire demande d'abord
  « Serez-vous présent·e ? » ; un refus n'affiche plus le nombre de personnes ni les allergies,
  mais garde le message pour bébé. **Si ta table `rsvp_responses` existe déjà** (créée avant cet
  ajout), exécute une fois la mise à jour de contrainte notée dans [`schema.sql`](./schema.sql)
  juste après `get_public_baby_messages` — sinon un refus échouera silencieusement en base.
- **Lien du registre Amazon** : `amazonRegistryUrl` dans [`lib/site-config.ts`](./lib/site-config.ts).

## Registre de cadeaux personnalisé

En plus du bouton **Registre pour bébé** (qui ouvre le registre Amazon dans un nouvel onglet —
Amazon bloque l'affichage de ses pages en iframe, c'est une limite de sécurité de leur côté,
pas la nôtre), le site propose un **registre de cadeaux spéciaux** géré entièrement depuis
`/admin` :

- Ajoute, modifie ou supprime des cadeaux (nom, prix, lien, description) directement dans le
  tableau de bord admin — aucun code à toucher.
- Sur `/registre`, les invité·es voient la liste et cliquent **« Je l'offre »** pour réserver un
  cadeau ; il disparaît alors automatiquement de la liste publique pour éviter les doublons.
- **Cadenas de confidentialité** : dans `/admin`, le bouton **Verrouiller le registre** te
  masque à toi-même le statut des achats (pour garder la surprise), derrière un mot de passe
  que tu choisis au premier verrouillage. Le mot de passe est haché (jamais stocké en clair) et
  n'est jamais retourné par l'API — seul le fait de le fournir à nouveau permet de déverrouiller.
  Les invité·es, eux, voient toujours la disponibilité réelle des cadeaux, peu importe l'état
  du cadenas.

Ce registre utilise deux tables supplémentaires (`gift_items`, `registry_lock`) — voir la
section correspondante dans [`schema.sql`](./schema.sql), à exécuter dans le même projet
Supabase que le reste (une seule fois, en plus du schéma déjà en place).

### Idées de livres

Même mécanisme, deuxième liste : sur `/livres`, les invité·es voient des suggestions de livres
pour enfant (pour y écrire un mot à bébé, voir la mention sur la page d'accueil) et cliquent
**« Je l'offre »** pour en réserver un. Géré depuis la même section `/admin` que le registre de
cadeaux, sous **« Idées de livres »** — **un seul cadenas protège les deux listes**, avec le
même mot de passe.

En interne, `gift_items` a une colonne `category` (`'cadeau'` ou `'livre'`) qui distingue les
deux listes ; tout le reste (table, verrou, fonction anti-doublon) est partagé.
**Si ta table `gift_items` existe déjà** (créée avant cet ajout), exécute une fois la migration
notée dans [`schema.sql`](./schema.sql) juste après la définition de la table — sans ça, `category`
n'existera pas et `/registre`/`/livres` resteront vides (rien n'est perdu, la colonne se rattrape
après coup).

## Mission Bébé Lafrenière (jeu de révélation du sexe)

Un mini-jeu à 3 missions (labyrinthe, formes, casse-tête) suivi d'un rebondissement comique
(« haha, on vous a bien eu ! ») et d'une double mise en scène avant de révéler si Bébé
Lafrenière sera une fille ou un garçon.

- `/jeux` est une route **toujours accessible** (même avant l'activation publique) pour tester
  le jeu à l'avance — un badge **MODE TEST** s'affiche tant que le jeu n'est pas activé.
- Dans `/admin`, la section **Mission Bébé Lafrenière** permet de choisir le sexe (avec
  confirmation), d'activer/désactiver le bouton public, et de prévisualiser le reveal sans
  affecter le site public.
- Le bouton public **« Connaître le sexe »** n'apparaît sur la page d'accueil que lorsque le
  jeu est activé.
- Le sexe n'est **jamais** exposé publiquement avant l'activation : `/api/gender-reveal/reveal`
  vérifie côté serveur que le jeu est activé avant de répondre, peu importe l'état du jeu côté
  navigateur (localStorage) — impossible à contourner en trichant sur l'appareil du joueur.
- La progression du joueur (missions complétées) est sauvegardée dans le `localStorage` de son
  appareil uniquement — jamais envoyée au serveur.

Ce jeu utilise une nouvelle table (`gender_reveal_settings`) et deux fonctions
(`get_gender_reveal_enabled`, `reveal_baby_gender`) — voir la section correspondante dans
[`schema.sql`](./schema.sql), à exécuter une fois dans le même projet Supabase que le reste.

## Structure du projet

```
app/
  page.tsx                    Page d'accueil publique
  rsvp/page.tsx                Formulaire RSVP
  registre/page.tsx             Registre de cadeaux spéciaux (public, category='cadeau')
  livres/page.tsx                Idées de livres (public, category='livre')
  admin/page.tsx                Tableau de bord (protégé)
  admin/login/page.tsx           Connexion par courriel/mot de passe
  api/rsvp/route.ts             POST — soumission d'un RSVP
  api/registry/route.ts          GET — cadeaux/livres disponibles (public, ?category=)
  api/registry/[id]/purchase/route.ts  POST — marquer un article acheté (public)
  api/admin/rsvp/route.ts        GET — liste des RSVP (protégé)
  api/admin/rsvp/[id]/route.ts    PATCH/DELETE — correction ou suppression d'un RSVP
  api/admin/registry/route.ts     GET/POST — liste et ajout (protégé, ?category=)
  api/admin/registry/[id]/route.ts  PATCH/DELETE — modifier ou supprimer un article
  api/admin/registry/lock/route.ts  POST — verrouiller/déverrouiller (partagé)
  jeux/page.tsx                  Mission Bébé Lafrenière (public, toujours accessible)
  api/gender-reveal/status/route.ts  GET — jeu activé ou non (public)
  api/gender-reveal/reveal/route.ts   POST — révèle le sexe (public, si activé seulement)
  api/admin/gender-reveal/route.ts    GET/POST — configuration du jeu (protégé)
components/
  rsvp-form.tsx                Formulaire complet (RHF + Zod)
  baby-messages.tsx             Section publique des messages
  gift-registry-list.tsx         Liste publique réutilisée par /registre et /livres
  safari-accents.tsx            Illustrations SVG décoratives (thème safari)
  admin/rsvp-table.tsx           Tableau, statistiques, export CSV
  admin/registries-panel.tsx      Assemble le cadenas + les deux listes (admin)
  admin/registry-lock-control.tsx  Cadenas partagé cadeaux/livres (admin)
  admin/category-registry-manager.tsx  Gestion d'une liste (cadeaux OU livres)
  admin/gender-reveal-panel.tsx  Contrôle du jeu (admin)
  jeux/game-experience.tsx        Orchestrateur des étapes du jeu
  jeux/maze-game.tsx, shapes-game.tsx, puzzle-game.tsx  Les 3 mini-jeux
  jeux/twist-question.tsx         Rebondissement + question "team garçon/fille"
  jeux/cinematic-countdown.tsx    Compte à rebours (utilisé 2 fois)
  jeux/reveal-screen.tsx          Écran final + confettis
  ui/*                          Composants façon shadcn/ui
lib/
  site-config.ts                Contenu de l'événement (à personnaliser)
  supabase/{client,server,middleware}.ts   Clients Supabase
  validations/rsvp.ts            Schéma Zod partagé client/serveur
  password.ts                    Hachage du mot de passe du cadenas (scrypt)
  jeux/config.ts                  Textes et paramètres du jeu (à personnaliser)
  jeux/maze-data.ts               Génération déterministe du labyrinthe
schema.sql                      Schéma SQL + politiques RLS Supabase
middleware.ts                    Protection des routes /admin et /api/admin
```

## Sécurité

- La table `rsvp_responses` a la RLS activée : tout le monde peut insérer une réponse,
  mais seuls les comptes authentifiés peuvent lire ou modifier.
- La connexion admin se fait par **courriel et mot de passe**, sans création de compte
  possible depuis le site — le compte doit être créé à l'avance dans Supabase.
- Le middleware (`middleware.ts` / `lib/supabase/middleware.ts`) vérifie en plus que le
  courriel connecté figure dans `ADMIN_EMAILS` avant de laisser passer vers `/admin` ou
  `/api/admin/*`.
