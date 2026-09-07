import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Liste publique des cadeaux encore disponibles (les cadeaux achetés disparaissent)
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("gift_items")
    .select("id, name, description, price, link_url")
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
