"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Sparkle, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Gender = "girl" | "boy" | null;
type Guesses = { girl: number; boy: number };

export function GenderRevealPanel({
  initialEnabled,
  initialGender,
  initialGuesses,
}: {
  initialEnabled: boolean;
  initialGender: Gender;
  initialGuesses: Guesses;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [gender, setGender] = useState<Gender>(initialGender);
  const [guesses, setGuesses] = useState<Guesses>(initialGuesses);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmGender, setConfirmGender] = useState<Gender>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalGuesses = guesses.girl + guesses.boy;
  const girlPercent = totalGuesses > 0 ? Math.round((guesses.girl / totalGuesses) * 100) : 0;
  const boyPercent = totalGuesses > 0 ? 100 - girlPercent : 0;

  async function resetGuesses() {
    setResetBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/gender-reveal/guesses", { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de réinitialiser les votes.");
        return;
      }
      setGuesses({ girl: 0, boy: 0 });
      setConfirmReset(false);
    } finally {
      setResetBusy(false);
    }
  }

  async function updateSettings(body: { game_enabled?: boolean; baby_gender?: Gender }) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/gender-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Une erreur est survenue.");
        return;
      }
      if (typeof data.game_enabled === "boolean") setEnabled(data.game_enabled);
      if (data.baby_gender === "girl" || data.baby_gender === "boy" || data.baby_gender === null) {
        setGender(data.baby_gender);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-primary" /> Mission Bébé Lafrenière (gender reveal)
            </h2>
            <p className="text-sm text-muted-foreground">
              Contrôle le jeu-mystère public qui révèle le sexe de bébé.
            </p>
          </div>
          <Badge variant={enabled ? "default" : "outline"}>
            {enabled ? "Jeu activé sur le site" : "Jeu désactivé"}
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Sexe configuré</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {gender === "girl" ? "Fille 💕" : gender === "boy" ? "Garçon 💙" : "Pas encore choisi"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={gender === "girl" ? "default" : "outline"}
                disabled={busy}
                onClick={() => setConfirmGender("girl")}
              >
                Fille
              </Button>
              <Button
                size="sm"
                variant={gender === "boy" ? "default" : "outline"}
                disabled={busy}
                onClick={() => setConfirmGender("boy")}
              >
                Garçon
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Visibilité publique</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Active le jeu seulement quand tu es prêt·e — les invité·es ne peuvent jamais
              obtenir la réponse avant, même en trichant.
            </p>
            <Button
              size="sm"
              className="mt-3"
              variant={enabled ? "outline" : "default"}
              disabled={busy || !gender}
              onClick={() => updateSettings({ game_enabled: !enabled })}
            >
              {enabled ? "Désactiver le jeu" : "Activer le jeu"}
            </Button>
            {!gender && (
              <p className="mt-2 text-xs text-muted-foreground">
                Choisis d&apos;abord le sexe ci-dessus avant d&apos;activer le jeu.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              Votes des invité·es ({totalGuesses} au total)
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              disabled={totalGuesses === 0}
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
            </Button>
          </div>
          {totalGuesses === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Personne n&apos;a encore voté « Team Fille / Team Garçon » dans le jeu.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Team Fille 💕</span>
                <span className="font-semibold">
                  {girlPercent}% ({guesses.girl})
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-pink-400" style={{ width: `${girlPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Team Garçon 💙</span>
                <span className="font-semibold">
                  {boyPercent}% ({guesses.boy})
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-sky-400" style={{ width: `${boyPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {confirmReset && (
          <Card className="border-destructive/30">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold">Réinitialiser tous les votes ?</p>
              <p className="text-sm text-muted-foreground">
                Utile pour effacer tes votes de test avant que les invité·es n&apos;y jouent.
                Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={resetBusy}
                  onClick={resetGuesses}
                >
                  Réinitialiser
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {confirmGender && (
          <Card className="border-primary/30">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold">
                Confirmer : le sexe de bébé est{" "}
                {confirmGender === "girl" ? "une fille" : "un garçon"} ?
              </p>
              <p className="text-sm text-muted-foreground">
                Cette information est sensible — vérifie bien avant de confirmer.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={async () => {
                    await updateSettings({ baby_gender: confirmGender });
                    setConfirmGender(null);
                  }}
                >
                  Confirmer
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmGender(null)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button asChild size="sm" variant="outline">
            <Link href="/jeux">Tester le jeu (les 3 missions)</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" disabled={!gender}>
            <Link href={gender ? "/jeux?apercu=reveal" : "#"} aria-disabled={!gender}>
              <Sparkle className="h-4 w-4" /> Voir l&apos;animation de révélation
            </Link>
          </Button>
        </div>
        {!gender && (
          <p className="text-xs text-muted-foreground">
            Choisis d&apos;abord le sexe ci-dessus pour pouvoir prévisualiser l&apos;animation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
