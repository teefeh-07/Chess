'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import GameRoom from '@/components/GameRoom'
import { parseEventLogs } from 'viem'

// Contract address - replace with deployed address
const CONTRACT_ADDRESS = '0xAd54eC47a610f8495b9bC96CB6E09661E4FC42a2' // To be updated after deployment

export default function Home() {
  const { isConnected } = useAccount()
  const [gameId, setGameId] = useState<number | null>(null)
  const [opponentAddress, setOpponentAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: activeGames, refetch: refetchActiveGames } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'getActiveGames',
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'getActiveGames',
  })

  const { writeContract, isPending, isSuccess, isError, error: writeError, data: writeData } = useWriteContract()

  const handleGameCreated = useCallback((txData: { logs: readonly import("viem").Log[] }) => {
    const logs = parseEventLogs({
      abi: [
        {
          anonymous: false,
          inputs: [
            { indexed: true, name: 'gameId', type: 'uint256' },
            { indexed: true, name: 'player1', type: 'address' },
            { indexed: true, name: 'player2', type: 'address' }
          ],
          name: 'GameCreated',
          type: 'event'
        }
      ],
      logs: txData.logs,
    })

    const gameCreatedEvent = logs.find((log): log is { eventName: 'GameCreated'; args: { gameId: bigint } } => log.eventName === 'GameCreated')
    if (gameCreatedEvent) {
      setGameId(Number(gameCreatedEvent.args.gameId))
      refetchActiveGames() // Refresh active games list
    }
  }, [refetchActiveGames])

  useEffect(() => {
    if (isSuccess && writeData) {
      setTimeout(() => handleGameCreated(writeData), 0)
      // Clear writeData after processing to prevent re-running this effect
      // This might require a custom hook or a different approach if writeData is managed by wagmi
      // For now, we'll assume writeData is cleared by wagmi after a successful transaction
    }

    if (isError && writeError) {
      setError(writeError.message)
    } else {
      setError(null)
    }
  }, [isSuccess, writeData, isError, writeError, handleGameCreated])

  const handleCreateGame = () => {
    setError(null) // Clear previous errors
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: [
        {
          inputs: [{ name: 'opponent', type: 'address' }],
          name: 'createGame',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'createGame',
      args: [opponentAddress as `0x${string}` || '0x0000000000000000000000000000000000000000']
    })
  }

  if (gameId) {
    return <GameRoom gameId={gameId} contractAddress={CONTRACT_ADDRESS} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quantum Chess Arena
          </h1>
          <p className="text-lg text-gray-600">
            Real-time blockchain chess battles powered by Somnia Data Streams
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <ConnectButton />
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Create New Game</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Opponent Address (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={opponentAddress}
                    onChange={(e) => setOpponentAddress(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateGame} className="w-full" disabled={isPending}>
                  {isPending ? 'Creating Game...' : 'Create Game'}
                </Button>
                {isError && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Active Games</h2>
              <div className="space-y-2">
                {activeGames && activeGames.length > 0 ? (
                  activeGames.map((id: bigint) => (
                    <Button
                      key={id.toString()}
                      variant="outline"
                      className="w-full"
                      onClick={() => setGameId(Number(id))}
                    >
                      Join Game #{id.toString()}
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-500">No active games</p>
                )}
              </div>
            </Card>
          </div>
        )}

        <div className="mt-12 text-center">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">About SDS Integration</h3>
            <p className="text-gray-600 mb-4">
              This dApp uses Somnia Data Streams (SDS) for real-time synchronization of chess moves,
              game states, and spectator updates. Experience instant blockchain gaming!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold">Real-Time Moves</h4>
                <p>Instant move synchronization via SDS streams</p>
              </div>
              <div>
                <h4 className="font-semibold">Live Spectating</h4>
                <p>Watch games unfold in real-time</p>
              </div>
              <div>
                <h4 className="font-semibold">On-Chain Validation</h4>
                <p>All moves validated on Somnia Testnet</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
