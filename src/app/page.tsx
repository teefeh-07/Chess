'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import GameRoom from '@/components/GameRoom'
import LeaderboardDisplay from '@/components/LeaderboardDisplay'
import { Moon, Sun } from 'lucide-react'

// Contract address - replace with deployed address
const CONTRACT_ADDRESS = '0x5f481427Dc681635dDEE38255da2E98FcaC90CeE' // Updated after deployment

export default function Home() {
  const { isConnected } = useAccount()
  const [gameId, setGameId] = useState<number | null>(null)
  const [opponentAddress, setOpponentAddress] = useState('')
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  if (gameId) {
    return <GameRoom gameId={gameId} contractAddress={CONTRACT_ADDRESS} />
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} bg-background text-foreground transition-colors`}>
      <div className="max-w-4xl mx-auto p-4">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer */}
            <Button onClick={toggleTheme} variant="outline" size="icon">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Quantum Chess Arena
          </h1>
          <p className="text-muted-foreground">
            Real-time blockchain chess battles powered by Somnia Data Streams
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <ConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Start New Game</h2>
            {isConnected ? (
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
                <Button onClick={() => setGameId(Date.now())} className="w-full">
                  Start Game
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Connect wallet to start playing</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Leaderboard</h2>
            <LeaderboardDisplay contractAddress={CONTRACT_ADDRESS} />
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">About SDS Integration</h3>
            <p className="text-muted-foreground mb-4">
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
