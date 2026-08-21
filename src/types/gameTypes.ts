//src/types/gameTypes.ts
export interface EnrichedWordPair {
  _id: string;
  word1: string;
  word2: string;
  clue: string;
  expectedType?: string;
  difficulty?: number;
  exactMatch?: string[];
  options: string[];
}

export interface GameAnswer {
  wordPairId: string;
  answer: string;
  timeSpent: number;
  isCorrect: boolean;
  accuracy: number;
}
export type WordPair = EnrichedWordPair;
