import { createClient } from "@/lib/supabase/server";
import { GameExperience } from "@/components/jeux/game-experience";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Route privée mais toujours accessible (pas de mot de passe) : permet de
// tester le jeu à tout moment, avant même que le bouton "Connaître le sexe"
// n'apparaisse sur la page d'accueil. Le sexe reste protégé côté serveur
// (voir /api/gender-reveal/reveal) peu importe l'état de ce flag.
export default async function JeuxPage({
  searchParams,
}: {
  searchParams: { apercu?: string };
}) {
  const supabase = createClient();
  const [{ data: enabled }, { data: userData }] = await Promise.all([
    supabase.rpc("get_gender_reveal_enabled"),
    supabase.auth.getUser(),
  ]);

  // Si c'est l'administrateur (même connecté sur le site en direct pour
  // tester) qui visite /jeux, on ne compte jamais son vote et on lui montre
  // toujours le badge de test — pour ne pas fausser les statistiques des
  // invité·es avec ses propres essais.
  const viewerEmail = userData?.user?.email?.toLowerCase();
  const isAdminViewer = !!viewerEmail && ADMIN_EMAILS.includes(viewerEmail);

  // Le sexe n'est demandé au serveur QUE pour l'admin (badge de test) — pour
  // n'importe qui d'autre, on ne l'interroge même pas, afin qu'il ne se
  // retrouve jamais dans le HTML/JSON envoyé au navigateur d'un·e invité·e.
  let testGender: "girl" | "boy" | null = null;
  if (isAdminViewer) {
    const { data: gender } = await supabase.rpc("reveal_baby_gender");
    if (gender === "girl" || gender === "boy") testGender = gender;
  }

  // Réservé à l'admin : ?apercu=reveal saute directement à l'animation finale
  // (avec confettis) pour la tester sans refaire les 3 missions, même avant
  // d'activer le jeu. Sans effet pour qui que ce soit d'autre.
  const startAtReveal = isAdminViewer && searchParams.apercu === "reveal";

  return (
    <main className="safari-toile-bg min-h-screen">
      <GameExperience
        publicEnabled={Boolean(enabled)}
        isAdminViewer={isAdminViewer}
        testGender={testGender}
        startAtReveal={startAtReveal}
      />
    </main>
  );
}
