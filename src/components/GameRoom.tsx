'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import ChessBoard from './ChessBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Chess } from 'chess.js'
import { Play, Pause, RotateCcw, Square } from 'lucide-react'

// Game constants
const INITIAL_TIME_SECONDS = 600; // 10 minutes
const TIMER_INTERVAL_MS = 1000; // 1 second

interface GameRoomProps {
  gameId: number
  contractAddress: string
}

export default function GameRoom({ gameId, contractAddress }: GameRoomProps) {
  const { address } = useAccount()
  const [chess] = useState(() => new Chess())
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME_SECONDS)
  const [blackTime, setBlackTime] = useState(INITIAL_TIME_SECONDS)
  const [currentTurn, setCurrentTurn] = useState<'w' | 'b'>('w')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { writeContract } = useWriteContract()

  // Timer effect
  useEffect(() => {
    if (!gameOver && !isPaused) {
      timerRef.current = setInterval(() => {
        if (currentTurn === 'w') {
          setWhiteTime(prev => {
            if (prev <= 1) {
              setGameOver(true)
              setWinner(false) // Black wins on time
              return 0
            }
            return prev - 1
          })
        } else {
          setBlackTime(prev => {
            if (prev <= 1) {
              setGameOver(true)
              setWinner(true) // White wins on time
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentTurn, gameOver, isPaused])

  const handleMove = (move: string) => {
    try {
      const chessMove = chess.move(move)
      if (chessMove) {
        setCurrentTurn(chess.turn())
        if (chess.isGameOver()) {
          setGameOver(true)
          if (chess.isCheckmate()) {
            setWinner(chessMove.color === 'w' ? false : true) // If white made the last move and it's checkmate, black wins
          } else {
            setWinner(null) // Draw
          }
        }
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
  }

  const handleSubmitScore = (won: boolean) => {
    setSubmitting(true)
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          inputs: [{ name: 'won', type: 'bool' }],
          name: 'submitScore',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'submitScore',
      args: [won]
    }, {
      onSuccess: () => {
        setSubmitting(false)
        alert('Score submitted successfully!')
      },
      onError: (error) => {
        setSubmitting(false)
        console.error('Error submitting score:', error)
        alert('Error submitting score')
      }
    })
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const resetGame = () => {
    chess.reset()
    setGameOver(false)
    setWinner(null)
    setIsPaused(false)
    setWhiteTime(600)
    setBlackTime(600)
    setCurrentTurn('w')
  }

  const endGame = () => {
    setGameOver(true)
    setWinner(null) // Force draw
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToDashboard = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10 dark:to-purple-500/5 text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              Quantum Chess Arena
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Live blockchain chess battle</p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="p-6 md:p-8 bg-gradient-to-br from-card via-card to-purple-500/5 border-2 border-purple-500/20 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Live Chess Game
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Real-time synchronized moves</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={togglePause} 
                variant="outline" 
                size="sm"
                className="hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
              >
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                onClick={resetGame} 
                variant="outline" 
                size="sm"
                className="hover:bg-amber-500/10 hover:border-amber-500/50 transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              <Button 
                onClick={endGame} 
                variant="destructive" 
                size="sm" 
                disabled={gameOver}
                className="hover:scale-105 transition-transform"
              >
                <Square className="h-4 w-4 mr-1" />
                End Game
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-2">
              <ChessBoard
                gameId={gameId}
                onMove={handleMove}
                isPlayerTurn={!gameOver && !isPaused}
                gameState={{
                  player1: address || '',
                  player2: '',
                  moves: chess.history(),
                  startTime: BigInt(0),
                  status: gameOver ? 2 : 1,
                  winner: winner === true ? address || '' : winner === false ? '0x0000000000000000000000000000000000000000' : ''
                }}
              />
            </div>

            <div className="space-y-4">
              {/* Timer Section */}
              <Card className="p-5 bg-gradient-to-br from-background/80 to-purple-500/5 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Game Timer
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    currentTurn === 'w' && !isPaused 
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                      : 'bg-muted/30 border border-border'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">⚪ White</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold tabular-nums ${
                          currentTurn === 'w' && !isPaused ? 'text-blue-500' : ''
                        }`}>
                          {formatTime(whiteTime)}
                        </span>
                        {currentTurn === 'w' && !isPaused && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    currentTurn === 'b' && !isPaused 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : 'bg-muted/30 border border-border'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">⚫ Black</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold tabular-nums ${
                          currentTurn === 'b' && !isPaused ? 'text-purple-500' : ''
                        }`}>
                          {formatTime(blackTime)}
                        </span>
                        {currentTurn === 'b' && !isPaused && (
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Game Info */}
              <Card className="p-5 bg-gradient-to-br from-background/80 to-amber-500/5 border-2 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 shadow-lg">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Game Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm text-muted-foreground">Current Turn</span>
                    <span className="font-bold text-base">
                      {chess.turn() === 'w' ? '⚪ White' : '⚫ Black'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`font-bold text-base ${
                      gameOver ? 'text-red-500' : isPaused ? 'text-yellow-500' : 'text-emerald-500'
                    }`}>
                      {gameOver ? (winner === null ? '🤝 Draw' : winner ? '🏆 White Won!' : '🏆 Black Won!') :
                       isPaused ? '⏸️ Paused' : '▶️ Active'}
                    </span>
                  </div>
                  {chess.inCheck() && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 animate-pulse">
                      <p className="text-orange-500 dark:text-orange-400 font-bold text-center">⚠️ CHECK!</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Move History */}
              <Card className="p-5 bg-gradient-to-br from-background/80 to-emerald-500/5 border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Move History
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-muted/30">
                  {chess.history().map((move: string, index: number) => (
                    <div 
                      key={index} 
                      className="text-sm font-mono p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-muted-foreground">{Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'}</span>{' '}
                      <span className="font-semibold">{move}</span>
                    </div>
                  ))}
                  {chess.history().length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No moves yet. Start playing!
                    </p>
                  )}
                </div>
              </Card>

              {gameOver && (
                <Card className="p-6 bg-gradient-to-br from-card to-amber-500/10 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 animate-in fade-in duration-500">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">🏁</div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                      Game Over!
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleSubmitScore(winner === true)} 
                      disabled={submitting} 
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    >
                      {submitting ? 'Submitting...' : '📊 Submit Score'}
                    </Button>
                    <Button 
                      onClick={goToDashboard} 
                      variant="outline" 
                      className="w-full h-12 text-base font-semibold border-2 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all"
                    >
                      🏠 Live Dashboard
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
