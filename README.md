# Quantum Chess Arena

Real-time blockchain chess battles powered by Somnia Data Streams (SDS) on Somnia Testnet.

## Inspiration

Traditional chess games lack the excitement of real-time, decentralized interactions. We wanted to create a Web3 gaming experience that leverages blockchain for true ownership, transparency, and instant synchronization. Somnia Data Streams provided the perfect foundation for building reactive, on-chain gaming that feels modern and responsive.

## What it does

Quantum Chess Arena is a decentralized application (dApp) that enables players to engage in real-time chess battles with blockchain-verified outcomes. Key features include:

- **Real-Time Gameplay**: Moves are synchronized instantly using SDS streams, eliminating lag and ensuring fair play
- **Live Spectating**: Watch ongoing games with real-time updates, perfect for tournaments and learning
- **On-Chain Validation**: All moves and game states are recorded immutably on Somnia Testnet
- **ELO Rating System**: Blockchain-based player rankings that persist across sessions
- **NFT Achievements**: Mint unique NFTs for reaching milestones like winning streaks or tournament victories
- **Tournament Support**: Bracket-style competitions with live progression tracking

## How we built it

The project combines cutting-edge Web3 technologies with modern frontend frameworks:

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript and React 19 for a robust, scalable UI
- **Styling**: Tailwind CSS with shadcn/ui components for a polished, responsive design
- **Web3 Integration**: Wagmi, Viem, and RainbowKit for seamless wallet connectivity
- **SDS Integration**: @somnia-chain/streams SDK for real-time data streaming
- **Game Logic**: chess.js library for accurate chess rule validation
- **Smart Contracts**: Solidity with OpenZeppelin standards, deployed on Somnia Testnet (Chain ID: 50312)

### Smart Contract Architecture
The `QuantumChessArena.sol` contract manages:
- Game lifecycle (creation, moves, completion)
- Move validation using chess.js logic
- ELO rating calculations and updates
- NFT achievement minting via ERC721
- Tournament bracket management

### SDS Implementation
We leveraged SDS to transform blockchain events into reactive data streams:

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

## Challenges we ran into

- **Real-Time Synchronization**: Ensuring sub-second latency for move confirmations while maintaining blockchain security
- **SDS Schema Design**: Optimizing data structures for efficient streaming without compromising on-chain data integrity
- **Fallback Mechanisms**: Implementing graceful degradation when SDS streams are temporarily unavailable
- **Cross-Platform Compatibility**: Ensuring consistent experience across different wallets and browsers
- **Gas Optimization**: Balancing feature richness with transaction costs on testnet

## Accomplishments that we're proud of

- **Seamless Real-Time Experience**: Achieved sub-second move synchronization that feels like traditional online chess
- **Comprehensive SDS Integration**: Demonstrated full SDS capabilities from event subscription to structured streaming
- **On-Chain Gaming Framework**: Created a reusable pattern for real-time Web3 games beyond chess
- **User Experience**: Built an intuitive interface that abstracts Web3 complexity while maintaining transparency
- **Scalable Architecture**: Designed contracts and frontend to support tournaments and large-scale adoption

## What we learned

- **SDS Power**: Somnia Data Streams transforms blockchain from a data store to a reactive platform, enabling modern gaming experiences
- **Web3 UX Design**: Balancing decentralization with usability requires careful consideration of user flows
- **Real-Time Web3**: Combining streaming technologies with blockchain creates new possibilities for interactive applications
- **Smart Contract Design**: Modular, upgradeable contracts are essential for evolving gaming platforms
- **Community Building**: Open-source Web3 projects benefit greatly from transparent development and documentation

## What's next for Quantum Chess Arena

- **Advanced Tournaments**: Multi-round competitions with prize pools and automated bracket management
- **Cross-Chain Support**: Expand to multiple blockchains while maintaining SDS synchronization
- **AI Opponents**: Integrate on-chain AI for practice games and skill assessment
- **Mobile App**: Native mobile experience with push notifications for game updates
- **DAO Governance**: Community-driven feature development and tournament organization
- **Multi-Game Support**: Expand platform to support other strategy games using the same infrastructure

## Built With

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Web3**: Wagmi, Viem, RainbowKit, Hardhat
- **Blockchain**: Solidity, OpenZeppelin, Somnia Testnet
- **Streaming**: Somnia Data Streams (@somnia-chain/streams)
- **Game Logic**: chess.js
- **Deployment**: Vercel

## Try it out

### Prerequisites
- Node.js 18+
- A Web3 wallet (MetaMask, Rainbow, etc.)
- Somnia Testnet configured in your wallet

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/quantum-chess-arena.git
   cd quantum-chess-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update contract address in `src/app/page.tsx` (currently set to deployed testnet address)
   - Ensure Somnia Testnet (Chain ID: 50312) is added to your wallet

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy smart contracts** (optional, already deployed on testnet)
   ```bash
   npx hardhat run scripts/deploy.cjs --network somniaTestnet
   ```

Visit `http://localhost:3000` to start playing!

## Team

- **Marcus** - Full-stack development, Web3 integration, SDS implementation

## Links

- **GitHub Repository**: [https://github.com/your-username/quantum-chess-arena](https://github.com/your-username/quantum-chess-arena)
- **Live Demo**: [https://quantum-chess-arena.vercel.app](https://quantum-chess-arena.vercel.app)
- **Demo Video**: [YouTube Link](https://youtube.com/watch?v=demo-video)
- **Smart Contract**: [0x5f481427Dc681635dDEE38255da2E98FcaC90CeE](https://explorer.somnia.network/address/0x5f481427Dc681635dDEE38255da2E98FcaC90CeE)
- **Devpost Submission**: [Link to be provided]

## License

MIT License - see LICENSE file for details.
