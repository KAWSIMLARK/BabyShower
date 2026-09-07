import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RsvpForm } from "@/components/rsvp-form";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Confirmer ma présence — ${siteConfig.title}`,
};

export default function RsvpPage() {
  return (
    <main className="min-h-screen bg-secondary/30 px-6 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Confirmer ma présence</CardTitle>
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
