"use client";

import { useState } from "react";
import { Lock, Unlock, Plus, Trash2, Pencil, Check, X, Gift } from "lucide-react";
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

export function GiftRegistryManager({
  initialItems,
  initialLocked,
}: {
  initialItems: GiftItemRow[];
  initialLocked: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [locked, setLocked] = useState(initialLocked);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewItemForm>(emptyForm);

  const [lockPrompt, setLockPrompt] = useState<"none" | "set-password" | "unlock">("none");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockBusy, setLockBusy] = useState(false);

  async function refreshFromServer() {
    const response = await fetch("/api/admin/registry");
    if (response.ok) {
      const data = await response.json();
      setItems(data.data);
      setLocked(data.locked);
    }
  }

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
        }),
      });
      if (response.ok) {
        setNewItem(emptyForm);
        setShowAddForm(false);
        await refreshFromServer();
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? "Impossible d'ajouter ce cadeau.");
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
        window.alert(data?.message ?? "Impossible de modifier ce cadeau.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: GiftItemRow) {
    const confirmed = window.confirm(`Supprimer "${item.name}" du registre ?`);
    if (!confirmed) return;
    const response = await fetch(`/api/admin/registry/${item.id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      const data = await response.json().catch(() => null);
      window.alert(data?.message ?? "Impossible de supprimer ce cadeau.");
    }
  }

  async function handleLockClick() {
    setLockError(null);
    // On ne sait pas côté client si un mot de passe existe déjà : on tente un
    // verrouillage direct, l'API demandera un nouveau mot de passe si besoin.
    const response = await fetch("/api/admin/registry/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lock" }),
    });
    if (response.ok) {
      setLocked(true);
      await refreshFromServer();
      return;
    }
    if (response.status === 400) {
      // Aucun mot de passe configuré : on en demande un nouveau.
      setLockPrompt("set-password");
      return;
    }
    const data = await response.json().catch(() => null);
    window.alert(data?.message ?? "Impossible de verrouiller le registre.");
  }

  async function handleConfirmSetPassword() {
    setLockError(null);
    if (passwordInput.length < 4) {
      setLockError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }
    if (passwordInput !== passwordConfirm) {
      setLockError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLockBusy(true);
    try {
      const response = await fetch("/api/admin/registry/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lock", password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLockError(data.message ?? "Erreur lors du verrouillage.");
        return;
      }
      setLocked(true);
      setLockPrompt("none");
      setPasswordInput("");
      setPasswordConfirm("");
      await refreshFromServer();
    } finally {
      setLockBusy(false);
    }
  }

  async function handleConfirmUnlock() {
    setLockError(null);
    setLockBusy(true);
    try {
      const response = await fetch("/api/admin/registry/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock", password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLockError(data.message ?? "Mot de passe incorrect.");
        return;
      }
      setLocked(false);
      setLockPrompt("none");
      setPasswordInput("");
      await refreshFromServer();
    } finally {
      setLockBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Registre de cadeaux spéciaux</h2>
        <div className="flex items-center gap-2">
          {locked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLockPrompt("unlock");
                setLockError(null);
              }}
            >
              <Unlock className="h-4 w-4" /> Déverrouiller
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLockClick}>
              <Lock className="h-4 w-4" /> Verrouiller le registre
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
            <Plus className="h-4 w-4" /> Ajouter un cadeau
          </Button>
        </div>
      </div>

      {locked && (
        <p className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          🔒 Le statut des achats est masqué — tu peux toujours ajouter, modifier ou supprimer des
          cadeaux, mais tu ne vois pas ce qui a été offert. Entre le mot de passe pour déverrouiller.
        </p>
      )}

      {lockPrompt !== "none" && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold">
              {lockPrompt === "set-password"
                ? "Choisis un mot de passe pour pouvoir déverrouiller plus tard"
                : "Entre le mot de passe pour déverrouiller"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {lockPrompt === "set-password" && (
                <Input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              )}
            </div>
            {lockError && <p className="text-sm text-destructive">{lockError}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={lockBusy}
                onClick={
                  lockPrompt === "set-password" ? handleConfirmSetPassword : handleConfirmUnlock
                }
              >
                Confirmer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setLockPrompt("none");
                  setPasswordInput("");
                  setPasswordConfirm("");
                  setLockError(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Nom du cadeau *</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex : Poussette convertible"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Prix approximatif ($)</Label>
                <Input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem((f) => ({ ...f, price: e.target.value }))}
                  placeholder="350"
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
              <Gift className="h-8 w-8" />
              Aucun cadeau ajouté pour le moment.
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
                    placeholder="Nom"
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
                      <Badge variant={item.is_purchased ? "default" : "outline"}>
                        {item.is_purchased ? "Acheté" : "Disponible"}
                      </Badge>
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
