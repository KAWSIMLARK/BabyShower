import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rsvpSchema } from "@/lib/validations/rsvp";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Requête invalide." },
      { status: 400 },
    );
  }

  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { message: firstIssue?.message ?? "Formulaire invalide.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { fullName, email, guestCount, messageForBaby, dietaryRestrictions, allowPublicMessage } =
    parsed.data;

  const supabase = createClient();

  // Le formulaire ne demande plus "serez-vous présent·e ?" : le remplir vaut
  // confirmation. L'administrateur peut toujours corriger manuellement une
  // présence depuis /admin si quelqu'un se désiste après coup.
  const { error } = await supabase.from("rsvp_responses").insert({
    full_name: fullName,
    email,
    guest_count: guestCount,
    will_attend: true,
    message_for_baby: messageForBaby || null,
    dietary_restrictions: dietaryRestrictions || null,
    allow_public_message: allowPublicMessage ?? false,
  });

  if (error) {
    console.error("Erreur d'insertion RSVP :", error);
    return NextResponse.json(
      { message: "Impossible d'enregistrer votre réponse pour le moment. Veuillez réessayer." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "RSVP enregistré avec succès." }, { status: 201 });
}
