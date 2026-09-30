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
export default async function JeuxPage() {
  const supabase = createClient();
  const [{ data: enabled }, { data: gender }, { data: userData }] = await Promise.all([
    supabase.rpc("get_gender_reveal_enabled"),
    supabase.rpc("reveal_baby_gender"),
    supabase.auth.getUser(),
  ]);

  // Si c'est l'administrateur (même connecté sur le site en direct pour
  // tester) qui visite /jeux, on ne compte jamais son vote et on lui montre
  // toujours le badge de test — pour ne pas fausser les statistiques des
  // invité·es avec ses propres essais.
  const viewerEmail = userData?.user?.email?.toLowerCase();
  const isAdminViewer = !!viewerEmail && ADMIN_EMAILS.includes(viewerEmail);

  return (
    <main className="safari-toile-bg min-h-screen">
      <GameExperience
        publicEnabled={Boolean(enabled)}
        isAdminViewer={isAdminViewer}
        testGender={gender === "girl" || gender === "boy" ? gender : null}
      />
    </main>
  );
}
