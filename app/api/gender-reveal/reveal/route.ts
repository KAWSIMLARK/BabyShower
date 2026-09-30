import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Révèle le sexe UNIQUEMENT si le jeu est activé par l'administrateur — même
// en appelant cette route directement (sans avoir fini les 3 mini-jeux), il
// est impossible d'obtenir une réponse avant que le jeu soit activé, et le
// sexe n'apparaît jamais dans le HTML ni le bundle JS initial.
export async function POST() {
  const supabase = createClient();

  const { data: enabled, error: statusError } = await supabase.rpc("get_gender_reveal_enabled");

  if (statusError) {
    console.error("Erreur lors de la vérification du statut du jeu :", statusError);
    return NextResponse.json({ message: "Impossible de vérifier le statut du jeu." }, { status: 500 });
  }

  if (!enabled) {
    return NextResponse.json({ message: "Le jeu n'est pas encore activé." }, { status: 403 });
  }

  const { data: gender, error: revealError } = await supabase.rpc("reveal_baby_gender");

  if (revealError) {
    console.error("Erreur lors de la révélation :", revealError);
    return NextResponse.json({ message: "Impossible de révéler le secret." }, { status: 500 });
  }

  if (gender !== "girl" && gender !== "boy") {
    return NextResponse.json({ gender: null });
  }

  return NextResponse.json({ gender });
}
