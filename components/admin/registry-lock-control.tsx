"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Cadenas partagé entre le registre de cadeaux ET les idées de livres : un
// seul mot de passe, un seul état, pour ne jamais laisser deux contrôles
// indépendants se désynchroniser sur la même donnée côté serveur.
export function RegistryLockControl({
  locked,
  onLockedChange,
}: {
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
}) {
  const [lockPrompt, setLockPrompt] = useState<"none" | "set-password" | "unlock">("none");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockBusy, setLockBusy] = useState(false);

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
      onLockedChange(true);
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
      onLockedChange(true);
      setLockPrompt("none");
      setPasswordInput("");
      setPasswordConfirm("");
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
      onLockedChange(false);
      setLockPrompt("none");
      setPasswordInput("");
    } finally {
      setLockBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">
            Registres publics (cadeaux et livres)
          </h2>
          <p className="text-sm text-muted-foreground">
            Un seul cadenas protège les deux listes ci-dessous.
          </p>
        </div>
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
            <Lock className="h-4 w-4" /> Verrouiller les registres
          </Button>
        )}
      </div>

      {locked && (
        <p className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          🔒 Le statut des achats est masqué dans les deux listes — tu peux toujours ajouter,
          modifier ou supprimer des articles, mais tu ne vois pas ce qui a été offert. Entre le
          mot de passe pour déverrouiller.
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
    </div>
  );
}
