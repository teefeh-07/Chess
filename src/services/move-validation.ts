// Move Validation Service
import { Chess } from "chess.js";

export interface MoveRequest {
  from: string;
  to: string;
  promotion?: string;
}

export class MoveValidator {
  private game: Chess;
  constructor(fen?: string) { this.game = new Chess(fen); }

  public isValidMove(move: MoveRequest): boolean {
    try {
      const mockGame = new Chess(this.game.fen());
      const result = mockGame.move(move);
      return result !== null;
    } catch (e) {
      return false;
    }
  }
}
