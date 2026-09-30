import { createClient } from "@/lib/supabase/server";
import { resolveIsLocked } from "@/lib/registry-lock";
import { AdminRsvpTable, type RsvpRow } from "@/components/admin/rsvp-table";
import { RegistriesPanel } from "@/components/admin/registries-panel";
import type { GiftItemRow } from "@/components/admin/category-registry-manager";
import { LogoutButton } from "@/components/admin/logout-button";
import { GenderRevealPanel } from "@/components/admin/gender-reveal-panel";
import { BettingAdminPanel, type AdminBetRow } from "@/components/admin/betting-admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();

  const [
    { data: rsvpData, error: rsvpError },
    { data: lockRow, error: lockError },
    { data: giftData, error: giftError },
    { data: bookData, error: bookError },
    { data: genderRevealRow, error: genderRevealError },
    { data: guessData, error: guessError },
    { data: betsData, error: betsError },
  ] = await Promise.all([
    supabase.from("rsvp_responses").select("*").order("created_at", { ascending: false }),
    supabase.from("registry_lock").select("is_locked").eq("id", true).maybeSingle(),
    supabase
      .from("gift_items")
      .select("*")
      .eq("category", "cadeau")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("gift_items")
      .select("*")
      .eq("category", "livre")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("gender_reveal_settings")
      .select("game_enabled, baby_gender, betting_enabled")
      .eq("id", true)
      .maybeSingle(),
    supabase.from("gender_reveal_guesses").select("guess"),
    supabase
      .from("gender_bets")
      .select("id, bettor_name, amount, choice, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (lockError) console.error("Erreur de lecture du verrou du registre :", lockError);
  if (giftError) console.error("Erreur de lecture du registre de cadeaux :", giftError);
  if (bookError) console.error("Erreur de lecture des idées de livres :", bookError);
  if (genderRevealError)
    console.error("Erreur de lecture de la configuration du jeu :", genderRevealError);
  if (guessError) console.error("Erreur de lecture des votes :", guessError);
  if (betsError) console.error("Erreur de lecture des paris :", betsError);

  const guessCounts = (guessData ?? []).reduce(
    (acc, row) => {
      if (row.guess === "girl") acc.girl += 1;
      else if (row.guess === "boy") acc.boy += 1;
      return acc;
    },
    { girl: 0, boy: 0 }
  );

  const responses = (rsvpData ?? []) as RsvpRow[];
  const isLocked = resolveIsLocked(lockRow, lockError);

  function maskIfLocked(rows: typeof giftData) {
    return (
      isLocked
        ? (rows ?? []).map((item) => ({ ...item, is_purchased: false, purchased_at: null }))
        : (rows ?? [])
    ) as GiftItemRow[];
  }

  const giftItems = maskIfLocked(giftData);
  const bookItems = maskIfLocked(bookData);

  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Tableau de bord RSVP</h1>
            <p className="text-muted-foreground">
              Gestion des présences pour le baby shower de Bébé Lafrenière.
            </p>
          </div>
          <LogoutButton />
        </header>

        {rsvpError ? (
          <div className="rounded-xl bg-destructive/10 p-4 text-destructive">
            <p>
              Impossible de charger les réponses ({rsvpError.message}). Rafraîchis la page —
              si ça persiste, déconnecte-toi puis reconnecte-toi.
            </p>
            <LogoutButton />
          </div>
        ) : (
          <AdminRsvpTable initialData={responses} />
        )}

        <RegistriesPanel
          initialGiftItems={giftItems}
          initialBookItems={bookItems}
          initialLocked={isLocked}
        />

        <GenderRevealPanel
          initialEnabled={genderRevealRow?.game_enabled ?? false}
          initialGender={
            genderRevealRow?.baby_gender === "girl" || genderRevealRow?.baby_gender === "boy"
              ? genderRevealRow.baby_gender
              : null
          }
          initialGuesses={guessCounts}
        />

        <BettingAdminPanel
          initialBets={(betsData ?? []) as AdminBetRow[]}
          initialBettingEnabled={genderRevealRow?.betting_enabled ?? false}
        />
      </div>
    </main>
  );
}
