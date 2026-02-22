/**
 * Input validation utilities
 */

export const ValidationRules = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  CHESS_MOVE: /^[a-h][1-8][a-h][1-8][qrbn]?$/,
  GAME_ID: /^\d+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export class Validator {
  static ethereumAddress(address: string): ValidationResult {
    if (!address) {
      return { isValid: false, error: 'Address is required' }
    }
    
    if (!ValidationRules.ETHEREUM_ADDRESS.test(address)) {
      return { isValid: false, error: 'Invalid Ethereum address format' }
    }
    
    return { isValid: true }
  }

  static chessMove(move: string): ValidationResult {
    if (!move) {
      return { isValid: false, error: 'Move is required' }
    }
    
    if (!ValidationRules.CHESS_MOVE.test(move)) {
      return { isValid: false, error: 'Invalid chess move format' }
    }
    
    return { isValid: true }
  }

  static gameId(id: string): ValidationResult {
    if (!id) {
      return { isValid: false, error: 'Game ID is required' }
    }
    
    if (!ValidationRules.GAME_ID.test(id)) {
      return { isValid: false, error: 'Game ID must be numeric' }
    }
    
    return { isValid: true }
  }

  static username(username: string): ValidationResult {
    if (!username) {
      return { isValid: false, error: 'Username is required' }
    }
    
    if (!ValidationRules.USERNAME.test(username)) {
      return { isValid: false, error: 'Username must be 3-20 characters, alphanumeric and underscores only' }
    }
    
    return { isValid: true }
  }
}
