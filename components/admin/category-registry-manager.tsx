"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type GiftItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  link_url: string | null;
  is_purchased: boolean;
  purchased_at: string | null;
};

const priceFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

type NewItemForm = { name: string; price: string; linkUrl: string; description: string };
const emptyForm: NewItemForm = { name: "", price: "", linkUrl: "", description: "" };

export function CategoryRegistryManager({
  category,
  title,
  itemLabel,
  nameLabel,
  namePlaceholder,
  emptyIcon: EmptyIcon,
  emptyMessage,
  initialItems,
  locked,
}: {
  category: "cadeau" | "livre";
  title: string;
  itemLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  emptyIcon: LucideIcon;
  emptyMessage: string;
  initialItems: GiftItemRow[];
  locked: boolean;
}) {
  const [items, setItems] = useState(initialItems);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewItemForm>(emptyForm);
  const [togglingPurchasedId, setTogglingPurchasedId] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  async function refreshFromServer() {
    const response = await fetch(`/api/admin/registry?category=${category}`);
    if (response.ok) {
      const data = await response.json();
      setItems(data.data);
    }
  }

  // Le cadenas est partagé et géré par le parent : quand il change, on
  // recharge pour obtenir la version masquée (ou démasquée) depuis le
  // serveur, plutôt que de se fier à une valeur locale potentiellement
  // périmée.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    refreshFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  async function handleAddItem() {
    if (!newItem.name.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description || undefined,
          price: newItem.price ? Number(newItem.price) : null,
          linkUrl: newItem.linkUrl || undefined,
          category,
        }),
      });
      if (response.ok) {
        setNewItem(emptyForm);
        setShowAddForm(false);
        await refreshFromServer();
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? `Impossible d'ajouter ${itemLabel}.`);
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: GiftItemRow) {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      price: item.price != null ? String(item.price) : "",
      linkUrl: item.link_url ?? "",
      description: item.description ?? "",
    });
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/registry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          price: editForm.price ? Number(editForm.price) : null,
          linkUrl: editForm.linkUrl || null,
        }),
      });
      if (response.ok) {
        setEditingId(null);
        await refreshFromServer();
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? `Impossible de modifier ${itemLabel}.`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePurchased(item: GiftItemRow) {
    const nextValue = !item.is_purchased;
    setTogglingPurchasedId(item.id);
    try {
      const response = await fetch(`/api/admin/registry/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPurchased: nextValue }),
      });
      if (response.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_purchased: nextValue } : i)),
        );
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? "Impossible de mettre à jour cet article.");
      }
    } finally {
      setTogglingPurchasedId(null);
    }
  }

  async function handleDelete(item: GiftItemRow) {
    const confirmed = window.confirm(`Supprimer "${item.name}" ?`);
    if (!confirmed) return;
    const response = await fetch(`/api/admin/registry/${item.id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      const data = await response.json().catch(() => null);
      window.alert(data?.message ?? "Impossible de supprimer cet article.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Ajouter {itemLabel}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>{nameLabel} *</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))}
                  placeholder={namePlaceholder}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Prix approximatif ($)</Label>
                <Input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem((f) => ({ ...f, price: e.target.value }))}
                  placeholder="25"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Lien vers l&apos;article (optionnel)</Label>
              <Input
                value={newItem.linkUrl}
                onChange={(e) => setNewItem((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description (optionnel)</Label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddItem} disabled={saving || !newItem.name.trim()}>
                Ajouter
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {items.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
              <EmptyIcon className="h-8 w-8" />
              {emptyMessage}
            </CardContent>
          </Card>
        )}

        {items.map((item) =>
          editingId === item.id ? (
            <Card key={item.id} className="border-primary/30">
              <CardContent className="space-y-3 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={nameLabel}
                  />
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="Prix"
                  />
                </div>
                <Input
                  value={editForm.linkUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="Lien"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveEdit(item.id)} disabled={saving}>
                    <Check className="h-4 w-4" /> Enregistrer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" /> Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name}</p>
                    {!locked && (
                      <button
                        onClick={() => handleTogglePurchased(item)}
                        disabled={togglingPurchasedId === item.id}
                        title="Cliquer pour corriger manuellement (ex. coché par erreur)"
                        className="disabled:opacity-50"
                      >
                        <Badge variant={item.is_purchased ? "default" : "outline"}>
                          {item.is_purchased ? "Acheté" : "Disponible"}
                        </Badge>
                      </button>
                    )}
                  </div>
                  {item.price != null && (
                    <p className="text-sm text-muted-foreground">
                      {priceFormatter.format(item.price)}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
