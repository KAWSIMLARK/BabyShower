"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function BettingAdminPanel({ initialBets }: { initialBets: AdminBetRow[] }) {
  const [bets, setBets] = useState(initialBets);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { poolGirl, poolBoy, total } = useMemo(() => {
    const poolGirl = bets.filter((b) => b.choice === "girl").reduce((s, b) => s + Number(b.amount), 0);
    const poolBoy = bets.filter((b) => b.choice === "boy").reduce((s, b) => s + Number(b.amount), 0);
    return { poolGirl, poolBoy, total: poolGirl + poolBoy };
  }, [bets]);

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
          <p className="text-sm">
            Pot total : <span className="font-semibold">{formatMoney(total)}</span>{" "}
            <span className="text-muted-foreground">
              (Fille {formatMoney(poolGirl)} · Garçon {formatMoney(poolBoy)})
            </span>
          </p>
        </div>

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
      </CardContent>
    </Card>
  );
}
