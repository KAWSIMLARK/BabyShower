import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/password";

type LockBody = { action: "lock" | "unlock"; password?: string };

export async function POST(request: Request) {
  let body: LockBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const supabase = createClient();
  const { data: row } = await supabase
    .from("registry_lock")
    .select("password_hash, password_salt")
    .eq("id", true)
    .maybeSingle();

  if (body.action === "lock") {
    // Aucun mot de passe encore configuré : on en crée un maintenant, requis
    // pour déverrouiller plus tard.
    if (!row?.password_hash) {
      if (!body.password || body.password.length < 4) {
        return NextResponse.json(
          { message: "Choisis un mot de passe d'au moins 4 caractères pour pouvoir déverrouiller plus tard." },
          { status: 400 },
        );
      }
      const { hash, salt } = hashPassword(body.password);
      const { error } = await supabase
        .from("registry_lock")
        .update({ is_locked: true, password_hash: hash, password_salt: salt })
        .eq("id", true);

      if (error) {
        console.error("Erreur lors de la création du mot de passe :", error);
        return NextResponse.json({ message: "Impossible de verrouiller le registre." }, { status: 500 });
      }
      return NextResponse.json({ locked: true });
    }

    const { error } = await supabase
      .from("registry_lock")
      .update({ is_locked: true })
      .eq("id", true);

    if (error) {
      console.error("Erreur lors du verrouillage :", error);
      return NextResponse.json({ message: "Impossible de verrouiller le registre." }, { status: 500 });
    }
    return NextResponse.json({ locked: true });
  }

  if (body.action === "unlock") {
    if (!row?.password_hash || !row?.password_salt) {
      return NextResponse.json({ message: "Aucun mot de passe configuré." }, { status: 400 });
    }
    if (!body.password || !verifyPassword(body.password, row.password_hash, row.password_salt)) {
      return NextResponse.json({ message: "Mot de passe incorrect." }, { status: 401 });
    }

    const { error } = await supabase
      .from("registry_lock")
      .update({ is_locked: false })
      .eq("id", true);

    if (error) {
      console.error("Erreur lors du déverrouillage :", error);
      return NextResponse.json({ message: "Impossible de déverrouiller le registre." }, { status: 500 });
    }
    return NextResponse.json({ locked: false });
  }

  return NextResponse.json({ message: "Action inconnue." }, { status: 400 });
}
