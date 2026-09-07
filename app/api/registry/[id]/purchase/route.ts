import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Permet à n'importe quel visiteur de marquer un cadeau comme acheté.
// Passe par la fonction Postgres mark_gift_purchased (security definer) :
// impossible de modifier le nom, le prix ou le lien via cette route.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ message: "Identifiant de cadeau invalide." }, { status: 400 });
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("mark_gift_purchased", { p_id: params.id });

  if (error) {
    console.error("Erreur lors du marquage du cadeau :", error);
    return NextResponse.json(
      { message: "Impossible de marquer ce cadeau comme acheté. Veuillez réessayer." },
      { status: 500 },
    );
  }

  // data === false : soit le cadeau n'existe pas, soit quelqu'un d'autre
  // vient de le réserver juste avant. Dans les deux cas, on ne doit surtout
  // pas confirmer un succès qui n'a pas eu lieu.
  if (!data) {
    return NextResponse.json(
      { message: "Ce cadeau vient d'être réservé par quelqu'un d'autre. Merci de choisir un autre cadeau !" },
      { status: 409 },
    );
  }

  return NextResponse.json({ message: "Merci ! Ce cadeau est maintenant réservé." });
}
