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

  const total = puzzleData.length;
  const solvedCount = solvedPuzzles.length;

  return (
    <div
      className="min-h-screen p-6 bg-[#03404A]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(246,220,159,0.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(246,220,159,0.05), transparent 45%), repeating-linear-gradient(45deg, rgba(246,220,159,0.025) 0 2px, transparent 2px 14px)",
      }}
    >
      <div className={`max-w-7xl mx-auto ${finalSolved ? "pb-20" : ""}`}>
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#F6DC9F] mb-4 font-serif tracking-wide">
            ECHOES OF THE MARKET
          </h1>
          <p className="text-lg text-[#F6DC9F] max-w-2xl mx-auto opacity-90 italic font-serif">
            "I may not have all the answers, but I know my grandpa well and I may be able to provide a pointer in the right direction. Good luck friend!"
          </p>

          <div className="mt-6 inline-flex items-center gap-3 text-[#F6DC9F]/90">
            <div className="flex gap-1.5">
              {puzzleData.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${
                    solvedPuzzles.includes(i)
                      ? 'bg-[#F6DC9F] shadow-[0_0_8px_rgba(246,220,159,0.7)]'
                      : 'bg-[#F6DC9F]/25'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-serif italic opacity-80">
              {solvedCount} of {total} stalls explored
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 max-w-6xl mx-auto">
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
