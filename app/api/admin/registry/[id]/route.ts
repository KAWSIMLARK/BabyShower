import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: {
    name?: string;
    description?: string;
    price?: number | null;
    linkUrl?: string;
    isPurchased?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  if (body.price != null && (!Number.isFinite(body.price) || body.price < 0)) {
    return NextResponse.json({ message: "Le prix doit être un nombre positif." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const trimmedName = body.name.trim();
    if (!trimmedName) {
      return NextResponse.json({ message: "Le nom du cadeau est requis." }, { status: 400 });
    }
    update.name = trimmedName;
  }
  if (body.description !== undefined) update.description = body.description?.trim() || null;
  if (body.price !== undefined) update.price = body.price;
  if (body.linkUrl !== undefined) update.link_url = body.linkUrl?.trim() || null;
  if (body.isPurchased !== undefined) {
    // Permet à l'admin de remettre un cadeau en ligne s'il a été coché par
    // erreur, sans devoir le supprimer et le recréer.
    update.is_purchased = body.isPurchased;
    update.purchased_at = body.isPurchased ? new Date().toISOString() : null;
  }

  const supabase = createClient();
  // .select("id") permet de détecter une écriture RLS silencieusement
  // bloquée (0 ligne touchée mais aucune erreur) plutôt que de rapporter un
  // faux succès.
  const { data, error } = await supabase
    .from("gift_items")
    .update(update)
    .eq("id", params.id)
    .select("id");

  if (error) {
    console.error("Erreur lors de la modification du cadeau :", error);
    return NextResponse.json({ message: "Impossible de modifier ce cadeau." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "Ce cadeau est introuvable ou l'action n'a pas été autorisée." },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Cadeau mis à jour." });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gift_items")
    .delete()
    .eq("id", params.id)
    .select("id");

  if (error) {
    console.error("Erreur lors de la suppression du cadeau :", error);
    return NextResponse.json({ message: "Impossible de supprimer ce cadeau." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "Ce cadeau est introuvable ou la suppression n'a pas été autorisée." },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Cadeau supprimé." });
}
