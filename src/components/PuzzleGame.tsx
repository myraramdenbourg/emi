
import { useState, useEffect } from "react";
import PuzzleCard from "./PuzzleCard";
import { puzzleData } from "@/data/puzzleData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Package } from "lucide-react";

const PuzzleGame = () => {
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);
  const [showPostcardCompleteModal, setShowPostcardCompleteModal] = useState(false);
  const [showFinalCompleteModal, setShowFinalCompleteModal] = useState(false);

  const finalLetterIndex = puzzleData.findIndex(puzzle => puzzle.title.toLowerCase() === 'the final letter');
  const nonFinalPuzzles = puzzleData.length - 1; // All puzzles except "The Final Letter"

  const handlePuzzleSolved = (puzzleIndex: number) => {
    if (!solvedPuzzles.includes(puzzleIndex)) {
      setSolvedPuzzles([...solvedPuzzles, puzzleIndex]);
    }
  };

  useEffect(() => {
    // Check if all non-final puzzles are solved (9 postcards)
    const nonFinalSolved = solvedPuzzles.filter(index => index !== finalLetterIndex).length;
    if (nonFinalSolved === nonFinalPuzzles && !solvedPuzzles.includes(finalLetterIndex)) {
      setShowPostcardCompleteModal(true);
    }

    // Check if final letter is solved
    if (solvedPuzzles.includes(finalLetterIndex) && solvedPuzzles.length === puzzleData.length) {
      setShowFinalCompleteModal(true);
    }
  }, [solvedPuzzles, finalLetterIndex, nonFinalPuzzles]);

  return (
    <div className="min-h-screen p-6 bg-[#03404A]">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#F6DC9F] mb-4 font-serif">
            ECHOES OF THE MARKET
          </h1>
          <p className="text-xl text-[#F6DC9F] max-w-2xl mx-auto opacity-90">
            "I may not have all the answers, but I know my grandpa well and I may be able to provide a pointer in the right direction. Good luck players!"
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

      {/* Postcard Complete Modal */}
      <Dialog open={showPostcardCompleteModal} onOpenChange={setShowPostcardCompleteModal}>
        <DialogContent className="max-w-md bg-[#FFFDF5] border-2 border-[#03404A] shadow-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#03404A] font-serif flex items-center gap-2">
              <Package className="w-6 h-6 text-[#F5D547]" />
              All Postcards Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#F5D547] to-[#e8c734] rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-10 h-10 text-[#03404A]" />
              </div>
              <p className="text-[#03404A] text-lg font-medium">
                Open the envelope after solving all 9 postcards
              </p>
            </div>
            <div className="text-center">
              <Button
                onClick={() => setShowPostcardCompleteModal(false)}
                className="bg-[#03404A] hover:bg-[#022F37] text-white px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Complete Modal */}
      <Dialog open={showFinalCompleteModal} onOpenChange={setShowFinalCompleteModal}>
        <DialogContent className="max-w-md bg-[#FFFDF5] border-2 border-[#03404A] shadow-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#03404A] font-serif flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#F5D547]" />
              Journey Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#F5D547] to-[#e8c734] rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-[#03404A]" />
              </div>
              <p className="text-[#03404A] text-lg font-medium">
                Open the final envelope
              </p>
            </div>
            <div className="text-center">
              <Button
                onClick={() => setShowFinalCompleteModal(false)}
                className="bg-[#03404A] hover:bg-[#022F37] text-white px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PuzzleGame;
