import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Route protégée par middleware.ts (/api/admin/*) : réservée aux comptes
// authentifiés figurant dans ADMIN_EMAILS. Contrairement aux routes
// publiques, elle peut lire/écrire directement gender_reveal_settings.
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("gender_reveal_settings")
    .select("game_enabled, baby_gender, betting_enabled")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la lecture de la configuration du jeu :", error);
    return NextResponse.json({ message: "Impossible de lire la configuration du jeu." }, { status: 500 });
  }

  return NextResponse.json({
    game_enabled: data?.game_enabled ?? false,
    baby_gender: data?.baby_gender ?? null,
    betting_enabled: data?.betting_enabled ?? false,
  });
}

type UpdateBody = {
  game_enabled?: boolean;
  baby_gender?: "girl" | "boy" | null;
  betting_enabled?: boolean;
};

export async function POST(request: Request) {
  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const update: UpdateBody = {};
  if (typeof body.game_enabled === "boolean") update.game_enabled = body.game_enabled;
  if (body.baby_gender === "girl" || body.baby_gender === "boy" || body.baby_gender === null) {
    update.baby_gender = body.baby_gender;
  }
  if (typeof body.betting_enabled === "boolean") update.betting_enabled = body.betting_enabled;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "Aucun champ valide à mettre à jour." }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("gender_reveal_settings")
    .update(update)
    .eq("id", true)
    .select("game_enabled, baby_gender, betting_enabled");

  if (error) {
    console.error("Erreur lors de la mise à jour de la configuration du jeu :", error);
    return NextResponse.json({ message: "Impossible de mettre à jour la configuration." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Action non autorisée." }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}
