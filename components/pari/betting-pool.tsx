"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, FlaskConical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface BetRow {
  id: string;
  bettor_name: string;
  amount: number;
  choice: "girl" | "boy";
  created_at: string;
}

function formatMoney(value: number) {
  return value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

export function BettingPool({
  initialBets,
  closed,
  bettingEnabled,
  bettingDeadline,
  deadlinePassed,
  isAdminViewer,
  winningGender,
}: {
  initialBets: BetRow[];
  closed: boolean;
  bettingEnabled: boolean;
  bettingDeadline: string | null;
  deadlinePassed: boolean;
  isAdminViewer: boolean;
  winningGender: "girl" | "boy" | null;
}) {
  const router = useRouter();
  const notYetOpen = !closed && !bettingEnabled;
  const canBet = !closed && !deadlinePassed && (bettingEnabled || isAdminViewer);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState<"girl" | "boy" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { poolGirl, poolBoy, total, oddsGirl, oddsBoy } = useMemo(() => {
    const poolGirl = initialBets
      .filter((b) => b.choice === "girl")
      .reduce((sum, b) => sum + Number(b.amount), 0);
    const poolBoy = initialBets
      .filter((b) => b.choice === "boy")
      .reduce((sum, b) => sum + Number(b.amount), 0);
    const total = poolGirl + poolBoy;
    return {
      poolGirl,
      poolBoy,
      total,
      oddsGirl: poolGirl > 0 ? total / poolGirl : null,
      oddsBoy: poolBoy > 0 ? total / poolBoy : null,
    };
  }, [initialBets]);

  const winningPool = winningGender === "girl" ? poolGirl : winningGender === "boy" ? poolBoy : 0;
  const nobodyWon = closed && winningGender !== null && winningPool === 0;

  const estimatedReturn = useMemo(() => {
    const amountNumber = Number(amount);
    if (!choice || !Number.isFinite(amountNumber) || amountNumber <= 0) return null;
    const currentPoolForChoice = choice === "girl" ? poolGirl : poolBoy;
    const newPoolForChoice = currentPoolForChoice + amountNumber;
    const newTotal = total + amountNumber;
    const estimatedOdds = newTotal / newPoolForChoice;
    return { odds: estimatedOdds, payout: amountNumber * estimatedOdds };
  }, [amount, choice, poolGirl, poolBoy, total]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNumber = Number(amount);
    if (name.trim().length < 2) {
      setError("Entre ton nom.");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Entre un montant valide.");
      return;
    }
    if (!choice) {
      setError("Choisis fille ou garçon.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bettor_name: name.trim(), amount: amountNumber, choice }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message ?? "Impossible de placer ce pari.");
        return;
      }
      setName("");
      setAmount("");
      setChoice(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        {notYetOpen && (
          <Badge variant="outline" className="gap-1">
            <FlaskConical className="h-3 w-3" /> MODE TEST
          </Badge>
        )}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Pari amical : fille ou garçon ?
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Aucun paiement en ligne : envoyez votre mise par virement Interac à{" "}
          <span className="font-medium text-foreground">lafreniere.karl10@gmail.com</span>. Plus
          les mises s&apos;accumulent d&apos;un côté, plus la cote de l&apos;autre côté grimpe. À
          la révélation, les gagnant·es récupèrent leur mise, plus leur part du pot des
          perdant·es.
        </p>
        {bettingDeadline && !closed && (
          <p
            className={`mx-auto inline-block rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${
              deadlinePassed
                ? "border-border bg-secondary/50 text-muted-foreground"
                : "border-primary bg-primary/15 text-primary"
            }`}
          >
            {deadlinePassed ? "Mises fermées depuis le " : "Mises acceptées jusqu'au "}
            {new Date(bettingDeadline).toLocaleString("fr-CA", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OddsCard
          label="Team Fille 💕"
          odds={oddsGirl}
          highlight={winningGender === "girl"}
        />
        <OddsCard
          label="Team Garçon 💙"
          odds={oddsBoy}
          highlight={winningGender === "boy"}
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Pot total : <span className="font-semibold text-foreground">{formatMoney(total)}</span>
      </p>

      {closed ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-2 p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            {winningGender ? (
              <>
                <p className="font-display text-xl font-semibold">
                  C&apos;est {winningGender === "girl" ? "une fille" : "un garçon"} ! Les mises
                  sont fermées.
                </p>
                {nobodyWon && (
                  <p className="text-sm text-muted-foreground">
                    Personne n&apos;a parié sur le bon sexe cette fois — désolé !
                  </p>
                )}
              </>
            ) : (
              <p className="font-display text-xl font-semibold">
                Les mises sont fermées — le résultat s&apos;en vient !
              </p>
            )}
          </CardContent>
        </Card>
      ) : deadlinePassed ? (
        <Card className="bg-secondary/40">
          <CardContent className="space-y-1 p-6 text-center">
            <p className="font-display text-xl font-semibold">Les mises sont fermées</p>
            <p className="text-sm text-muted-foreground">
              La date limite pour parier est passée — le résultat s&apos;en vient !
            </p>
          </CardContent>
        </Card>
      ) : !canBet ? (
        <Card className="bg-secondary/40">
          <CardContent className="space-y-1 p-6 text-center">
            <p className="font-display text-xl font-semibold">Pas encore ouvert</p>
            <p className="text-sm text-muted-foreground">
              Le pari n&apos;est pas encore accessible aux invité·es — revenez un peu plus
              tard !
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">Placer une mise</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Ton nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Montant ($)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={choice === "girl" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChoice("girl")}
                >
                  Fille 💕
                </Button>
                <Button
                  type="button"
                  variant={choice === "boy" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setChoice("boy")}
                >
                  Garçon 💙
                </Button>
              </div>
              {estimatedReturn && (
                <p className="rounded-lg bg-secondary/50 p-3 text-center text-sm">
                  Si {choice === "girl" ? "Fille" : "Garçon"} gagne (cote estimée à{" "}
                  <span className="font-semibold">{estimatedReturn.odds.toFixed(2)}x</span>), tu
                  recevrais environ{" "}
                  <span className="font-semibold text-primary">
                    {formatMoney(estimatedReturn.payout)}
                  </span>{" "}
                  (mise incluse).
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Envoi..." : "Placer ma mise"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OddsCard({
  label,
  odds,
  highlight,
}: {
  label: string;
  odds: number | null;
  highlight: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary ring-2 ring-primary/30" : undefined}>
      <CardContent className="space-y-1 p-5 text-center">
        <p className="font-semibold">{label}</p>
        <p className="text-2xl font-bold text-primary">{odds ? `${odds.toFixed(2)}x` : "—"}</p>
      </CardContent>
    </Card>
  );
}
