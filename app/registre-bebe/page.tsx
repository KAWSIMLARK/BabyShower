import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GiftRegistryList, type PublicGiftItem } from "@/components/gift-registry-list";
import { siteConfig } from "@/lib/site-config";
import { Giraffe, AcaciaTree, DotCluster } from "@/components/safari-accents";

export const metadata: Metadata = {
  title: `Registre pour bébé — ${siteConfig.title}`,
};

export const dynamic = "force-dynamic";

export default async function BabyRegistryPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, description, price, link_url, image_url")
    .eq("category", "bebe")
    .eq("is_purchased", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur de lecture du registre pour bébé :", error);
  }

  // Le champ "description" sert de catégorie (Bain, Alimentation…) : on
  // regroupe sous un titre et on évite de la répéter sur chaque carte.
  const groups = new Map<string, PublicGiftItem[]>();
  for (const item of (data ?? []) as PublicGiftItem[]) {
    const key = item.description?.trim() || "Autres articles";
    const list = groups.get(key) ?? [];
    list.push({ ...item, description: null });
    groups.set(key, list);
  }

  return (
    <main className="safari-toile-bg relative min-h-screen overflow-hidden px-6 py-16">
      <AcaciaTree className="pointer-events-none absolute -left-10 top-0 hidden h-64 w-52 text-sage-300/40 lg:block" />
      <Giraffe className="pointer-events-none absolute -right-4 top-24 hidden h-56 w-28 text-sage-400/40 lg:block" />
      <DotCluster className="pointer-events-none absolute right-16 top-6 hidden h-20 w-20 text-sage-400 md:block" />

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold">Registre pour bébé</h1>
          <p className="mt-2 text-muted-foreground">
            Les articles dont bébé aura besoin. Un article disparaît de la liste dès qu&apos;il
            trouve preneur — merci de cliquer «&nbsp;Je l&apos;offre&nbsp;» seulement si vous
            comptez vraiment vous en occuper.
          </p>
        </div>

        {groups.size === 0 ? (
          <GiftRegistryList initialItems={[]} />
        ) : (
          <div className="space-y-10">
            {[...groups.entries()].map(([category, items]) => (
              <section key={category}>
                <h2 className="mb-4 font-display text-xl font-semibold text-primary">
                  {category}
                </h2>
                <GiftRegistryList initialItems={items} />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
