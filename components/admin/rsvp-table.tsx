"use client";

import { useMemo, useState } from "react";
import { Download, Users, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type RsvpRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  guest_count: number;
  will_attend: boolean;
  message_for_baby: string | null;
  dietary_restrictions: string | null;
  allow_public_message: boolean;
};

function toCsv(rows: RsvpRow[]) {
  const headers = [
    "Nom complet",
    "Courriel",
    "Nombre de personnes",
    "Présence confirmée",
    "Message pour bébé",
    "Allergies / restrictions",
    "Message public autorisé",
    "Date de soumission",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const lines = rows.map((row) =>
    [
      row.full_name,
      row.email,
      String(row.guest_count),
      row.will_attend ? "Oui" : "Non",
      row.message_for_baby ?? "",
      row.dietary_restrictions ?? "",
      row.allow_public_message ? "Oui" : "Non",
      new Date(row.created_at).toLocaleString("fr-CA"),
    ]
      .map((v) => escape(String(v)))
      .join(","),
  );

  return [headers.map(escape).join(","), ...lines].join("\n");
}

export function AdminRsvpTable({ initialData }: { initialData: RsvpRow[] }) {
  const [rows, setRows] = useState<RsvpRow[]>(initialData);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const confirmed = rows.filter((r) => r.will_attend);
    const declined = rows.filter((r) => !r.will_attend);
    const totalGuests = confirmed.reduce((sum, r) => sum + r.guest_count, 0);
    return {
      confirmedCount: confirmed.length,
      declinedCount: declined.length,
      totalGuests,
    };
  }, [rows]);

  function handleExportCsv() {
    const csv = toCsv(rows);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-baby-shower-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function toggleAttendance(row: RsvpRow) {
    setUpdatingId(row.id);
    const nextValue = !row.will_attend;
    try {
      const response = await fetch(`/api/admin/rsvp/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ willAttend: nextValue }),
      });
      if (response.ok) {
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, will_attend: nextValue } : r)),
        );
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? "Impossible de mettre à jour cette présence.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(row: RsvpRow) {
    const confirmed = window.confirm(
      `Supprimer la réponse de ${row.full_name} ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      const response = await fetch(`/api/admin/rsvp/${row.id}`, { method: "DELETE" });
      if (response.ok) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
      } else {
        const data = await response.json().catch(() => null);
        window.alert(data?.message ?? "Impossible de supprimer cette réponse.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Présences confirmées
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.confirmedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refus</CardTitle>
            <XCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.declinedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total d&apos;invités attendus
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalGuests}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Toutes les réponses ({rows.length})</h2>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={rows.length === 0}>
          <Download className="h-4 w-4" /> Exporter en CSV
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Courriel</th>
                <th className="px-4 py-3">Personnes</th>
                <th className="px-4 py-3">Présence</th>
                <th className="px-4 py-3">Allergies</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Reçu le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3 font-medium">{row.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3">{row.guest_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAttendance(row)}
                      disabled={updatingId === row.id}
                      title="Cliquer pour corriger manuellement"
                    >
                      <Badge variant={row.will_attend ? "default" : "destructive"}>
                        {row.will_attend ? "Confirmé" : "Absent"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.dietary_restrictions || "—"}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    {row.message_for_baby || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("fr-CA")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                      title="Supprimer cette réponse"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Aucune réponse pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
