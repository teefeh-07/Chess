import { createClient } from '@somnia-chain/streams'
import { somniaTestnetChain } from './web3'
import { PublicClient, createPublicClient, http } from 'viem'

export const sdsClient = createClient({
  chain: somniaTestnetChain,
  transport: {
    type: 'http',
    url: somniaTestnetChain.rpcUrls.default.http[0],
  },
})

// Create a Viem public client for manual polling fallback
const publicClient: PublicClient = createPublicClient({
  chain: somniaTestnetChain,
  transport: http(somniaTestnetChain.rpcUrls.default.http[0]),
})

export const subscribeToGameEvents = (contractAddress: string, gameId: number, onData: (data: [string, string, string[], bigint, number, string]) => void) => {
  const MOVE_MADE_TOPIC = '0x2cd40382871897b179712f174ebbe74a1cf9bd00f050a2a9e3b157df33e5e264'
  const GAME_ENDED_TOPIC = '0x3d5fcd8fa3235aeb3897f25c8ea49989174981afcb01b9d03189d1056a16775b'
  const GET_GAME_STATE_SELECTOR = '0xffde0c74'

  let pollingInterval: NodeJS.Timeout | null = null

  const subscription = sdsClient.subscribe({
    eventContractSources: [contractAddress],
    topicOverrides: [
      MOVE_MADE_TOPIC,
      GAME_ENDED_TOPIC
    ],
    ethCalls: [{
      to: contractAddress,
      data: `${GET_GAME_STATE_SELECTOR}${gameId.toString(16).padStart(64, '0')}` // getGameState(gameId) selector + gameId
    }],
    onData: (data) => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
      onData(data)
    },
    onError: (error) => {
      console.error('SDS subscription error:', error)
      // Fallback to polling every 3 seconds if SDS fails
      if (!pollingInterval) {
        pollingInterval = setInterval(async () => {
          console.log('Polling for game state...')
          try {
            const gameState = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: [
                {
                  inputs: [{ name: 'gameId', type: 'uint256' }],
                  name: 'getGameState',
                  outputs: [
                    { name: 'player1', type: 'address' },
                    { name: 'player2', type: 'address' },
                    { name: 'moves', type: 'string[]' },
                    { name: 'startTime', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'winner', type: 'address' }
                  ],
                  stateMutability: 'view',
                  type: 'function'
                }
              ],
              functionName: 'getGameState',
              args: [BigInt(gameId)],
            })
            onData(gameState)
          } catch (pollError) {
            console.error('Polling error:', pollError)
          }
        }, 3000)
      }
    },
    onlyPushChanges: true
  })

  return () => {
    subscription.unsubscribe()
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
  }
}
