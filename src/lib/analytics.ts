/**
 * Game analytics and statistics
 */

export interface GameStats {
  totalMoves: number
  averageMoveTime: number
  capturedPieces: string[]
  gameStartTime: number
  gameEndTime?: number
}

export class GameAnalytics {
  private stats: GameStats = {
    totalMoves: 0,
    averageMoveTime: 0,
    capturedPieces: [],
    gameStartTime: Date.now()
  }

  recordMove(moveTime: number): void {
    this.stats.totalMoves++
    this.stats.averageMoveTime = 
      (this.stats.averageMoveTime * (this.stats.totalMoves - 1) + moveTime) / this.stats.totalMoves
  }

  recordCapture(piece: string): void {
    this.stats.capturedPieces.push(piece)
  }

  endGame(): GameStats {
    this.stats.gameEndTime = Date.now()
    return { ...this.stats }
  }

  getGameDuration(): number {
    const endTime = this.stats.gameEndTime || Date.now()
    return endTime - this.stats.gameStartTime
  }

  reset(): void {
    this.stats = {
      totalMoves: 0,
      averageMoveTime: 0,
      capturedPieces: [],
      gameStartTime: Date.now()
    }
  }
}
