
import { useState } from "react";
import PuzzleCard from "./PuzzleCard";
import { puzzleData } from "@/data/puzzleData";

const PuzzleGame = () => {
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);

  const handlePuzzleSolved = (puzzleIndex: number) => {
    if (!solvedPuzzles.includes(puzzleIndex)) {
      setSolvedPuzzles([...solvedPuzzles, puzzleIndex]);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4 font-serif">
            Echoes of the Market
          </h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Discover the mysteries hidden in these vintage postcards from Pike Place Market. 
            Each card holds a puzzle waiting to be solved.
          </p>
          <div className="mt-4 text-amber-600">
            Puzzles Solved: {solvedPuzzles.length} / {puzzleData.length}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {puzzleData.map((puzzle, index) => (
            <PuzzleCard
              key={index}
              puzzle={puzzle}
              puzzleIndex={index}
              isSolved={solvedPuzzles.includes(index)}
              onSolved={() => handlePuzzleSolved(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;
