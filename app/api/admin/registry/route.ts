import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Protégée par le middleware : seul l'administrateur authentifié atteint ce code.
export async function GET() {
  const supabase = createClient();

  const [{ data: lockRow }, { data: items, error }] = await Promise.all([
    supabase.from("registry_lock").select("is_locked").eq("id", true).maybeSingle(),
    supabase
      .from("gift_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (error) {
    console.error("Erreur de lecture du registre (admin) :", error);
    return NextResponse.json({ message: "Impossible de charger le registre." }, { status: 500 });
  }

  const isLocked = lockRow?.is_locked ?? false;

  // Quand le registre est verrouillé, on masque le statut d'achat AVANT même
  // qu'il ne quitte le serveur : impossible pour l'admin de le voir, même en
  // inspectant la réponse réseau du navigateur.
  const data = isLocked
    ? (items ?? []).map((item) => ({ ...item, is_purchased: false, purchased_at: null }))
    : (items ?? []);

  return NextResponse.json({ data, locked: isLocked });
}

export async function POST(request: Request) {
  let body: { name?: string; description?: string; price?: number | null; linkUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ message: "Le nom du cadeau est requis." }, { status: 400 });
  }

  if (body.price != null && (!Number.isFinite(body.price) || body.price < 0)) {
    return NextResponse.json({ message: "Le prix doit être un nombre positif." }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("gift_items").insert({
    name,
    description: body.description?.trim() || null,
    price: body.price ?? null,
    link_url: body.linkUrl?.trim() || null,
  });

  if (error) {
    console.error("Erreur lors de l'ajout du cadeau :", error);
    return NextResponse.json({ message: "Impossible d'ajouter ce cadeau." }, { status: 500 });
  }

  return NextResponse.json({ message: "Cadeau ajouté." }, { status: 201 });
}
