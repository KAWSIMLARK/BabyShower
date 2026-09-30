"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Star, Heart, Moon, Cloud, Sun, type LucideIcon } from "lucide-react";
import { jeuxSound } from "@/lib/jeux/sound";
import { usePointerDrag } from "@/lib/jeux/use-pointer-drag";

interface ShapeDef {
  id: string;
  label: string;
  Icon: LucideIcon;
}

const SHAPES: ShapeDef[] = [
  { id: "star", label: "Étoile", Icon: Star },
  { id: "heart", label: "Cœur", Icon: Heart },
  { id: "moon", label: "Lune", Icon: Moon },
  { id: "cloud", label: "Nuage", Icon: Cloud },
  { id: "sun", label: "Soleil", Icon: Sun },
];

function shuffledIds(ids: string[]) {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ShapesGame({ onComplete }: { onComplete: () => void }) {
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const trayOrder = useMemo(() => shuffledIds(SHAPES.map((s) => s.id)), []);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const doneRef = useRef(false);

  const handleDrop = useCallback(
    (id: string, clientX: number, clientY: number) => {
      for (const [slotId, el] of slotRefs.current.entries()) {
        const rect = el.getBoundingClientRect();
        const inside =
          clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
        if (inside && slotId === id) {
          setPlaced((prev) => {
            const next = { ...prev, [id]: true };
            jeuxSound.click();
            if (!doneRef.current && SHAPES.every((s) => next[s.id])) {
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
        Glissez chaque forme jusqu&apos;à son contour jumeau.
      </p>

      <div className="grid grid-cols-5 gap-3">
        {SHAPES.map(({ id, Icon }) => (
          <div
            key={id}
            ref={(el) => {
              if (el) slotRefs.current.set(id, el);
            }}
            className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              placed[id] ? "border-primary bg-primary/10" : "border-sage-300 bg-white/40"
            }`}
          >
            <Icon
              className={`h-7 w-7 ${placed[id] ? "text-primary" : "text-sage-300"}`}
              strokeWidth={placed[id] ? 2.5 : 1.5}
            />
          </div>
        ))}
      </div>

      <div
        className="flex min-h-[4.5rem] w-full max-w-md flex-wrap justify-center gap-4"
        onPointerMove={onPointerMove}
      >
        {trayOrder
          .filter((id) => !placed[id])
          .map((id) => {
            const shape = SHAPES.find((s) => s.id === id)!;
            const isDragging = dragging?.id === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={shape.label}
                onPointerDown={(e) => onPointerDown(e, id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="flex h-14 w-14 touch-none items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md active:scale-95"
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
                <shape.Icon className="h-7 w-7" />
              </button>
            );
          })}
      </div>
    </div>
  );
}
