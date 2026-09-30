"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

// Glisser-déposer unifié souris + tactile via la Pointer Events API : un seul
// jeu de handlers pour les Missions 2 (formes) et 3 (casse-tête).
export interface DragState {
  id: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export function usePointerDrag(onDrop: (id: string, clientX: number, clientY: number) => void) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const draggingRef = useRef<DragState | null>(null);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>, id: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const state: DragState = {
      id,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - (rect.left + rect.width / 2),
      offsetY: event.clientY - (rect.top + rect.height / 2),
    };
    draggingRef.current = state;
    setDragging(state);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return;
    const next = { ...draggingRef.current, x: event.clientX, y: event.clientY };
    draggingRef.current = next;
    setDragging(next);
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const state = draggingRef.current;
      draggingRef.current = null;
      setDragging(null);
      if (state) onDrop(state.id, event.clientX, event.clientY);
    },
    [onDrop]
  );

  return { dragging, onPointerDown, onPointerMove, onPointerUp };
}
