import { createClient } from "@/lib/supabase/server";
import { GameExperience } from "@/components/jeux/game-experience";

export const dynamic = "force-dynamic";

// Route privée mais toujours accessible (pas de mot de passe) : permet de
// tester le jeu à tout moment, avant même que le bouton "Connaître le sexe"
// n'apparaisse sur la page d'accueil. Le sexe reste protégé côté serveur
// (voir /api/gender-reveal/reveal) peu importe l'état de ce flag.
export default async function JeuxPage() {
  const supabase = createClient();
  const { data: enabled } = await supabase.rpc("get_gender_reveal_enabled");

  return (
    <main className="safari-toile-bg min-h-screen">
      <GameExperience publicEnabled={Boolean(enabled)} />
    </main>
  );
}
