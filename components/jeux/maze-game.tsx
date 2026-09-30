"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Milk, Baby } from "lucide-react";
import { MAZE_COLS, MAZE_ROWS, canMove, mazeEnd, mazeGrid, mazeStart } from "@/lib/jeux/maze-data";
import { jeuxSound } from "@/lib/jeux/sound";

export function MazeGame({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(mazeStart);
  const [dragging, setDragging] = useState(false);
  const doneRef = useRef(false);

  const moveToPoint = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || doneRef.current) return;
      const rect = container.getBoundingClientRect();
      const cellSize = rect.width / MAZE_COLS;
      const col = Math.floor((clientX - rect.left) / cellSize);
      const row = Math.floor((clientY - rect.top) / cellSize);
      if (row < 0 || row >= MAZE_ROWS || col < 0 || col >= MAZE_COLS) return;

      setPosition((current) => {
        if (row === current.row && col === current.col) return current;
        const rowDiff = Math.abs(row - current.row);
        const colDiff = Math.abs(col - current.col);
        const isAdjacent = rowDiff + colDiff === 1;
        if (!isAdjacent || !canMove(current, { row, col })) return current;

        jeuxSound.click();
        const next = { row, col };
        if (row === mazeEnd.row && col === mazeEnd.col) {
          doneRef.current = true;
          setTimeout(() => onComplete(), 250);
        }
        return next;
      });
    },
    [onComplete]
  );

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Certains environnements (ou un pointeur déjà relâché) refusent la
      // capture : le jeu reste jouable, seul le suivi hors des limites du
      // cadre est un peu moins fluide.
    }
    setDragging(true);
    moveToPoint(event.clientX, event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    moveToPoint(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Glissez le biberon avec votre doigt ou votre souris à travers le labyrinthe, sans
        traverser les murs, jusqu&apos;à bébé.
      </p>
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-sm touch-none select-none rounded-2xl bg-white/70 shadow-inner"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.04) 26%, transparent 27%, transparent)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <MazeWalls />
        <Baby
          className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-sage-600"
          style={{
            left: `${((mazeEnd.col + 0.5) / MAZE_COLS) * 100}%`,
            top: `${((mazeEnd.row + 0.5) / MAZE_ROWS) * 100}%`,
          }}
        />
        <Milk
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary transition-all duration-150 ease-out"
          style={{
            left: `${((position.col + 0.5) / MAZE_COLS) * 100}%`,
            top: `${((position.row + 0.5) / MAZE_ROWS) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function MazeWalls() {
  const walls: React.ReactNode[] = [];
  for (let row = 0; row < MAZE_ROWS; row += 1) {
    for (let col = 0; col < MAZE_COLS; col += 1) {
      const cell = mazeGrid[row][col];
      const left = (col / MAZE_COLS) * 100;
      const top = (row / MAZE_ROWS) * 100;
      const width = 100 / MAZE_COLS;
      const height = 100 / MAZE_ROWS;
      const thickness = 3;

      if (cell.top) {
        walls.push(
          <div
            key={`t-${row}-${col}`}
            className="absolute rounded-full bg-sage-500/70"
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: thickness }}
          />
        );
      }
      if (cell.left) {
        walls.push(
          <div
            key={`l-${row}-${col}`}
            className="absolute rounded-full bg-sage-500/70"
            style={{ left: `${left}%`, top: `${top}%`, width: thickness, height: `${height}%` }}
          />
        );
      }
      if (row === MAZE_ROWS - 1 && cell.bottom) {
        walls.push(
          <div
            key={`b-${row}-${col}`}
            className="absolute rounded-full bg-sage-500/70"
            style={{ left: `${left}%`, top: `${top + height}%`, width: `${width}%`, height: thickness }}
          />
        );
      }
      if (col === MAZE_COLS - 1 && cell.right) {
        walls.push(
          <div
            key={`r-${row}-${col}`}
            className="absolute rounded-full bg-sage-500/70"
            style={{ left: `${left + width}%`, top: `${top}%`, width: thickness, height: `${height}%` }}
          />
        );
      }
    }
  }
  return <>{walls}</>;
}
