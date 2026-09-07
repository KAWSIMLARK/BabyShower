import { createClient } from "@/lib/supabase/server";
import { AdminRsvpTable, type RsvpRow } from "@/components/admin/rsvp-table";
import { GiftRegistryManager, type GiftItemRow } from "@/components/admin/gift-registry-manager";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();

  const [
    { data: rsvpData, error: rsvpError },
    { data: lockRow, error: lockError },
    { data: giftData, error: giftError },
  ] = await Promise.all([
    supabase.from("rsvp_responses").select("*").order("created_at", { ascending: false }),
    supabase.from("registry_lock").select("is_locked").eq("id", true).maybeSingle(),
    supabase
      .from("gift_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (lockError) console.error("Erreur de lecture du verrou du registre :", lockError);
  if (giftError) console.error("Erreur de lecture du registre de cadeaux :", giftError);

  const responses = (rsvpData ?? []) as RsvpRow[];
  const isLocked = lockRow?.is_locked ?? false;
  const giftItems = (
    isLocked
      ? (giftData ?? []).map((item) => ({ ...item, is_purchased: false, purchased_at: null }))
      : (giftData ?? [])
  ) as GiftItemRow[];

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
          <p className="rounded-xl bg-destructive/10 p-4 text-destructive">
            Impossible de charger les réponses : {rsvpError.message}
          </p>
        ) : (
          <AdminRsvpTable initialData={responses} />
        )}

        <GiftRegistryManager initialItems={giftItems} initialLocked={isLocked} />
      </div>
    </main>
  );
}
