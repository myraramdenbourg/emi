
export interface PuzzleData {
  title: string;
  description: string;
  hints: string[];
  answer: string;
  storyProgression: string;
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  description: string;
}
