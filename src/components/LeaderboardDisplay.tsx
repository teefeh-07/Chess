'use client'

import { useState, useEffect } from 'react'
import { subscribeToLeaderboard } from '@/lib/sdsClient'

interface LeaderboardEntry {
  player: string
  rating: bigint
  gamesPlayed: bigint
  gamesWon: bigint
}

interface LeaderboardDisplayProps {
  contractAddress: string
}

export default function LeaderboardDisplay({ contractAddress }: LeaderboardDisplayProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(contractAddress, (data) => {
      setLeaderboard(data)
    })

    return unsubscribe
  }, [contractAddress])

  return (
    <div className="space-y-2">
      {leaderboard.length > 0 ? (
        leaderboard.map((entry, index) => (
          <div key={entry.player} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-semibold">#{index + 1}</span>
            <span className="text-sm">{entry.player.slice(0, 6)}...{entry.player.slice(-4)}</span>
            <span className="text-sm">Rating: {entry.rating.toString()}</span>
            <span className="text-sm">W: {entry.gamesWon.toString()} / P: {entry.gamesPlayed.toString()}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Loading leaderboard...</p>
      )}
    </div>
  )
}
