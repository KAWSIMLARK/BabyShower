"use client";

import { useState } from "react";
import { Gift as GiftIcon, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type PublicGiftItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  link_url: string | null;
};

const priceFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function GiftRegistryList({ initialItems }: { initialItems: PublicGiftItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);

  async function handlePurchase(item: PublicGiftItem) {
    const confirmed = window.confirm(
      `Confirmer que vous vous procurez "${item.name}" ? Il disparaîtra de la liste pour éviter les doublons.`,
    );
    if (!confirmed) return;

    setPurchasingId(item.id);
    try {
      const response = await fetch(`/api/registry/${item.id}/purchase`, { method: "POST" });
      if (response.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setConfirmedMessage(`Merci ! "${item.name}" a été retiré de la liste.`);
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? "Impossible de réserver ce cadeau. Il a peut-être déjà été pris.");
        if (response.status === 409) {
          // Quelqu'un d'autre l'a pris entre-temps : on le retire aussi de notre vue locale.
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        }
      }
    } finally {
      setPurchasingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-md bg-white/70 text-center">
        <CardContent className="flex flex-col items-center gap-3 p-10">
          <GiftIcon className="h-10 w-10 text-primary" />
          <p className="font-semibold">Aucun cadeau disponible pour le moment</p>
          <p className="text-sm text-muted-foreground">
            Soit tout a déjà trouvé preneur, soit la liste n&apos;est pas encore prête —
            consultez aussi le registre Amazon depuis la page d&apos;accueil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {confirmedMessage && (
        <p className="rounded-xl bg-primary/10 p-3 text-center text-sm text-primary">
          {confirmedMessage}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="flex flex-col bg-white/70">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div>
                <p className="font-display text-lg font-semibold">{item.name}</p>
                {item.price != null && (
                  <p className="text-sm font-semibold text-primary">
                    {priceFormatter.format(item.price)}
                  </p>
                )}
              </div>
              {item.description && (
                <p className="flex-1 text-sm text-muted-foreground">{item.description}</p>
              )}
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Voir l&apos;article <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <Button
                onClick={() => handlePurchase(item)}
                disabled={purchasingId === item.id}
                className="mt-auto"
              >
                <CheckCircle2 className="h-4 w-4" /> Je l&apos;offre
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
