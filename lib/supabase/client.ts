import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour les composants client ("use client")
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "ne sont pas définies (ou sont vides) dans les variables d'environnement.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
