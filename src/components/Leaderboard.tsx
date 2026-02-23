import React from "react";
import { PlayerProfile } from "../services/matchmaking";

interface LeaderboardProps {
  players: PlayerProfile[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  return <div className="leaderboard-container"></div>;
};
