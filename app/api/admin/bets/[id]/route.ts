import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Route protégée par middleware.ts (/api/admin/*).
// Accepte/refuse une mise selon que le virement/paiement a bien été reçu —
// seules les mises "accepted" comptent dans le calcul de la cote.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ message: "Identifiant invalide." }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  if (body.status !== "accepted" && body.status !== "rejected" && body.status !== "pending") {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("gender_bets")
    .update({ status: body.status })
    .eq("id", params.id)
    .select("id, status");

  if (error) {
    console.error("Erreur lors de la mise à jour du statut du pari :", error);
    return NextResponse.json({ message: "Impossible de mettre à jour ce pari." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Pari introuvable." }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ message: "Identifiant invalide." }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("gender_bets")
    .delete()
    .eq("id", params.id)
    .select("id");

  if (error) {
    console.error("Erreur lors de la suppression du pari :", error);
    return NextResponse.json({ message: "Impossible de supprimer ce pari." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Pari introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
