import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

type PublicMessage = { full_name: string; message_for_baby: string; created_at: string };

export async function BabyMessages() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_public_baby_messages");

  if (error) {
    console.error("Erreur de lecture des messages publics :", error);
  }

  const messages = (data ?? []) as PublicMessage[];

  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-semibold">Messages pour bébé</h2>
        <p className="mt-2 text-muted-foreground">
          Les mots doux laissés par vos proches en attendant l&apos;arrivée du bébé.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {messages.map((message, index) => (
          <Card key={index} className="bg-white/70">
            <CardContent className="space-y-3 p-6">
              <Heart className="h-5 w-5 text-primary" />
              <p className="text-sm leading-relaxed text-foreground/90">
                {message.message_for_baby}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                — {message.full_name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
