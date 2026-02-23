// Move Validation Service
import { Chess } from "chess.js";

export interface MoveRequest {
  from: string;
  to: string;
  promotion?: string;
}
