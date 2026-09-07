import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Protégée par le middleware (lib/supabase/middleware.ts) : seuls les
// utilisateurs authentifiés et présents dans ADMIN_EMAILS atteignent ce code.
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur de lecture des RSVP :", error);
    return NextResponse.json(
      { message: "Impossible de récupérer les réponses." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}
