import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PuzzleData } from "@/types/puzzle";
import { Eye } from "lucide-react";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  puzzleIndex: number;
}

const HintModal = ({ isOpen, onClose, puzzle, puzzleIndex }: HintModalProps) => {
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const unlockNextHint = () => {
    const nextHintIndex = unlockedHints.length;
    if (nextHintIndex < puzzle.hints.length) {
      setUnlockedHints([...unlockedHints, nextHintIndex]);
    }
  };

  const handleViewAnswer = () => {
    setShowAnswer(true);
  };

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#FFFDF5] border-2 border-[#03404A] shadow-lg">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#03404A] font-serif">
          {puzzle.title}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="bg-[#FFFBEA] p-4 rounded-lg border-2 border-[#03404A]">
          <h3 className="font-semibold text-[#03404A] mb-2">Puzzle Clue:</h3>
          <p className="text-[#2C2C2C]">{puzzle.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#03404A] mb-3">Hints:</h3>
          <div className="space-y-3">
            {puzzle.hints.map((hint, index) => (
              <Card key={index} className="border-2 border-[#03404A] bg-white">
                <CardContent className="p-4">
                  {unlockedHints.includes(index) ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#F5D547] text-[#03404A] px-2 py-1 rounded text-sm font-semibold">
                          Hint {index + 1}
                        </span>
                      </div>
                      <p className="text-[#2C2C2C]">{hint}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        onClick={unlockNextHint}
                        variant="outline"
                        className="border-2 border-[#03404A] text-[#03404A] hover:bg-[#FFFBEA]"
                        disabled={index !== unlockedHints.length}
                      >
                        {`Unlock Hint ${index + 1}`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

       
          <div className="space-y-4">
            {/* <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 text-center font-medium">
                All hints unlocked!
              </p>
            </div> */}

            <div className="text-center">
              <Button
                onClick={handleViewAnswer}
                className="bg-[#03404A] hover:bg-[#022F37] text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Answer
              </Button>
            </div>
          </div>
        

        {showAnswer && (
          <div className="bg-[#FFF3F3] border-2 border-red-800 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">Answer:</h3>
            <p className="text-red-800 text-lg font-medium">{puzzle.answer}</p>
            {puzzle.title.toLowerCase() === 'the final letter' && (
              <div className="mt-3 pt-3 border-t border-red-800">
                <p className="text-sm text-red-700 font-medium italic">
                  Open the last envelope after solving this puzzle
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);
};

export default HintModal;
