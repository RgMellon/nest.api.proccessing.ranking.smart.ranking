export interface Match {
  category: string;
  challenge: string;
  players: string[];
  def: string;
  score: Result[];
}

export interface Result {
  set: string;
}
