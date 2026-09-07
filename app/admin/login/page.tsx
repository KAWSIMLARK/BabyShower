"use client";

import { useState } from "react";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        "Impossible d'envoyer le lien. Vérifiez que ce compte administrateur existe bien dans Supabase.",
      );
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <ShieldCheck className="mb-2 h-10 w-10 text-primary" />
          <CardTitle>Accès administrateur</CardTitle>
          <CardDescription>
            Entrez votre courriel pour recevoir un lien de connexion sécurisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "sent" ? (
            <div className="rounded-xl bg-primary/10 p-4 text-center text-sm text-primary">
              Un lien de connexion a été envoyé à <strong>{email}</strong>. Consultez votre
              boîte de réception.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2 text-left">
                <Label htmlFor="admin-email">Courriel</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {status === "error" && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Recevoir le lien magique
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
