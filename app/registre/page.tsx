import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GiftRegistryList, type PublicGiftItem } from "@/components/gift-registry-list";
import { siteConfig } from "@/lib/site-config";
import { Elephant, AcaciaTree, DotCluster } from "@/components/safari-accents";

export const metadata: Metadata = {
  title: `Registre de cadeaux — ${siteConfig.title}`,
};

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, description, price, link_url")
    .eq("is_purchased", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur de lecture du registre de cadeaux :", error);
  }

  const items = (data ?? []) as PublicGiftItem[];

  return (
    <main className="safari-toile-bg relative min-h-screen overflow-hidden px-6 py-16">
      <AcaciaTree className="pointer-events-none absolute -left-10 top-0 hidden h-64 w-52 text-sage-300/40 lg:block" />
      <Elephant className="pointer-events-none absolute -right-8 bottom-4 hidden h-32 w-40 text-sage-400/40 lg:block" />
      <DotCluster className="pointer-events-none absolute right-16 top-6 hidden h-20 w-20 text-sage-400 md:block" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Registre de cadeaux spéciaux</h1>
          <p className="mt-2 text-muted-foreground">
            Quelques idées un peu plus dispendieuses, à offrir seul·e ou à plusieurs. Un cadeau
            disparaît de la liste dès qu&apos;il trouve preneur — merci de cliquer «&nbsp;Je
            l&apos;offre&nbsp;» seulement si vous comptez vraiment vous en occuper.
          </p>
        </div>

        <GiftRegistryList initialItems={items} />
      </div>
    </main>
  );
}
