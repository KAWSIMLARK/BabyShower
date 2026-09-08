import Link from "next/link";
import { CalendarDays, MapPin, PartyPopper, Gift, ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LeafBranch,
  DotCluster,
  HotAirBalloon,
  Giraffe,
  Elephant,
  AcaciaTree,
  BirdFlock,
} from "@/components/safari-accents";
import { BabyMessages } from "@/components/baby-messages";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="safari-toile-bg relative overflow-hidden">
      <LeafBranch className="pointer-events-none absolute -left-6 top-0 hidden h-72 w-40 text-sage-300/60 sm:block" />
      <LeafBranch className="pointer-events-none absolute -right-4 top-24 hidden h-64 w-36 rotate-[20deg] text-sage-300/40 sm:block" />
      <DotCluster className="pointer-events-none absolute right-10 top-6 hidden h-24 w-24 text-sage-400 sm:block" />
      <HotAirBalloon className="pointer-events-none absolute left-12 top-40 hidden h-20 w-14 text-sage-500/50 sm:block" />
      <AcaciaTree className="pointer-events-none absolute -right-8 top-0 hidden h-64 w-52 text-sage-400/40 lg:block" />
      <BirdFlock className="pointer-events-none absolute left-1/3 top-10 hidden h-10 w-28 text-sage-500/50 sm:block" />

      <section className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-10 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
          <PartyPopper className="h-4 w-4" /> Vous êtes invité·e
        </span>

        <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {siteConfig.heroHeading}
        </h1>

        <p className="mt-5 max-w-xl text-balance text-muted-foreground sm:text-lg">
          {siteConfig.heroSubheading}
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <Card className="bg-white/70">
            <CardContent className="flex items-center gap-4 p-5 text-left">
              <CalendarDays className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{siteConfig.eventDateLabel}</p>
                <p className="text-sm text-muted-foreground">{siteConfig.eventTimeLabel}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70">
            <CardContent className="flex items-center gap-4 p-5 text-left">
              <MapPin className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{siteConfig.location.name}</p>
                <p className="text-sm text-muted-foreground">{siteConfig.location.city}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <a
          href={siteConfig.location.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Voir l&apos;emplacement sur la carte
        </a>

        <Button asChild size="lg" className="mt-10">
          <Link href="/rsvp">Répondre à l&apos;invitation</Link>
        </Button>
      </section>

      <section className="relative mx-auto max-w-2xl px-6 pb-16 text-center">
        <Giraffe className="pointer-events-none absolute -left-2 bottom-0 hidden h-56 w-28 text-sage-400/50 sm:block" />
        <Elephant className="pointer-events-none absolute -right-6 bottom-8 hidden h-28 w-36 text-sage-400/45 sm:block" />
        <HotAirBalloon className="pointer-events-none absolute right-4 top-0 hidden h-16 w-11 text-sage-500/45 md:block" />
        <h2 className="font-display text-2xl font-semibold">Envie de gâter bébé ?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Voici deux façons de choisir un cadeau — aucune obligation, votre présence est déjà
          le plus beau des cadeaux.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <a href={siteConfig.amazonRegistryUrl} target="_blank" rel="noopener noreferrer">
              <Gift className="h-4 w-4" /> Registre pour bébé
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/registre">
              <Gift className="h-4 w-4" /> Registre de cadeaux spéciaux
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Le registre Amazon s&apos;ouvre dans un nouvel onglet (Amazon ne permet pas
          l&apos;affichage de ses pages ailleurs).
        </p>
      </section>

      <BabyMessages />
    </main>
  );
}
