/**
 * Testing utilities for chess game components
 */

import { Chess } from 'chess.js'

export const TEST_POSITIONS = {
  STARTING: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  CHECKMATE: 'rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
  STALEMATE: '8/8/8/8/8/8/8/k6K w - - 0 1',
  ENDGAME: '8/8/8/8/8/8/4K3/4k3 w - - 0 1'
} as const

export const TEST_MOVES = {
  E4: 'e4',
  E5: 'e5',
  NF3: 'Nf3',
  NC6: 'Nc6',
  CASTLE_KINGSIDE: 'O-O',
  CASTLE_QUEENSIDE: 'O-O-O'
} as const

export function createTestChess(position?: string): Chess {
  const chess = new Chess()
  if (position) {
    chess.load(position)
  }
  return chess
}

export function makeTestMoves(chess: Chess, moves: string[]): void {
  moves.forEach(move => {
    try {
      chess.move(move)
    } catch (error) {
      console.warn(`Invalid test move: ${move}`, error)
    }
  })
}

export const mockGameState = {
  player1: '0x1234567890123456789012345678901234567890',
  player2: '0x0987654321098765432109876543210987654321',
  moves: ['e4', 'e5', 'Nf3', 'Nc6'],
  startTime: BigInt(Date.now()),
  status: 1,
  winner: '0x0000000000000000000000000000000000000000'
}
