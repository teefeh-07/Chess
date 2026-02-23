// Matchmaking Queue Module
export interface PlayerProfile {
  id: string;
  rating: number;
}

export class Matchmaker {
  private queue: PlayerProfile[] = [];

  public joinQueue(player: PlayerProfile) {
    if (!this.queue.find(p => p.id === player.id)) {
      this.queue.push(player);
    }
  }

  public findMatch(player: PlayerProfile): PlayerProfile | null {
    const match = this.queue.find(p => p.id !== player.id && Math.abs(p.rating - player.rating) <= 200);
    return match || null;
  }
}
