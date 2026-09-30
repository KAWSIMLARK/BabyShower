import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Route protégée par middleware.ts (/api/admin/*).
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("gender_reveal_guesses").select("guess");

  if (error) {
    console.error("Erreur lors de la lecture des votes :", error);
    return NextResponse.json({ message: "Impossible de lire les votes." }, { status: 500 });
  }

  const counts = (data ?? []).reduce(
    (acc, row) => {
      if (row.guess === "girl") acc.girl += 1;
      else if (row.guess === "boy") acc.boy += 1;
      return acc;
    },
    { girl: 0, boy: 0 }
  );

  return NextResponse.json(counts);
}

// Réinitialise les votes (utile pour effacer les votes de test avant la fête).
export async function DELETE() {
  const supabase = createClient();
  const { error } = await supabase
    .from("gender_reveal_guesses")
    .delete()
    .gte("created_at", "1970-01-01");

  if (error) {
    console.error("Erreur lors de la réinitialisation des votes :", error);
    return NextResponse.json({ message: "Impossible de réinitialiser les votes." }, { status: 500 });
  }

  return NextResponse.json({ girl: 0, boy: 0 });
}
