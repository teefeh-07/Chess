'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import ChessBoard from './ChessBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Chess } from 'chess.js'

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

  const { writeContract } = useWriteContract()

  const handleMove = (move: string) => {
    try {
      const chessMove = chess.move(move)
      if (chessMove) {
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

  const resetGame = () => {
    chess.reset()
    setGameOver(false)
    setWinner(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Local Chess Game</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ChessBoard
              gameId={gameId}
              onMove={handleMove}
              isPlayerTurn={!gameOver && chess.turn() === 'w'} // Always white's turn for local play
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
            <div>
              <h3 className="text-lg font-semibold mb-2">Game Info</h3>
              <p>Turn: {chess.turn() === 'w' ? 'White' : 'Black'}</p>
              <p>Status: {gameOver ? (winner === null ? 'Draw' : winner ? 'You Won!' : 'You Lost') : 'Game Active'}</p>
              {chess.inCheck() && <p className="text-red-500">Check!</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Move History</h3>
              <div className="max-h-40 overflow-y-auto">
                {chess.history().map((move: string, index: number) => (
                  <div key={index} className="text-sm">
                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))}
              </div>
            </div>
            {gameOver && (
              <div className="space-y-2">
                <p className="text-lg font-semibold">Game Over!</p>
                <div className="space-x-2">
                  <Button onClick={() => handleSubmitScore(winner === true)} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Score'}
                  </Button>
                  <Button onClick={resetGame} variant="outline">
                    New Game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
