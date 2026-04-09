declare module 'cubejs' {
  export default class Cube {
    static initSolver(): void;
    static fromString(str: string): Cube;
    constructor();
    move(moves: string): void;
    solve(): string;
  }
}
