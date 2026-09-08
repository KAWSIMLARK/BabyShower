import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RsvpForm } from "@/components/rsvp-form";
import { siteConfig } from "@/lib/site-config";
import { LeafBranch, Giraffe, BirdFlock } from "@/components/safari-accents";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Répondre à l'invitation — ${siteConfig.title}`,
};

export default function RsvpPage() {
  return (
    <main className="safari-toile-bg relative min-h-screen overflow-hidden px-6 py-16">
      <LeafBranch className="pointer-events-none absolute -left-8 top-0 hidden h-64 w-32 text-sage-300/50 lg:block" />
      <Giraffe className="pointer-events-none absolute -right-4 bottom-0 hidden h-72 w-36 text-sage-300/40 lg:block" />
      <BirdFlock className="pointer-events-none absolute right-10 top-8 hidden h-8 w-24 text-sage-500/45 md:block" />

      <div className="relative mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Répondre à l&apos;invitation</CardTitle>
            <CardDescription>
              {siteConfig.eventDateLabel} à {siteConfig.eventTimeLabel} — {siteConfig.location.name},{" "}
              {siteConfig.location.city}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RsvpForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
