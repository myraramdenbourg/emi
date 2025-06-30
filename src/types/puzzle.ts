
export interface PuzzleData {
  title: string;
  description: string;
  hints: string[];
  answer: string | string[]; // Support both single answer and multiple answers
}

export interface Recommendation {
  title: string;
  description: string;
}
