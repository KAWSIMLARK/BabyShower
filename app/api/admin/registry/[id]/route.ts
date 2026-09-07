import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: { name?: string; description?: string; price?: number | null; linkUrl?: string };
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

  const supabase = createClient();
  const { error } = await supabase.from("gift_items").update(update).eq("id", params.id);

  if (error) {
    console.error("Erreur lors de la modification du cadeau :", error);
    return NextResponse.json({ message: "Impossible de modifier ce cadeau." }, { status: 500 });
  }

  return NextResponse.json({ message: "Cadeau mis à jour." });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from("gift_items").delete().eq("id", params.id);

  if (error) {
    console.error("Erreur lors de la suppression du cadeau :", error);
    return NextResponse.json({ message: "Impossible de supprimer ce cadeau." }, { status: 500 });
  }

  return NextResponse.json({ message: "Cadeau supprimé." });
}
