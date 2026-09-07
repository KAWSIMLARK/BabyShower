# Baby Shower de Bébé Lafrenière

Plateforme web (Next.js 14 + Supabase) pour gérer les confirmations de présence (RSVP)
et les messages de bienvenue pour le baby shower du **28 novembre 2026**, au
207 rue St-Roch, Trois-Rivières.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth par magic link)
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
   **Authentication > Users > Add user**, avec ton courriel (le même que dans `ADMIN_EMAILS`)
   et **Auto Confirm User** coché.
4. Dans **Authentication > URL Configuration**, ajoute l'URL de callback :
   `https://TON-DOMAINE/auth/callback` (et `http://localhost:3000/auth/callback` pour le dev).

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
4. Déploie. Une fois le domaine final connu, mets à jour `NEXT_PUBLIC_SITE_URL` et l'URL de
   callback Supabase (étape 2.4) avec le vrai domaine, puis redéploie.

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

## Structure du projet

```
app/
  page.tsx                    Page d'accueil publique
  rsvp/page.tsx                Formulaire RSVP
  registre/page.tsx             Registre de cadeaux spéciaux (public)
  admin/page.tsx                Tableau de bord (protégé)
  admin/login/page.tsx           Connexion par magic link
  auth/callback/route.ts         Échange du code du magic link
  api/rsvp/route.ts             POST — soumission d'un RSVP
  api/registry/route.ts          GET — cadeaux disponibles (public)
  api/registry/[id]/purchase/route.ts  POST — marquer un cadeau acheté (public)
  api/admin/rsvp/route.ts        GET — liste des RSVP (protégé)
  api/admin/rsvp/[id]/route.ts    PATCH/DELETE — correction ou suppression d'un RSVP
  api/admin/registry/route.ts     GET/POST — liste et ajout de cadeaux (protégé)
  api/admin/registry/[id]/route.ts  PATCH/DELETE — modifier ou supprimer un cadeau
  api/admin/registry/lock/route.ts  POST — verrouiller/déverrouiller le registre
components/
  rsvp-form.tsx                Formulaire complet (RHF + Zod)
  baby-messages.tsx             Section publique des messages
  gift-registry-list.tsx         Liste publique du registre de cadeaux
  safari-accents.tsx            Illustrations SVG décoratives (thème safari)
  admin/rsvp-table.tsx           Tableau, statistiques, export CSV
  admin/gift-registry-manager.tsx  Gestion du registre + cadenas (admin)
  ui/*                          Composants façon shadcn/ui
lib/
  site-config.ts                Contenu de l'événement (à personnaliser)
  supabase/{client,server,middleware}.ts   Clients Supabase
  validations/rsvp.ts            Schéma Zod partagé client/serveur
  password.ts                    Hachage du mot de passe du cadenas (scrypt)
schema.sql                      Schéma SQL + politiques RLS Supabase
middleware.ts                    Protection des routes /admin et /api/admin
```

## Sécurité

- La table `rsvp_responses` a la RLS activée : tout le monde peut insérer une réponse,
  mais seuls les comptes authentifiés peuvent lire ou modifier.
- La connexion admin se fait uniquement par **magic link**, sans création de compte
  possible depuis le site (`shouldCreateUser: false`) — le compte doit être créé à
  l'avance dans Supabase.
- Le middleware (`middleware.ts` / `lib/supabase/middleware.ts`) vérifie en plus que le
  courriel connecté figure dans `ADMIN_EMAILS` avant de laisser passer vers `/admin` ou
  `/api/admin/*`.
