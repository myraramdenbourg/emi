import { useState } from "react";
import PuzzleCard from "./PuzzleCard";
import { puzzleData } from "@/data/puzzleData";
import { useAnalytics } from "@/hooks/useAnalytics";

const PuzzleGame = () => {
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);
  useAnalytics();

  const handlePuzzleSolved = (puzzleIndex: number) => {
    if (!solvedPuzzles.includes(puzzleIndex)) {
      setSolvedPuzzles([...solvedPuzzles, puzzleIndex]);
    }
  };

  const finalLetterIndex = puzzleData.findIndex(
    (p) => p.title.toLowerCase() === "the final letter"
  );
  const finalSolved =
    finalLetterIndex !== -1 && solvedPuzzles.includes(finalLetterIndex);

  return (
    <div className="min-h-screen p-6 bg-[#03404A]">
      <div className={`max-w-7xl mx-auto ${finalSolved ? "pb-20" : ""}`}>
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#F6DC9F] mb-4 font-serif">
            ECHOES OF THE MARKET
          </h1>
          <p className="text-xl text-[#F6DC9F] max-w-2xl mx-auto opacity-90">
            "I may not have all the answers, but I know my grandpa well and I may be able to provide a pointer in the right direction. Good luck friend!"
          </p>
          <div className="mt-4 text-[#F6DC9F] opacity-80">
            {/* Puzzles Solved: {solvedPuzzles.length} / {puzzleData.length} */}
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

      {finalSolved && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white text-center py-4 px-6 shadow-2xl z-50 font-serif text-xl font-bold">
          Open the final envelope.
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
