import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Permet à l'administrateur de corriger manuellement une présence, ou de
// retirer uniquement le message pour bébé (sans supprimer tout le RSVP).
// (protégé par le middleware, voir lib/supabase/middleware.ts)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: { willAttend?: boolean; clearMessage?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (body.willAttend !== undefined) {
    if (typeof body.willAttend !== "boolean") {
      return NextResponse.json(
        { message: "Le champ willAttend (booléen) est requis." },
        { status: 400 },
      );
    }
    update.will_attend = body.willAttend;
  }

  if (body.clearMessage) {
    update.message_for_baby = null;
    update.allow_public_message = false;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "Aucune modification fournie." }, { status: 400 });
  }

  const supabase = createClient();

  const { error } = await supabase.from("rsvp_responses").update(update).eq("id", params.id);

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
