"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminBetRow {
  id: string;
  bettor_name: string;
  amount: number;
  choice: "girl" | "boy";
  created_at: string;
}

function formatMoney(value: number) {
  return value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

export function BettingAdminPanel({
  initialBets,
  initialBettingEnabled,
}: {
  initialBets: AdminBetRow[];
  initialBettingEnabled: boolean;
}) {
  const [bets, setBets] = useState(initialBets);
  const [bettingEnabled, setBettingEnabled] = useState(initialBettingEnabled);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { poolGirl, poolBoy, total } = useMemo(() => {
    const poolGirl = bets.filter((b) => b.choice === "girl").reduce((s, b) => s + Number(b.amount), 0);
    const poolBoy = bets.filter((b) => b.choice === "boy").reduce((s, b) => s + Number(b.amount), 0);
    return { poolGirl, poolBoy, total: poolGirl + poolBoy };
  }, [bets]);

  async function toggleBetting() {
    setToggleBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/gender-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betting_enabled: !bettingEnabled }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de changer l'état du pari.");
        return;
      }
      if (typeof data.betting_enabled === "boolean") setBettingEnabled(data.betting_enabled);
    } finally {
      setToggleBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bets/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de supprimer ce pari.");
        return;
      }
      setBets((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetAll() {
    setResetBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/bets", { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de réinitialiser les paris.");
        return;
      }
      setBets([]);
      setConfirmReset(false);
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" /> Pari amical sur le sexe
            </h2>
            <p className="text-sm text-muted-foreground">
              Aucun paiement réel ici — les mises sont réglées entre vous et les invité·es.
            </p>
          </div>
          <Badge variant={bettingEnabled ? "default" : "outline"}>
            {bettingEnabled ? "Ouvert aux invité·es" : "Mode test"}
          </Badge>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm font-semibold">Visibilité publique</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tant que c&apos;est en mode test, le bouton n&apos;apparaît pas sur la page
            d&apos;accueil et les invité·es qui tombent sur <code>/pari</code> voient un message
            « pas encore ouvert ». Tu peux quand même tester le formulaire toi-même — pense à
            réinitialiser les paris ci-dessous avant d&apos;ouvrir pour de vrai.
          </p>
          <Button
            size="sm"
            className="mt-3"
            variant={bettingEnabled ? "outline" : "default"}
            disabled={toggleBusy}
            onClick={toggleBetting}
          >
            {bettingEnabled ? "Repasser en mode test" : "Ouvrir le pari aux invité·es"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <p className="text-sm">
            Pot total : <span className="font-semibold">{formatMoney(total)}</span>{" "}
            <span className="text-muted-foreground">
              (Fille {formatMoney(poolGirl)} · Garçon {formatMoney(poolBoy)})
            </span>
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={bets.length === 0}
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser tous les paris
          </Button>
        </div>

        {confirmReset && (
          <Card className="border-destructive/30">
            <CardContent className="space-y-3 p-5">
              <p className="font-semibold">Supprimer tous les paris ?</p>
              <p className="text-sm text-muted-foreground">
                Utile pour effacer tes essais de test avant d&apos;ouvrir aux invité·es. Cette
                action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={resetBusy}
                  onClick={handleResetAll}
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

        {bets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune mise pour le moment.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Mise</th>
                  <th className="p-3">Choix</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id} className="border-t">
                    <td className="p-3">{bet.bettor_name}</td>
                    <td className="p-3">{formatMoney(Number(bet.amount))}</td>
                    <td className="p-3">{bet.choice === "girl" ? "Fille 💕" : "Garçon 💙"}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={busyId === bet.id}
                        onClick={() => handleDelete(bet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button asChild size="sm" variant="outline">
          <Link href="/pari">Voir la page /pari</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
