import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BetBody = { bettor_name?: string; amount?: number; choice?: "girl" | "boy" };

// Place une mise dans le pari amical (aucun paiement réel ici — voir schema.sql).
// La RLS de gender_bets refuse déjà toute insertion une fois la révélation
// activée ; ce contrôle applicatif sert seulement à donner un message clair.
export async function POST(request: Request) {
  let body: BetBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const name = body.bettor_name?.trim();
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);

  if (!name || name.length < 2) {
    return NextResponse.json({ message: "Entre ton nom." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: "Entre un montant valide." }, { status: 400 });
  }
  if (body.choice !== "girl" && body.choice !== "boy") {
    return NextResponse.json({ message: "Choisis fille ou garçon." }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("gender_bets")
    .insert({ bettor_name: name, amount: Math.round(amount * 100) / 100, choice: body.choice })
    .select("id");

  if (error) {
    console.error("Erreur lors de l'enregistrement du pari :", error);
    return NextResponse.json(
      { message: "Impossible de placer ce pari — les mises sont peut-être déjà fermées." },
      { status: 403 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "Les mises sont fermées : la révélation est déjà activée." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
