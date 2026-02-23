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
}
