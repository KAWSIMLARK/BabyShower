import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type GuessBody = { guess?: "girl" | "boy" };

// Vote anonyme "Team Fille / Team Garçon" posé juste avant la révélation —
// aucune donnée personnelle, uniquement le choix, pour un décompte affiché
// dans /admin.
export async function POST(request: Request) {
  let body: GuessBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  if (body.guess !== "girl" && body.guess !== "boy") {
    return NextResponse.json({ message: "Choix invalide." }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("gender_reveal_guesses").insert({ guess: body.guess });

  if (error) {
    console.error("Erreur lors de l'enregistrement du vote :", error);
    return NextResponse.json({ message: "Impossible d'enregistrer le vote." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
