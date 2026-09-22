import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Liste publique des cadeaux (ou livres) encore disponibles (retirés une
// fois achetés). ?category=livre pour la liste d'idées de livres.
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") === "livre" ? "livre" : "cadeau";
  const supabase = createClient();

  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, description, price, link_url")
    .eq("category", category)
    .eq("is_purchased", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur de lecture du registre :", error);
    return NextResponse.json(
      { message: "Impossible de charger le registre de cadeaux." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}
