import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Réinitialise tous les paris (utile pour effacer les mises de test avant
// d'ouvrir le pari aux invité·es).
export async function DELETE() {
  const supabase = createClient();
  const { error } = await supabase.from("gender_bets").delete().gte("created_at", "1970-01-01");

  if (error) {
    console.error("Erreur lors de la réinitialisation des paris :", error);
    return NextResponse.json({ message: "Impossible de réinitialiser les paris." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
