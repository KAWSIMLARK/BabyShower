"use client";

import { useState } from "react";
import { Gift, BookOpen, Baby } from "lucide-react";
import { RegistryLockControl } from "@/components/admin/registry-lock-control";
import { CategoryRegistryManager, type GiftItemRow } from "@/components/admin/category-registry-manager";

export function RegistriesPanel({
  initialGiftItems,
  initialBookItems,
  initialBabyItems,
  initialLocked,
}: {
  initialGiftItems: GiftItemRow[];
  initialBookItems: GiftItemRow[];
  initialBabyItems: GiftItemRow[];
  initialLocked: boolean;
}) {
  const [locked, setLocked] = useState(initialLocked);
  // Incrémenté à chaque déplacement d'un article entre le registre bébé et
  // le registre de cadeaux spéciaux : les deux listes se rechargent.
  const [refreshSignal, setRefreshSignal] = useState(0);
  const handleMoved = () => setRefreshSignal((n) => n + 1);

  return (
    <div className="space-y-6">
      <RegistryLockControl locked={locked} onLockedChange={setLocked} />

      <CategoryRegistryManager
        category="bebe"
        title="Registre pour bébé"
        itemLabel="un article pour bébé"
        nameLabel="Nom de l'article"
        namePlaceholder="Ex : Porte-bébé"
        emptyIcon={Baby}
        emptyMessage="Aucun article ajouté pour le moment."
        initialItems={initialBabyItems}
        locked={locked}
        moveTo={{ category: "cadeau", label: "Registre de cadeaux spéciaux" }}
        onMoved={handleMoved}
        refreshSignal={refreshSignal}
      />

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
        moveTo={{ category: "bebe", label: "Registre pour bébé" }}
        onMoved={handleMoved}
        refreshSignal={refreshSignal}
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
