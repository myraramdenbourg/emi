
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PuzzleData } from "@/types/puzzle";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  puzzleIndex: number;
}

const HintModal = ({ isOpen, onClose, puzzle, puzzleIndex }: HintModalProps) => {
  const [unlockedHints, setUnlockedHints] = useState<number[]>([0]);

  const unlockNextHint = () => {
    const nextHintIndex = unlockedHints.length;
    if (nextHintIndex < puzzle.hints.length) {
      setUnlockedHints([...unlockedHints, nextHintIndex]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900 font-serif">
            Puzzle {puzzleIndex + 1}: {puzzle.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Puzzle Description:</h3>
            <p className="text-amber-800">{puzzle.description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-amber-900 mb-3">Hints:</h3>
            <div className="space-y-3">
              {puzzle.hints.map((hint, index) => (
                <Card key={index} className="border border-amber-200">
                  <CardContent className="p-4">
                    {unlockedHints.includes(index) ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-amber-600 text-white px-2 py-1 rounded text-sm font-medium">
                            Hint {index + 1}
                          </span>
                        </div>
                        <p className="text-amber-800">{hint}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button
                          onClick={unlockNextHint}
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                          Unlock Hint {index + 1}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {unlockedHints.length === puzzle.hints.length && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 text-center font-medium">
                All hints unlocked! Ready to submit your answer?
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HintModal;
