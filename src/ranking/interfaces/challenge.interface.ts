export interface Challenge extends Document {
  _id: string;
  dateTimeChallenge: Date;
  status: ChallengeStatus;
  dateTimeRequest: Date;
  dateTimeAnswer: Date;
  requester: string;
  category: string;
  players: string[];
  match: string;
}

export enum ChallengeStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}
