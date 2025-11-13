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

  // Poll for leaderboard updates every 3 seconds
  pollingInterval = setInterval(async () => {
    try {
      const leaderboard = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: 'getLeaderboard',
            outputs: [{
              name: '',
              type: 'tuple[]',
              components: [
                { name: 'player', type: 'address' },
                { name: 'rating', type: 'uint256' },
                { name: 'gamesPlayed', type: 'uint256' },
                { name: 'gamesWon', type: 'uint256' }
              ]
            }],
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
  }, 3000)

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
  }
}
