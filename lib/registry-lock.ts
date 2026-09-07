/**
 * Le cadenas de confidentialité protège une garantie produit explicite : ne
 * jamais révéler le statut d'achat des cadeaux à l'admin quand il est activé.
 * En cas d'incertitude sur son état (erreur de lecture, ligne singleton
 * manquante), on doit échouer fermé (verrouillé) plutôt qu'ouvert : mieux
 * vaut masquer le statut par erreur qu'exposer la surprise par erreur.
 */
export function resolveIsLocked(
  lockRow: { is_locked: boolean } | null | undefined,
  error: unknown | null | undefined
): boolean {
  if (error || !lockRow) return true;
  return lockRow.is_locked;
}
