"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  winningGender,
}: {
  initialBets: BetRow[];
  closed: boolean;
  winningGender: "girl" | "boy" | null;
}) {
  const router = useRouter();
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
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Pari amical : fille ou garçon ?
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Aucun argent ne transite par ce site — payez votre mise en personne ou par
          Interac. Plus les mises s&apos;accumulent d&apos;un côté, plus la cote de
          l&apos;autre côté grimpe. À la révélation, les gagnant·es récupèrent leur mise,
          plus leur part du pot des perdant·es.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OddsCard
          label="Team Fille 💕"
          pool={poolGirl}
          odds={oddsGirl}
          highlight={winningGender === "girl"}
        />
        <OddsCard
          label="Team Garçon 💙"
          pool={poolBoy}
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Envoi..." : "Placer ma mise"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <TrendingUp className="h-5 w-5 text-primary" /> Mises placées ({initialBets.length})
        </h2>
        {initialBets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Personne n&apos;a encore parié.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Nom</th>
                  <th className="p-3">Mise</th>
                  <th className="p-3">Choix</th>
                  {closed && winningGender && <th className="p-3">Résultat</th>}
                </tr>
              </thead>
              <tbody>
                {initialBets.map((bet) => {
                  const won = closed && winningGender === bet.choice;
                  const payout =
                    won && winningPool > 0 ? (Number(bet.amount) * total) / winningPool : null;
                  return (
                    <tr key={bet.id} className="border-t">
                      <td className="p-3">{bet.bettor_name}</td>
                      <td className="p-3">{formatMoney(Number(bet.amount))}</td>
                      <td className="p-3">{bet.choice === "girl" ? "Fille 💕" : "Garçon 💙"}</td>
                      {closed && winningGender && (
                        <td className="p-3">
                          {won ? (
                            <span className="font-semibold text-primary">
                              Gagné · {payout ? formatMoney(payout) : formatMoney(Number(bet.amount))}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Perdu</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OddsCard({
  label,
  pool,
  odds,
  highlight,
}: {
  label: string;
  pool: number;
  odds: number | null;
  highlight: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary ring-2 ring-primary/30" : undefined}>
      <CardContent className="space-y-1 p-5 text-center">
        <p className="font-semibold">{label}</p>
        <p className="text-2xl font-bold text-primary">{odds ? `${odds.toFixed(2)}x` : "—"}</p>
        <p className="text-xs text-muted-foreground">Total misé : {formatMoney(pool)}</p>
      </CardContent>
    </Card>
  );
}
