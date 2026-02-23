import React from "react";
import { PlayerProfile } from "../services/matchmaking";

interface LeaderboardProps {
  players: PlayerProfile[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
  return (
    <div className="leaderboard-container">
      <h2>Top Players</h2>
      <ul>
        {sortedPlayers.map((p, idx) => (
          <li key={p.id}>{idx + 1}. {p.id} - {p.rating} ELO</li>
        ))}
      </ul>
    </div>
  );
};
