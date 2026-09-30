import { createClient } from "@/lib/supabase/server";
import { BettingPool, type BetRow } from "@/components/pari/betting-pool";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export default async function PariPage() {
  const supabase = createClient();

  const [
    { data: closedFlag },
    { data: bettingEnabledFlag },
    { data: betsData, error: betsError },
    { data: userData },
  ] = await Promise.all([
    supabase.rpc("get_gender_reveal_enabled"),
    supabase.rpc("get_betting_enabled"),
    supabase
      .from("gender_bets")
      .select("id, bettor_name, amount, choice, created_at")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (betsError) console.error("Erreur de lecture des paris :", betsError);

  const closed = Boolean(closedFlag);
  const bettingEnabled = Boolean(bettingEnabledFlag);

  const viewerEmail = userData?.user?.email?.toLowerCase();
  const isAdminViewer = !!viewerEmail && ADMIN_EMAILS.includes(viewerEmail);

  let winningGender: "girl" | "boy" | null = null;
  if (closed) {
    const { data: gender } = await supabase.rpc("reveal_baby_gender");
    if (gender === "girl" || gender === "boy") winningGender = gender;
  }

  return (
    <main className="safari-toile-bg min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <BettingPool
          initialBets={(betsData ?? []) as BetRow[]}
          closed={closed}
          bettingEnabled={bettingEnabled}
          isAdminViewer={isAdminViewer}
          winningGender={winningGender}
        />
      </div>
    </main>
  );
}
