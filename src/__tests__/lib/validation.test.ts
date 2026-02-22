/**
 * Validation utility tests
 */

import { Validator } from '@/lib/validation'

describe('Validator', () => {
  describe('ethereumAddress', () => {
    it('validates correct Ethereum address', () => {
      const result = Validator.ethereumAddress('0x1234567890123456789012345678901234567890')
      expect(result.isValid).toBe(true)
    })

    it('rejects invalid address', () => {
      const result = Validator.ethereumAddress('invalid')
      expect(result.isValid).toBe(false)
    })
  })

  describe('chessMove', () => {
    it('validates correct move', () => {
      const result = Validator.chessMove('e2e4')
      expect(result.isValid).toBe(true)
    })
  })
})
