"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { jeuxSound } from "@/lib/jeux/sound";
import { usePointerDrag } from "@/lib/jeux/use-pointer-drag";

// Casse-tête à 9 pièces : chaque pièce porte un symbole unique et doit
// rejoindre sa case (même mécanique de glisser-déposer que les formes,
// simplement sur une grille 3x3 au lieu d'un alignement).
const PIECES = ["🍼", "🧸", "🌙", "⭐", "🦒", "🐘", "🎈", "🍃", "☁️"];

function shuffledIndices(length: number) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function PuzzleGame({ onComplete }: { onComplete: () => void }) {
  const [placed, setPlaced] = useState<Record<number, boolean>>({});
  const trayOrder = useMemo(() => shuffledIndices(PIECES.length), []);
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const doneRef = useRef(false);

  const handleDrop = useCallback(
    (idStr: string, clientX: number, clientY: number) => {
      const id = Number(idStr);
      for (const [slotId, el] of slotRefs.current.entries()) {
        const rect = el.getBoundingClientRect();
        const inside =
          clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
        if (inside && slotId === id) {
          setPlaced((prev) => {
            const next = { ...prev, [id]: true };
            jeuxSound.click();
            if (!doneRef.current && PIECES.every((_, i) => next[i])) {
              doneRef.current = true;
              setTimeout(() => onComplete(), 300);
            }
            return next;
          });
          return;
        }
      }
    },
    [onComplete]
  );

  const { dragging, onPointerDown, onPointerMove, onPointerUp } = usePointerDrag(handleDrop);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Chaque symbole a sa propre case (en transparence) : glissez-le au bon endroit.
      </p>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/60 p-2 shadow-inner">
        {PIECES.map((symbol, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) slotRefs.current.set(index, el);
            }}
            className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed text-2xl transition-colors sm:h-20 sm:w-20 ${
              placed[index] ? "border-primary bg-primary/10" : "border-sage-300 bg-white/50"
            }`}
          >
            <span className={placed[index] ? "opacity-100" : "opacity-25 grayscale"}>{symbol}</span>
          </div>
        ))}
      </div>

      <div className="flex min-h-[4.5rem] w-full max-w-md flex-wrap justify-center gap-3">
        {trayOrder
          .filter((index) => !placed[index])
          .map((index) => {
            const isDragging = dragging?.id === String(index);
            return (
              <button
                key={index}
                type="button"
                aria-label={`Pièce ${index + 1}`}
                onPointerDown={(e) => onPointerDown(e, String(index))}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="flex h-14 w-14 touch-none items-center justify-center rounded-lg bg-primary text-2xl shadow-md active:scale-95"
                style={
                  isDragging
                    ? {
                        position: "fixed",
                        left: dragging.x - dragging.offsetX,
                        top: dragging.y - dragging.offsetY,
                        transform: "translate(-50%, -50%)",
                        zIndex: 50,
                      }
                    : undefined
                }
              >
                {PIECES[index]}
              </button>
            );
          })}
      </div>
    </div>
  );
}
