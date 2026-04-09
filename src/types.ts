export type PuzzleType = '2x2' | '3x3' | '4x4' | 'Pyraminx';

export interface SolveRecord {
  id?: string;
  uid: string;
  time: number;
  scramble: string;
  date: any; // Firestore Timestamp
  penalty?: string;
  puzzle?: PuzzleType;
}
