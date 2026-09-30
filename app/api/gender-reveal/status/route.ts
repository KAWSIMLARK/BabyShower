import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Statut public : indique uniquement si le jeu est activé, jamais le sexe.
// Passe par la fonction get_gender_reveal_enabled() (security definer) —
// un visiteur anonyme ne peut pas lire la table gender_reveal_settings.
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_gender_reveal_enabled");

  if (error) {
    console.error("Erreur lors de la lecture du statut du jeu :", error);
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ enabled: Boolean(data) });
}
