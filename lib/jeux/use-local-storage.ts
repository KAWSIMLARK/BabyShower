"use client";

import { useCallback, useEffect, useState } from "react";

// Persistance locale de la progression du jeu (par appareil, jamais envoyée
// au serveur) — volontairement séparée de la configuration admin en base.
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // localStorage indisponible (navigation privée, quota) : on repart du défaut.
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Rien à faire si le stockage est plein ou bloqué : le jeu reste jouable.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}

export interface JeuxProgress {
  maze: boolean;
  shapes: boolean;
  puzzle: boolean;
  // Ne stocke jamais le sexe lui-même — seulement le fait d'avoir déjà vu
  // l'écran de révélation, pour ne pas rejouer l'animation à chaque visite.
  revealed: boolean;
  // Empêche un même appareil de voter plusieurs fois s'il recommence le jeu.
  voted: boolean;
}

export const defaultJeuxProgress: JeuxProgress = {
  maze: false,
  shapes: false,
  puzzle: false,
  revealed: false,
  voted: false,
};

export const JEUX_PROGRESS_KEY = "mission-bebe-lafreniere-progress";
