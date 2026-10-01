"use client";

import { useMemo } from "react";

// Confettis en CSS pur (pas de dépendance externe) : chaque pièce tombe avec
// un délai et une trajectoire légèrement différents pour un effet naturel.
// Si `emojis` est fourni (ex. ballons de sport côté garçon), chaque pièce
// pige un emoji au hasard dans la liste au lieu d'un petit rectangle coloré.
export function Confetti({ color, emojis }: { color: string; emojis?: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.6 + Math.random() * 1.6,
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
        colorMix: Math.random() > 0.5,
        emoji: emojis && emojis.length > 0 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      })),
    [emojis]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p) =>
        p.emoji ? (
          <span
            key={p.id}
            className="absolute top-[-5%] leading-none"
            style={{
              left: `${p.left}%`,
              fontSize: p.size * 2.4,
              transform: `rotate(${p.rotate}deg)`,
              animation: `jeux-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              // @ts-expect-error -- propriété CSS custom
              "--drift": `${p.drift}px`,
            }}
          >
            {p.emoji}
          </span>
        ) : (
          <span
            key={p.id}
            className="absolute top-[-5%] rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              backgroundColor: p.colorMix ? color : "#fff",
              opacity: 0.9,
              transform: `rotate(${p.rotate}deg)`,
              animation: `jeux-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              // Variable custom lue par le keyframe pour la dérive horizontale.
              // @ts-expect-error -- propriété CSS custom
              "--drift": `${p.drift}px`,
            }}
          />
        )
      )}
      <style>{`
        @keyframes jeux-confetti-fall {
          to {
            transform: translate(var(--drift), 115vh) rotate(540deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
