"use client";

import { useState } from "react";
import { Gift, BookOpen } from "lucide-react";
import { RegistryLockControl } from "@/components/admin/registry-lock-control";
import { CategoryRegistryManager, type GiftItemRow } from "@/components/admin/category-registry-manager";

export function RegistriesPanel({
  initialGiftItems,
  initialBookItems,
  initialLocked,
}: {
  initialGiftItems: GiftItemRow[];
  initialBookItems: GiftItemRow[];
  initialLocked: boolean;
}) {
  const [locked, setLocked] = useState(initialLocked);

  return (
    <div className="space-y-6">
      <RegistryLockControl locked={locked} onLockedChange={setLocked} />

      <CategoryRegistryManager
        category="cadeau"
        title="Registre de cadeaux spéciaux"
        itemLabel="un cadeau"
        nameLabel="Nom du cadeau"
        namePlaceholder="Ex : Poussette convertible"
        emptyIcon={Gift}
        emptyMessage="Aucun cadeau ajouté pour le moment."
        initialItems={initialGiftItems}
        locked={locked}
      />

      <CategoryRegistryManager
        category="livre"
        title="Idées de livres"
        itemLabel="une idée de livre"
        nameLabel="Titre du livre"
        namePlaceholder="Ex : Bonne nuit lune"
        emptyIcon={BookOpen}
        emptyMessage="Aucune idée de livre ajoutée pour le moment."
        initialItems={initialBookItems}
        locked={locked}
      />
    </div>
  );
}
