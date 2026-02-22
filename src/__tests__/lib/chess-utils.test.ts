/**
 * Chess utility function tests
 */

import { squareToIndices, indicesToSquare, calculateMaterialAdvantage } from '@/lib/chess-utils'

describe('Chess Utils', () => {
  describe('squareToIndices', () => {
    it('converts a1 to correct indices', () => {
      const [row, col] = squareToIndices('a1')
      expect(row).toBe(7)
      expect(col).toBe(0)
    })

    it('converts h8 to correct indices', () => {
      const [row, col] = squareToIndices('h8')
      expect(row).toBe(0)
      expect(col).toBe(7)
    })
  })

  describe('indicesToSquare', () => {
    it('converts indices to a1', () => {
      const square = indicesToSquare(7, 0)
      expect(square).toBe('a1')
    })
  })

  describe('calculateMaterialAdvantage', () => {
    it('calculates equal material as 0', () => {
      const pieces = {
        e1: { type: 'k', color: 'w' },
        e8: { type: 'k', color: 'b' }
      }
      const advantage = calculateMaterialAdvantage(pieces as any)
      expect(advantage).toBe(0)
    })
  })
})
