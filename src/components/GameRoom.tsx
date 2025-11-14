'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import ChessBoard from './ChessBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chess } from 'chess.js'
import { Play, Pause, RotateCcw, Square, Moon, Sun } from 'lucide-react'

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
  const [isDark, setIsDark] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [whiteTime, setWhiteTime] = useState(600) // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600)
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

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
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

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quantum Chess Arena</h1>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Local Chess Game</h2>
            <div className="flex gap-2">
              <Button onClick={togglePause} variant="outline" size="sm">
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={resetGame} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              <Button onClick={endGame} variant="destructive" size="sm" disabled={gameOver}>
                <Square className="h-4 w-4 mr-1" />
                End Game
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChessBoard
                gameId={gameId}
                onMove={handleMove}
                isPlayerTurn={!gameOver && !isPaused && chess.turn() === 'w'}
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
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">Game Timer</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${currentTurn === 'w' && !isPaused ? 'text-blue-500' : ''}`}>
                      White: {formatTime(whiteTime)}
                    </span>
                    {currentTurn === 'w' && !isPaused && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${currentTurn === 'b' && !isPaused ? 'text-blue-500' : ''}`}>
                      Black: {formatTime(blackTime)}
                    </span>
                    {currentTurn === 'b' && !isPaused && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  </div>
                </div>
              </Card>

              {/* Game Info */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Game Info</h3>
                <div className="space-y-1">
                  <p>Turn: <span className="font-medium">{chess.turn() === 'w' ? 'White' : 'Black'}</span></p>
                  <p>Status: <span className={`font-medium ${gameOver ? 'text-red-500' : isPaused ? 'text-yellow-500' : 'text-green-500'}`}>
                    {gameOver ? (winner === null ? 'Draw' : winner ? 'White Won!' : 'Black Won!') :
                     isPaused ? 'Paused' : 'Active'}
                  </span></p>
                  {chess.inCheck() && <p className="text-orange-500 font-medium">Check!</p>}
                </div>
              </Card>

              {/* Move History */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Move History</h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {chess.history().map((move: string, index: number) => (
                    <div key={index} className="text-sm font-mono">
                      {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                    </div>
                  ))}
                  {chess.history().length === 0 && (
                    <p className="text-sm text-muted-foreground">No moves yet</p>
                  )}
                </div>
              </Card>

              {gameOver && (
                <Card className="p-4">
                  <p className="text-lg font-semibold mb-3">Game Over!</p>
                  <div className="space-y-2">
                    <Button onClick={() => handleSubmitScore(winner === true)} disabled={submitting} className="w-full">
                      {submitting ? 'Submitting...' : 'Submit Score'}
                    </Button>
                    <Button onClick={resetGame} variant="outline" className="w-full">
                      Live Dashboard
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
