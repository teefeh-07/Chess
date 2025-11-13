import { somniaTestnetChain } from './web3'
import { PublicClient, createPublicClient, http } from 'viem'

// Create a Viem public client for polling leaderboard
const publicClient: PublicClient = createPublicClient({
  chain: somniaTestnetChain,
  transport: http(somniaTestnetChain.rpcUrls.default.http[0]),
})

interface LeaderboardEntry {
  player: string
  rating: bigint
  gamesPlayed: bigint
  gamesWon: bigint
}

export const subscribeToLeaderboard = (contractAddress: string, onData: (leaderboard: LeaderboardEntry[]) => void) => {
  let pollingInterval: NodeJS.Timeout | null = null

  // Poll for leaderboard updates every 5 seconds
  pollingInterval = setInterval(async () => {
    try {
      const leaderboard = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: 'getLeaderboard',
            outputs: [{ name: '', type: 'tuple[]' }],
            stateMutability: 'view',
            type: 'function'
          }
        ],
        functionName: 'getLeaderboard',
      })
      onData(leaderboard as LeaderboardEntry[])
    } catch (error) {
      console.error('Leaderboard polling error:', error)
    }
  }, 5000)

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
  }
}
