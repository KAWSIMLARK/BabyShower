import { createClient } from "@/lib/supabase/server";
import { resolveIsLocked } from "@/lib/registry-lock";
import { AdminRsvpTable, type RsvpRow } from "@/components/admin/rsvp-table";
import { RegistriesPanel } from "@/components/admin/registries-panel";
import type { GiftItemRow } from "@/components/admin/category-registry-manager";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();

  const [
    { data: rsvpData, error: rsvpError },
    { data: lockRow, error: lockError },
    { data: giftData, error: giftError },
    { data: bookData, error: bookError },
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
  ]);

  if (lockError) console.error("Erreur de lecture du verrou du registre :", lockError);
  if (giftError) console.error("Erreur de lecture du registre de cadeaux :", giftError);
  if (bookError) console.error("Erreur de lecture des idées de livres :", bookError);

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
      </div>
    </main>
  );
}
