import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Route protégée par middleware.ts (/api/admin/*).
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
