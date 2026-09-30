-- Schéma Supabase pour le Baby Shower de Bébé Lafrenière
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query

-- Extension nécessaire pour uuid_generate_v4() (généralement déjà activée sur Supabase)
create extension if not exists "pgcrypto";

-- Table des réponses RSVP
create table if not exists public.rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  -- 0 = réponse "je ne pourrai pas être présent·e" (guest_count n'a alors pas de sens)
  guest_count integer not null check (guest_count >= 0 and guest_count <= 5),
  will_attend boolean not null,
  message_for_baby text,
  dietary_restrictions text,
  allow_public_message boolean not null default false
);

comment on table public.rsvp_responses is 'Réponses RSVP pour le baby shower';

-- Active la Row Level Security
alter table public.rsvp_responses enable row level security;

-- N'importe qui (visiteur anonyme) peut soumettre une réponse RSVP
create policy "Tout le monde peut soumettre un RSVP"
  on public.rsvp_responses
  for insert
  to anon, authenticated
  with check (true);

-- Seuls les utilisateurs authentifiés (l'administrateur connecté par mot de passe)
-- peuvent lire l'ensemble des réponses. Le filtrage par courriel autorisé
-- (ADMIN_EMAILS) est appliqué en plus au niveau de l'application (middleware).
create policy "Seuls les utilisateurs authentifiés peuvent lire les RSVP"
  on public.rsvp_responses
  for select
  to authenticated
  using (true);

-- Permet à l'administrateur connecté de corriger manuellement une présence
create policy "Seuls les utilisateurs authentifiés peuvent modifier un RSVP"
  on public.rsvp_responses
  for update
  to authenticated
  using (true)
  with check (true);

-- Permet à l'administrateur connecté de supprimer une réponse (ex. entrée de test)
create policy "Seuls les utilisateurs authentifiés peuvent supprimer un RSVP"
  on public.rsvp_responses
  for delete
  to authenticated
  using (true);

-- Index utile pour la section publique "Messages pour bébé"
create index if not exists rsvp_public_messages_idx
  on public.rsvp_responses (created_at desc)
  where allow_public_message = true;

-- Comme pour le registre de cadeaux : la RLS de rsvp_responses interdit à
-- "anon" de lire quoi que ce soit (seul un admin authentifié le peut). Cette
-- fonction "security definer" expose donc UNIQUEMENT le nom et le message des
-- personnes ayant coché "afficher publiquement" — jamais le courriel ni les
-- allergies — sans avoir à assouplir la RLS de toute la table.
create or replace function public.get_public_baby_messages()
returns table (full_name text, message_for_baby text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select full_name, message_for_baby, created_at
  from public.rsvp_responses
  where allow_public_message = true
    and message_for_baby is not null
    and length(trim(message_for_baby)) > 0
  order by created_at desc
  limit 24;
$$;

grant execute on function public.get_public_baby_messages() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Mise à jour — réponse "je ne pourrai pas être présent·e"
-- ---------------------------------------------------------------------------
-- Si ta table rsvp_responses existe déjà (créée avant cet ajout), la
-- contrainte guest_count exigeait au moins 1 personne. Exécute cette ligne
-- une seule fois pour permettre 0 (utilisé pour un refus) :
--
-- alter table public.rsvp_responses drop constraint rsvp_responses_guest_count_check;
-- alter table public.rsvp_responses add check (guest_count >= 0 and guest_count <= 5);

-- =============================================================================
-- Registre de cadeaux personnalisé (géré depuis /admin, affiché sur /registre)
-- =============================================================================

create table if not exists public.gift_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  price numeric(10, 2),
  link_url text,
  sort_order integer not null default 0,
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  -- 'cadeau' = registre de cadeaux spéciaux (/registre) ; 'livre' = idées de
  -- livres pour le mot à bébé (/livres). Même table, même mécanisme anti-
  -- doublon et même cadenas — juste une liste séparée pour l'affichage.
  category text not null default 'cadeau'
);

comment on table public.gift_items is 'Registre de cadeaux personnalisé (plus dispendieux) et idées de livres';

-- Migration pour une table gift_items déjà existante (créée avant l'ajout de
-- "category") : sans effet si la colonne existe déjà ou sur une base neuve.
alter table public.gift_items add column if not exists category text not null default 'cadeau';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'gift_items_category_check'
  ) then
    alter table public.gift_items
      add constraint gift_items_category_check check (category in ('cadeau', 'livre'));
  end if;
end $$;

alter table public.gift_items enable row level security;

-- Tout le monde peut consulter les cadeaux encore disponibles
create policy "Tout le monde peut consulter le registre de cadeaux"
  on public.gift_items
  for select
  to anon, authenticated
  using (true);

-- Seul l'administrateur authentifié peut ajouter/modifier/supprimer un cadeau
create policy "Seuls les utilisateurs authentifiés peuvent gérer le registre"
  on public.gift_items
  for all
  to authenticated
  using (true)
  with check (true);

-- Fonction sécurisée : un·e invité·e anonyme peut marquer un cadeau comme
-- acheté, mais ne peut PAS modifier le nom, le prix ou le lien (contrairement
-- à une politique UPDATE classique). "security definer" fait tourner la
-- fonction avec les droits du propriétaire, en contournant la RLS UNIQUEMENT
-- pour cette action précise.
-- Retourne true seulement si CE call a bien réservé le cadeau. Si un autre
-- visiteur l'a pris une seconde avant (ou si l'identifiant n'existe pas),
-- retourne false — indispensable pour éviter que deux personnes reçoivent
-- toutes les deux un message de succès pour le même cadeau.
create or replace function public.mark_gift_purchased(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.gift_items
  set is_purchased = true, purchased_at = now()
  where id = p_id and is_purchased = false;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

grant execute on function public.mark_gift_purchased(uuid) to anon, authenticated;

-- =============================================================================
-- Verrou de confidentialité du registre
-- =============================================================================
-- Permet à l'administrateur de se cacher à lui-même le statut des achats
-- (pour garder la surprise), derrière un mot de passe distinct de son compte.

create table if not exists public.registry_lock (
  id boolean primary key default true,
  is_locked boolean not null default false,
  password_hash text,
  password_salt text,
  constraint registry_lock_singleton check (id)
);

insert into public.registry_lock (id, is_locked)
values (true, false)
on conflict (id) do nothing;

alter table public.registry_lock enable row level security;

-- Seul l'administrateur authentifié peut lire/modifier le verrou
create policy "Seuls les utilisateurs authentifiés peuvent gérer le verrou"
  on public.registry_lock
  for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- Mission Bébé Lafrenière (jeu de révélation du sexe)
-- =============================================================================
-- Ligne singleton (même technique que registry_lock). Le sexe n'est JAMAIS
-- lisible par un visiteur anonyme via une requête directe sur cette table
-- (RLS réservée aux comptes authentifiés) : les invité·es y accèdent
-- uniquement via la fonction reveal_baby_gender() ci-dessous, appelée par
-- notre API seulement au moment où le joueur termine les 3 mini-jeux.

create table if not exists public.gender_reveal_settings (
  id boolean primary key default true,
  game_enabled boolean not null default false,
  baby_gender text check (baby_gender in ('girl', 'boy')),
  constraint gender_reveal_settings_singleton check (id)
);

insert into public.gender_reveal_settings (id, game_enabled)
values (true, false)
on conflict (id) do nothing;

-- Contrôle séparé pour le pari amical (voir plus bas) : permet de le tester
-- en privé avant de l'ouvrir aux invité·es, indépendamment du jeu.
alter table public.gender_reveal_settings
  add column if not exists betting_enabled boolean not null default false;

alter table public.gender_reveal_settings enable row level security;

-- Seul l'administrateur authentifié peut lire/modifier la configuration
create policy "Seuls les utilisateurs authentifiés peuvent gérer le jeu"
  on public.gender_reveal_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Statut public : uniquement le booléen "activé", jamais le sexe.
create or replace function public.get_gender_reveal_enabled()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select game_enabled from public.gender_reveal_settings where id = true), false);
$$;

grant execute on function public.get_gender_reveal_enabled() to anon, authenticated;

-- Statut public du pari amical (voir plus bas) : uniquement le booléen
-- "ouvert aux invité·es", jamais aucune autre donnée de configuration.
create or replace function public.get_betting_enabled()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select betting_enabled from public.gender_reveal_settings where id = true), false);
$$;

grant execute on function public.get_betting_enabled() to anon, authenticated;

-- Révélation : ne renvoie le sexe qu'au moment où le joueur termine les 3
-- mini-jeux (appelée par /api/gender-reveal/reveal, jamais depuis le HTML ou
-- le bundle JS initial).
create or replace function public.reveal_baby_gender()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select baby_gender from public.gender_reveal_settings where id = true;
$$;

grant execute on function public.reveal_baby_gender() to anon, authenticated;

-- Votes anonymes "Team Fille / Team Garçon" posés juste avant la révélation
-- (pur divertissement, aucune donnée personnelle) : visibles uniquement par
-- l'admin dans /admin, sous forme de pourcentage.
create table if not exists public.gender_reveal_guesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guess text not null check (guess in ('girl', 'boy'))
);

alter table public.gender_reveal_guesses enable row level security;

-- N'importe qui peut voter (anonyme, aucune identification)
create policy "Tout le monde peut voter"
  on public.gender_reveal_guesses
  for insert
  to anon, authenticated
  with check (true);

-- Seul l'administrateur authentifié peut consulter les votes
create policy "Seuls les utilisateurs authentifiés peuvent lire les votes"
  on public.gender_reveal_guesses
  for select
  to authenticated
  using (true);

-- Permet à l'administrateur de réinitialiser les votes de test avant la fête
create policy "Seuls les utilisateurs authentifiés peuvent supprimer des votes"
  on public.gender_reveal_guesses
  for delete
  to authenticated
  using (true);

-- =============================================================================
-- Pari amical sur le sexe du bébé (pool à la pari-mutuel)
-- =============================================================================
-- Aucun argent ne transite par le site : les invité·es indiquent seulement
-- leur mise ici (payée en personne ou par Interac, en dehors du site) pour
-- que la cote et les gains se calculent automatiquement. Les nouvelles mises
-- sont bloquées dès que l'administrateur active la révélation (même
-- interrupteur que Mission Bébé Lafrenière) — vérifié directement dans la
-- politique RLS ci-dessous, pas seulement côté application, pour empêcher de
-- parier après avoir triché sur l'état côté navigateur.

create table if not exists public.gender_bets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  bettor_name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  choice text not null check (choice in ('girl', 'boy'))
);

alter table public.gender_bets enable row level security;

-- Transparence : tout le monde voit les mises déjà placées, comme un vrai
-- tableau de paris.
create policy "Tout le monde peut consulter les paris"
  on public.gender_bets
  for select
  to anon, authenticated
  using (true);

-- Migration pour une table gender_bets déjà créée avant l'ajout du mode
-- test (betting_enabled) : recrée la politique avec la double condition,
-- séparée par rôle pour que l'admin puisse tester avant l'ouverture publique.
drop policy if exists "Tout le monde peut parier tant que c'est ouvert" on public.gender_bets;

-- Les invité·es (anon) ne peuvent parier que si l'admin a ouvert le pari
-- publiquement, et jamais après la révélation.
create policy "Les invités peuvent parier une fois le pari ouvert"
  on public.gender_bets
  for insert
  to anon
  with check (
    coalesce(
      (select betting_enabled and not game_enabled from public.gender_reveal_settings where id = true),
      false
    )
  );

-- L'administrateur (seul compte "authenticated" possible sur ce site) peut
-- tester le formulaire de pari à tout moment avant la révélation, même en
-- mode test — pratique pour vérifier le rendu avant d'ouvrir aux invité·es.
create policy "L'administrateur peut parier en tout temps avant la révélation"
  on public.gender_bets
  for insert
  to authenticated
  with check (
    coalesce((select not game_enabled from public.gender_reveal_settings where id = true), true)
  );

-- Permet à l'administrateur de supprimer un pari erroné (doublon, annulation,
-- mise jamais réellement payée).
create policy "Seuls les utilisateurs authentifiés peuvent supprimer un pari"
  on public.gender_bets
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- IMPORTANT — Création du compte administrateur
-- ---------------------------------------------------------------------------
-- Le formulaire de connexion /admin/login utilise un mot de passe classique :
-- il n'est PAS possible de créer un compte depuis le site public. Tu dois
-- créer ton compte admin manuellement, une seule fois :
--
-- Dashboard Supabase > Authentication > Users > Add user > Create new user
--   - Email : la même adresse que dans la variable ADMIN_EMAILS (.env)
--   - Password : le mot de passe que tu utiliseras pour te connecter
--   - Auto Confirm User : coché
--
-- Ensuite, connecte-toi sur /admin/login avec ce courriel et ce mot de passe.
