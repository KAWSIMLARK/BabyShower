"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, Trash2, RotateCcw, Check, X, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Convertit un ISO (UTC) en valeur locale pour <input type="datetime-local">.
function isoToLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type BetStatus = "pending" | "accepted" | "rejected";

export interface AdminBetRow {
  id: string;
  bettor_name: string;
  amount: number;
  choice: "girl" | "boy";
  status: BetStatus;
  created_at: string;
}

function formatMoney(value: number) {
  return value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

function statusLabel(status: BetStatus) {
  if (status === "accepted") return "Accepté";
  if (status === "rejected") return "Refusé";
  return "En attente";
}

export function BettingAdminPanel({
  initialBets,
  initialBettingEnabled,
  initialBettingDeadline,
}: {
  initialBets: AdminBetRow[];
  initialBettingEnabled: boolean;
  initialBettingDeadline: string | null;
}) {
  const [bets, setBets] = useState(initialBets);
  const [bettingEnabled, setBettingEnabled] = useState(initialBettingEnabled);
  const [bettingDeadline, setBettingDeadline] = useState(initialBettingDeadline);
  const [deadlineInput, setDeadlineInput] = useState(() => isoToLocalInput(initialBettingDeadline));
  const [deadlineBusy, setDeadlineBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlinePassed = !!bettingDeadline && new Date(bettingDeadline) <= new Date();

  const { poolGirl, poolBoy, total, pendingTotal, pendingCount } = useMemo(() => {
    const accepted = bets.filter((b) => b.status === "accepted");
    const poolGirl = accepted.filter((b) => b.choice === "girl").reduce((s, b) => s + Number(b.amount), 0);
    const poolBoy = accepted.filter((b) => b.choice === "boy").reduce((s, b) => s + Number(b.amount), 0);
    const pending = bets.filter((b) => b.status === "pending");
    return {
      poolGirl,
      poolBoy,
      total: poolGirl + poolBoy,
      pendingTotal: pending.reduce((s, b) => s + Number(b.amount), 0),
      pendingCount: pending.length,
    };
  }, [bets]);

  // Montant à transférer à cette personne SI son côté gagne, selon la cote
  // actuelle (mise + part du pot des perdant·es). Pour une mise encore "en
  // attente", calculé comme si elle était acceptée dès maintenant — donc une
  // estimation qui peut encore bouger tant que d'autres mises sont traitées.
  function payoutIfWins(bet: AdminBetRow): number | null {
    if (bet.status === "rejected") return null;
    const amount = Number(bet.amount);
    const currentPoolForChoice = bet.choice === "girl" ? poolGirl : poolBoy;

    if (bet.status === "accepted") {
      return currentPoolForChoice > 0 ? (amount * total) / currentPoolForChoice : amount;
    }

    const newPoolForChoice = currentPoolForChoice + amount;
    const newTotal = total + amount;
    return (amount * newTotal) / newPoolForChoice;
  }

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

  async function saveDeadline() {
    setDeadlineBusy(true);
    setError(null);
    try {
      const iso = deadlineInput ? new Date(deadlineInput).toISOString() : null;
      const response = await fetch("/api/admin/gender-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betting_deadline: iso }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible d'enregistrer la date limite.");
        return;
      }
      setBettingDeadline(data.betting_deadline ?? null);
      setDeadlineInput(isoToLocalInput(data.betting_deadline ?? null));
    } finally {
      setDeadlineBusy(false);
    }
  }

  async function clearDeadline() {
    setDeadlineInput("");
    setDeadlineBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/gender-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betting_deadline: null }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de retirer la date limite.");
        return;
      }
      setBettingDeadline(null);
    } finally {
      setDeadlineBusy(false);
    }
  }

  async function handleStatusChange(id: string, status: BetStatus) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de mettre à jour ce pari.");
        return;
      }
      setBets((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } finally {
      setBusyId(null);
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
              Accepte une mise une fois le virement/paiement reçu — seules les mises acceptées
              comptent dans la cote.
            </p>
          </div>
          <Badge variant={bettingEnabled && !deadlinePassed ? "default" : "outline"}>
            {deadlinePassed ? "Date limite dépassée" : bettingEnabled ? "Ouvert aux invité·es" : "Mode test"}
          </Badge>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm font-semibold">Date et heure limites</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Passé ce moment, les nouvelles mises sont automatiquement refusées — aucune action
            manuelle requise. Laisse vide pour n&apos;avoir aucune date limite.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Input
              type="datetime-local"
              className="w-auto"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
            />
            <Button size="sm" disabled={deadlineBusy} onClick={saveDeadline}>
              <Clock className="h-3.5 w-3.5" /> Enregistrer
            </Button>
            {bettingDeadline && (
              <Button size="sm" variant="ghost" disabled={deadlineBusy} onClick={clearDeadline}>
                Retirer la date limite
              </Button>
            )}
          </div>
          {bettingDeadline && (
            <p className="mt-2 text-xs text-muted-foreground">
              {deadlinePassed ? "Dépassée depuis le " : "Mises acceptées jusqu'au "}
              {new Date(bettingDeadline).toLocaleString("fr-CA", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          )}
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
            Pot accepté : <span className="font-semibold">{formatMoney(total)}</span>{" "}
            <span className="text-muted-foreground">
              (Fille {formatMoney(poolGirl)} · Garçon {formatMoney(poolBoy)})
            </span>
            {pendingCount > 0 && (
              <span className="ml-2 text-muted-foreground">
                · {pendingCount} en attente ({formatMoney(pendingTotal)})
              </span>
            )}
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
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Mise</th>
                  <th className="p-3">Choix</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Si gagnant·e</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const payout = payoutIfWins(bet);
                  return (
                  <tr key={bet.id} className="border-t">
                    <td className="p-3">{bet.bettor_name}</td>
                    <td className="p-3">{formatMoney(Number(bet.amount))}</td>
                    <td className="p-3">{bet.choice === "girl" ? "Fille 💕" : "Garçon 💙"}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          bet.status === "accepted"
                            ? "default"
                            : bet.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {statusLabel(bet.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {payout === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="font-semibold text-primary">
                          {formatMoney(payout)}
                          {bet.status === "pending" && (
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              (estimé)
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary/10"
                          disabled={busyId === bet.id || bet.status === "accepted"}
                          onClick={() => handleStatusChange(bet.id, "accepted")}
                          title="Accepter (virement reçu)"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={busyId === bet.id || bet.status === "rejected"}
                          onClick={() => handleStatusChange(bet.id, "rejected")}
                          title="Refuser (virement non reçu)"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:bg-destructive/10"
                          disabled={busyId === bet.id}
                          onClick={() => handleDelete(bet.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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
