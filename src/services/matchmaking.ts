// Matchmaking Queue Module
export interface PlayerProfile {
  id: string;
  rating: number;
}

export class Matchmaker {
  private queue: PlayerProfile[] = [];
}
