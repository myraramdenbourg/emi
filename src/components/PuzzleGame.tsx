
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
    <div className="min-h-screen p-6 bg-[#03404A]">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#F6DC9F] mb-4 font-serif">
            ECHOES OF THE MARKET
          </h1>
          <p className="text-xl text-[#F6DC9F] max-w-2xl mx-auto opacity-90">
            Discover the mysteries hidden in these vintage postcards from Pike Place Market. 
            Each card holds a puzzle waiting to be solved.
          </p>
          <div className="mt-4 text-[#F6DC9F] opacity-80">
            Puzzles Solved: {solvedPuzzles.length} / {puzzleData.length}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
