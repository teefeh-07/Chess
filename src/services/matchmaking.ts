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
}
