import Cube from 'cubejs';
import { PuzzleType } from '../types';

// Initialize the solver (this might take a moment on first load)
let solverInitialized = false;

export const initCubeSolver = () => {
  console.log("Cube import:", Cube);
  if (!solverInitialized) {
    if (Cube && typeof Cube.initSolver === 'function') {
      Cube.initSolver();
    } else if (Cube && (Cube as any).default && typeof (Cube as any).default.initSolver === 'function') {
      (Cube as any).default.initSolver();
    }
    solverInitialized = true;
  }
};

export const generateScramble = (puzzle: PuzzleType = '3x3'): string => {
  if (puzzle === '2x2') {
    return generateRandomMoves(['U', 'R', 'F'], ['', "'", '2'], 10);
  } else if (puzzle === '3x3') {
    return generateRandomMoves(['U', 'D', 'L', 'R', 'F', 'B'], ['', "'", '2'], 20);
  } else if (puzzle === '4x4') {
    return generateRandomMoves(['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'], ['', "'", '2'], 40);
  } else if (puzzle === 'Pyraminx') {
    const main = generateRandomMoves(['U', 'L', 'R', 'B'], ['', "'"], 10);
    const tips = ['u', 'l', 'r', 'b'].map(tip => {
      if (Math.random() > 0.5) {
        return tip + (Math.random() > 0.5 ? "'" : "");
      }
      return "";
    }).filter(Boolean).join(" ");
    return main + (tips ? " " + tips : "");
  }
  return "";
};

const generateRandomMoves = (moves: string[], modifiers: string[], length: number) => {
  let scramble = [];
  let lastMove = '';
  let secondLastMove = '';

  for (let i = 0; i < length; i++) {
    let move;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
    } while (
      move.charAt(0) === lastMove.charAt(0) ||
      (move.charAt(0) === secondLastMove.charAt(0) && isOpposite(move.charAt(0), lastMove.charAt(0)))
    );

    secondLastMove = lastMove;
    lastMove = move;
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
  }

  return scramble.join(' ');
};

const isOpposite = (move1: string, move2: string) => {
  const opposites: Record<string, string> = {
    U: 'D', D: 'U',
    L: 'R', R: 'L',
    F: 'B', B: 'F'
  };
  return opposites[move1] === move2;
};

export const solveCube = (scramble: string): string => {
  try {
    // Normalize scramble (remove extra spaces and uppercase)
    const normalizedScramble = scramble.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!normalizedScramble) return "Please enter a scramble.";

    // Validate that it only contains valid 3x3 moves
    const validMovesRegex = /^([UDFBLR][2']?\s*)+$/;
    if (!validMovesRegex.test(normalizedScramble)) {
      return "Error: Invalid scramble. The solver only supports standard 3x3 moves (U, D, F, B, L, R with optional ' or 2).";
    }

    initCubeSolver();
    
    // Handle potential default export from CommonJS in Vite
    const CubeClass = (Cube && (Cube as any).default) ? (Cube as any).default : Cube;
    
    const cube = new CubeClass();
    
    cube.move(normalizedScramble);
    return cube.solve();
  } catch (error) {
    console.error("Error solving cube:", error);
    return "Error: Could not solve the scramble. Please ensure it's a valid 3x3 scramble.";
  }
};
