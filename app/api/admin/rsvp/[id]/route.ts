import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Permet à l'administrateur de corriger manuellement une présence
// (protégé par le middleware, voir lib/supabase/middleware.ts)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: { willAttend?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  if (typeof body.willAttend !== "boolean") {
    return NextResponse.json(
      { message: "Le champ willAttend (booléen) est requis." },
      { status: 400 },
    );
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ will_attend: body.willAttend })
    .eq("id", params.id);

  if (error) {
    console.error("Erreur de mise à jour du RSVP :", error);
    return NextResponse.json({ message: "Impossible de mettre à jour ce RSVP." }, { status: 500 });
  }

  return NextResponse.json({ message: "RSVP mis à jour." });
}

// Permet à l'administrateur de supprimer une réponse (ex. entrée de test ou en double)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const { error } = await supabase.from("rsvp_responses").delete().eq("id", params.id);

  if (error) {
    console.error("Erreur de suppression du RSVP :", error);
    return NextResponse.json({ message: "Impossible de supprimer ce RSVP." }, { status: 500 });
  }

  return NextResponse.json({ message: "RSVP supprimé." });
}
