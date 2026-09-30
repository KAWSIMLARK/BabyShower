// Génère un labyrinthe "parfait" (une seule solution, aucune boucle) avec un
// algorithme de type recursive-backtracker, à partir d'une graine fixe : le
// labyrinthe est donc toujours identique d'une partie à l'autre (facile à
// tester), sans avoir à dessiner la grille à la main.

export interface MazeCellWalls {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface MazeCell {
  row: number;
  col: number;
}

export const MAZE_ROWS = 7;
export const MAZE_COLS = 7;
const MAZE_SEED = 190426;

export const mazeStart: MazeCell = { row: 0, col: 0 };
export const mazeEnd: MazeCell = { row: MAZE_ROWS - 1, col: MAZE_COLS - 1 };

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateMaze(rows: number, cols: number, seed: number): MazeCellWalls[][] {
  const random = mulberry32(seed);
  const grid: MazeCellWalls[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true }))
  );
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  type Dir = { dr: number; dc: number; wall: keyof MazeCellWalls; opposite: keyof MazeCellWalls };
  const directions: Dir[] = [
    { dr: -1, dc: 0, wall: "top", opposite: "bottom" },
    { dr: 1, dc: 0, wall: "bottom", opposite: "top" },
    { dr: 0, dc: -1, wall: "left", opposite: "right" },
    { dr: 0, dc: 1, wall: "right", opposite: "left" },
  ];

  const stack: MazeCell[] = [{ row: 0, col: 0 }];
  visited[0][0] = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const shuffled = [...directions].sort(() => random() - 0.5);
    const next = shuffled
      .map((dir) => ({ dir, row: current.row + dir.dr, col: current.col + dir.dc }))
      .find(
        ({ row, col }) =>
          row >= 0 && row < rows && col >= 0 && col < cols && !visited[row][col]
      );

    if (!next) {
      stack.pop();
      continue;
    }

    grid[current.row][current.col][next.dir.wall] = false;
    grid[next.row][next.col][next.dir.opposite] = false;
    visited[next.row][next.col] = true;
    stack.push({ row: next.row, col: next.col });
  }

  return grid;
}

export const mazeGrid = generateMaze(MAZE_ROWS, MAZE_COLS, MAZE_SEED);

export function canMove(from: MazeCell, to: MazeCell): boolean {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  if (rowDiff === -1 && colDiff === 0) return !mazeGrid[from.row][from.col].top;
  if (rowDiff === 1 && colDiff === 0) return !mazeGrid[from.row][from.col].bottom;
  if (rowDiff === 0 && colDiff === -1) return !mazeGrid[from.row][from.col].left;
  if (rowDiff === 0 && colDiff === 1) return !mazeGrid[from.row][from.col].right;
  return false;
}
