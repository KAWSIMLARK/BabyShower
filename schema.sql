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

-- Seuls les utilisateurs authentifiés (l'administrateur connecté via magic link)
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
  purchased_at timestamptz
);

comment on table public.gift_items is 'Registre de cadeaux personnalisé (plus dispendieux)';

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

-- ---------------------------------------------------------------------------
-- IMPORTANT — Création du compte administrateur
-- ---------------------------------------------------------------------------
-- Le formulaire de connexion /admin/login utilise un "magic link" (OTP) avec
-- shouldCreateUser: false : il n'est PAS possible de créer un compte depuis
-- le site public. Tu dois créer ton compte admin manuellement, une seule fois :
--
-- Dashboard Supabase > Authentication > Users > Add user > Create new user
--   - Email : la même adresse que dans la variable ADMIN_EMAILS (.env)
--   - Auto Confirm User : coché
--
-- Ensuite, connecte-toi sur /admin/login avec cette adresse pour recevoir
-- ton lien magique.
