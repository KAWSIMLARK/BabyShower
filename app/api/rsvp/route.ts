import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rsvpSchema } from "@/lib/validations/rsvp";

export const dynamic = "force-dynamic";

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

  const { fullName, email, willAttend, guestCount, messageForBaby, dietaryRestrictions, allowPublicMessage } =
    parsed.data;

  const supabase = createClient();

  // Le nombre de personnes et les allergies n'ont de sens que si on assiste :
  // on les ignore côté serveur en cas de refus, peu importe ce que le
  // formulaire a envoyé (défense en profondeur, pas seulement côté client).
  const { error } = await supabase.from("rsvp_responses").insert({
    full_name: fullName,
    email,
    guest_count: willAttend ? guestCount! : 0,
    will_attend: willAttend,
    message_for_baby: messageForBaby || null,
    dietary_restrictions: willAttend ? dietaryRestrictions || null : null,
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
