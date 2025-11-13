# Chess 

Real-time blockchain chess battles powered by Somnia Data Streams (SDS) on Somnia Testnet.

## Overview

Quantum Chess Arena is a Web3 dApp that demonstrates the power of Somnia Data Streams for real-time on-chain gaming. Players can create and join chess games with instant move synchronization, live spectating, and blockchain-verified game outcomes.

## Features

- **Real-Time Gameplay**: Moves are synchronized instantly using SDS streams
- **Live Spectating**: Watch ongoing games with real-time updates
- **On-Chain Validation**: All moves and game states are recorded on Somnia Testnet
- **ELO Rating System**: Blockchain-based player rankings
- **NFT Achievements**: Mint achievement NFTs for milestones
- **Tournament Support**: Bracket-style competitions with live progression

## Somnia Data Streams Integration

This project leverages SDS to create reactive, structured data streams from on-chain events:

### Key SDS Features Used:

1. **Event Subscription**: Subscribe to `MoveMade` and `GameEnded` events for real-time updates
2. **Structured Schemas**: Define efficient schemas for game state and move data
3. **Real-Time Sync**: Instant synchronization of game states across all players and spectators
4. **Fallback Mechanism**: Graceful degradation to polling when SDS is unavailable

### SDS Implementation:

```typescript
const gameSubscription = sdsClient.subscribe({
  eventContractSources: [CONTRACT_ADDRESS],
  topicOverrides: ['0x...'], // MoveMade event topic
  ethCalls: [{
    to: CONTRACT_ADDRESS,
    data: '0x...' // getGameState(gameId) selector
  }],
  onData: (data) => {
    updateBoard(data.moves) // Real-time board updates
    updateSpectators(data) // Live spectator feeds
  },
  onError: (error) => {
    // Fallback polling every 3 seconds
  },
  onlyPushChanges: true
})
```

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, React 19, Tailwind CSS, shadcn/ui
- **Web3**: Wagmi, Viem, RainbowKit
- **SDS**: @somnia-chain/streams SDK
- **Game Logic**: chess.js
- **Smart Contracts**: Solidity, OpenZeppelin
- **Blockchain**: Somnia Testnet (Chain ID: 50312)

## Smart Contract

The `QuantumChessArena.sol` contract handles:
- Game creation and management
- Move validation and recording
- ELO rating calculations
- NFT achievement minting
- Tournament functionality

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quantum-chess-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update contract address in `src/app/page.tsx`
   - Ensure Somnia Testnet is configured in your wallet

4. **Deploy smart contract**
   ```bash
   # Deploy to Somnia Testnet
   npx hardhat run scripts/deploy.ts --network somniaTestnet
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

## Deployment

The dApp is deployed on Somnia Testnet with the following addresses:
- Contract: `0x...` (to be updated after deployment)
- Frontend: Deployed on Vercel/Netlify

## Hackathon Submission

This project is submitted for the Somnia Data Streams Mini Hackathon:

- **GitHub Repository**: [Link to be provided]
- **Demo Video**: [Link to be provided]
- **Deployed dApp**: [Link to be provided]

## SDS Usage Explanation

Somnia Data Streams enables real-time data streaming from blockchain events, transforming traditional on-chain data into live, reactive streams. In this project:

1. **Move Events**: Each chess move triggers a `MoveMade` event that SDS streams to all subscribers
2. **Game State Sync**: SDS provides structured access to current game state without constant polling
3. **Spectator Experience**: Multiple viewers can watch the same game with instant updates
4. **Performance**: Sub-second latency for move confirmations and state updates

The implementation demonstrates SDS's capability to turn blockchain data into composable, real-time streams that power modern Web3 applications.

## License

MIT License - see LICENSE file for details.
