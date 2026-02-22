import { Square, PieceSymbol } from 'chess.js'

/**
 * Converts algebraic notation to array indices
 */
export function squareToIndices(square: Square): [number, number] {
  const file = square.charCodeAt(0) - 97 // a=0, b=1, etc.
  const rank = parseInt(square[1]) - 1   // 1=0, 2=1, etc.
  return [7 - rank, file] // flip rank for display
}

/**
 * Converts array indices to algebraic notation
 */
export function indicesToSquare(row: number, col: number): Square {
  const file = String.fromCharCode(97 + col)
  const rank = (8 - row).toString()
  return (file + rank) as Square
}

/**
 * Calculates material advantage
 */
export function calculateMaterialAdvantage(pieces: { [square: string]: { type: PieceSymbol, color: string } }): number {
  let whiteValue = 0
  let blackValue = 0
  
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  
  Object.values(pieces).forEach(piece => {
    const value = values[piece.type] || 0
    if (piece.color === 'w') {
      whiteValue += value
    } else {
      blackValue += value
    }
  })
  
  return whiteValue - blackValue
}
