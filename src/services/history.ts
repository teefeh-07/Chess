// Match History Module
export interface MatchRecord {
  gameId: string;
  white: string;
  black: string;
  result: string;
}

export class HistoryManager {
  private records: MatchRecord[] = [];
  
  public addRecord(record: MatchRecord) {
    this.records.push(record);
  }

  public getPlayerHistory(playerId: string): MatchRecord[] {
    return this.records.filter(r => r.white === playerId || r.black === playerId);
  }
}
