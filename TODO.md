# Quantum Chess Arena - Implementation Plan

## 1. Fix React Hydration Mismatch
- [ ] Update src/app/page.tsx to render grid layout consistently, conditionally show content inside to avoid SSR mismatch.

## 2. Fix SDS Client Subscription
- [ ] Modify src/lib/sdsClient.ts to use polling instead of subscribe method; implement leaderboard subscription for real-time updates.

## 3. Update Smart Contract for Score Submission
- [ ] Edit contracts/QuantumChessArena.sol: Remove createGame/makeMove functions; add submitScore function; add leaderboard mapping for player rankings.

## 4. Modify GameRoom for Local Chess Logic
- [ ] Update src/components/GameRoom.tsx: Use chess.js for local game logic instead of on-chain moves; add score submission at game end.

## 5. Update Main Page for Local Games and Leaderboard
- [ ] Modify src/app/page.tsx: Allow starting local games without on-chain creation; add leaderboard display component.

## 6. Deploy Updated Contract
- [ ] Run hardhat deploy script to deploy modified contract to Somnia Testnet; update contract address in code.

## 7. Testing and Verification
- [ ] Test local game flow: Start game, play moves locally, submit score after game ends.
- [ ] Verify SDS leaderboard updates in real-time.
- [ ] Confirm no hydration errors and SDS functionality works.
