import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GiftRegistryList, type PublicGiftItem } from "@/components/gift-registry-list";
import { siteConfig } from "@/lib/site-config";
import { LeafBranch, BirdFlock } from "@/components/safari-accents";

export const metadata: Metadata = {
  title: `Idées de livres — ${siteConfig.title}`,
};

export const dynamic = "force-dynamic";

export default async function BookIdeasPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, description, price, link_url")
    .eq("category", "livre")
    .eq("is_purchased", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur de lecture des idées de livres :", error);
  }

  const items = (data ?? []) as PublicGiftItem[];

  return (
    <main className="safari-toile-bg relative min-h-screen overflow-hidden px-6 py-16">
      <LeafBranch className="pointer-events-none absolute -left-8 top-0 hidden h-64 w-32 text-sage-300/40 lg:block" />
      <BirdFlock className="pointer-events-none absolute right-10 top-8 hidden h-8 w-24 text-sage-500/45 md:block" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Idées de livres</h1>
          <p className="mt-2 text-muted-foreground">
            Quelques suggestions de livres pour enfant, si vous voulez vous en procurer un pour
            y écrire un mot à bébé. Un titre disparaît de la liste dès qu&apos;il trouve preneur
            — mais n&apos;importe quel livre pour enfant fait tout aussi bien l&apos;affaire si
            vous préférez choisir le vôtre.
          </p>
        </div>

        <GiftRegistryList
          initialItems={items}
          emptyTitle="Aucune suggestion de livre pour le moment"
          emptyMessage="Choisissez simplement le livre pour enfant de votre choix — l'important, c'est le mot que vous y écrirez pour bébé."
        />
      </div>
    </main>
  );
}
