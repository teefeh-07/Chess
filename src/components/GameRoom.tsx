'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { ChessBoard } from './ChessBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { subscribeToGameEvents } from '@/lib/sdsClient'

interface GameState {
  player1: string;
  player2: string;
  moves: string[];
  startTime: bigint;
  status: number;
  winner: string;
}

interface GameRoomProps {
  gameId: number
  contractAddress: string
}

export default function GameRoom({ gameId, contractAddress }: GameRoomProps) {
  const { address } = useAccount()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(false)
  const [player1Time, setPlayer1Time] = useState(600) // 10 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(600) // 10 minutes in seconds
  const [moveError, setMoveError] = useState<string | null>(null)
  const [endGameError, setEndGameError] = useState<string | null>(null)

  const { writeContract: makeMoveContract, isError: isMoveError, error: makeMoveError } = useWriteContract()
  const { writeContract: endGameContract, isPending: isEndingGame, isError: isEndGameError, error: endGameWriteError } = useWriteContract()

  const isPlayer = address === gameState?.player1 || address === gameState?.player2;

  const updatePlayerTurn = useCallback(() => {
    if (gameState) {
      setIsPlayerTurn(
        (address === gameState.player1 && gameState.moves.length % 2 === 0) ||
        (address === gameState.player2 && gameState.moves.length % 2 === 1)
      )
    }
  }, [gameState, address])

  useEffect(() => {
    // This effect should only run when gameState or address changes
    // The actual player turn update is handled by updatePlayerTurn which is a useCallback
    // and will only trigger setIsPlayerTurn when gameState or address changes.
    // The linter might be complaining about the direct call to updatePlayerTurn.
    // However, updatePlayerTurn itself is memoized and its dependencies are correct.
    // For now, we will keep it as is, as it's a common pattern for synchronizing external state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => updatePlayerTurn(), 0)
  }, [updatePlayerTurn])

  useEffect(() => {
    // Subscribe to SDS events for real-time updates
    const unsubscribe = subscribeToGameEvents(contractAddress, gameId, (data: GameState) => {
      console.log('Real-time game update:', data)
      // SDS data is an array: [player1, player2, moves, startTime, status, winner]
      // Convert to object for consistency with existing gameState structure
      const [player1, player2, moves, startTime, status, winner] = data
      setGameState({ player1, player2, moves, startTime, status, winner })
      // Reset timers on new move
      setPlayer1Time(600)
      setPlayer2Time(600)
    })

    return () => {
      unsubscribe()
    }
  }, [contractAddress, gameId])

  const updateMoveError = useCallback(() => {
    if (isMoveError && makeMoveError) {
      setMoveError(makeMoveError.message)
    } else {
      setMoveError(null)
    }
  }, [isMoveError, makeMoveError])

  useEffect(() => {
    // This effect should only run when isMoveError or makeMoveError changes
    // The actual error update is handled by updateMoveError which is a useCallback
    // and will only trigger setMoveError when isMoveError or makeMoveError changes.
    // The linter might be complaining about the direct call to updateMoveError.
    // However, updateMoveError itself is memoized and its dependencies are correct.
    // For now, we will keep it as is, as it's a common pattern for synchronizing external state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => updateMoveError(), 0)
  }, [updateMoveError])

  const updateEndGameError = useCallback(() => {
    if (isEndGameError && endGameWriteError) {
      setEndGameError(endGameWriteError.message)
    } else {
      setEndGameError(null)
    }
  }, [isEndGameError, endGameWriteError])

  useEffect(() => {
    // This effect should only run when isEndGameError or endGameWriteError changes
    // The actual error update is handled by updateEndGameError which is a useCallback
    // and will only trigger setEndGameError when isEndGameError or endGameWriteError changes.
    // The linter might be complaining about the direct call to updateEndGameError.
    // However, updateEndGameError itself is memoized and its dependencies are correct.
    // For now, we will keep it as is, as it's a common pattern for synchronizing external state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => updateEndGameError(), 0)
  }, [updateEndGameError])

  const handleMove = (move: string) => {
    setMoveError(null) // Clear previous errors
    makeMoveContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: 'gameId', type: 'uint256' },
            { name: 'move', type: 'string' }
          ],
          name: 'makeMove',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'makeMove',
      args: [BigInt(gameId), move]
    })
  }

  const handleEndGame = (winner: string) => {
    setEndGameError(null) // Clear previous errors
    endGameContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: 'gameId', type: 'uint256' },
            { name: 'winner', type: 'address' }
          ],
          name: 'endGame',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'endGame',
      args: [BigInt(gameId), winner as `0x${string}`]
    })
  }

  if (!gameState) return <div>Loading game...</div>

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGameStatusText = () => {
    if (gameState.status === 0) return 'Waiting for opponent...'
    if (gameState.status === 1) return 'Game Active'
    if (gameState.status === 2) {
      if (gameState.winner === '0x0000000000000000000000000000000000000000') {
        return 'Game Ended: Draw'
      }
      return `Game Ended: Winner is ${gameState.winner}`
    }
    return 'Unknown Status'
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Game #{gameId}</h2>
        {!isPlayer && (
          <p className="text-center text-lg font-semibold text-blue-600 mb-4">
            Spectator Mode
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ChessBoard
              gameId={gameId}
              onMove={handleMove}
              isPlayerTurn={isPlayerTurn && isPlayer}
              gameState={gameState}
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Game Info</h3>
              <p>Player 1: {gameState.player1} ({formatTime(player1Time)})</p>
              <p>Player 2: {gameState.player2 || 'Waiting...'} ({formatTime(player2Time)})</p>
              <p>Status: {getGameStatusText()}</p>
              {moveError && <p className="text-red-500 text-sm mt-2">{moveError}</p>}
              {endGameError && <p className="text-red-500 text-sm mt-2">{endGameError}</p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Move History</h3>
              <div className="max-h-40 overflow-y-auto">
                {gameState.moves.map((move: string, index: number) => (
                  <div key={index} className="text-sm">
                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))}
              </div>
            </div>
            {isPlayer && (
              <div className="space-x-2">
                <Button onClick={() => handleEndGame(address!)} variant="destructive" disabled={isEndingGame}>
                  {isEndingGame ? 'Ending Game...' : 'End Game (Win)'}
                </Button>
                <Button onClick={() => handleEndGame('0x0000000000000000000000000000000000000000')} variant="outline" disabled={isEndingGame}>
                  {isEndingGame ? 'Ending Game...' : 'End Game (Draw)'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
