export interface RankingResponse {
  player?: string;
  position?: string;
  score?: number;
  matchHistory?: History;
}

interface History {
  wins?: number;
  losses?: number;
}
