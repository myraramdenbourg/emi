
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PuzzleData } from "@/types/puzzle";
import SuccessModal from "./SuccessModal";

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  puzzleIndex: number;
  onSolved: () => void;
}

const AnswerModal = ({ isOpen, onClose, puzzle, puzzleIndex, onSolved }: AnswerModalProps) => {
  const [answer, setAnswer] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim()) {
      setShowSuccess(true);
      onSolved();
      setAnswer("");
      setShowError(false);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleClose = () => {
    setAnswer("");
    setShowError(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-orange-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 font-serif">
              Submit Answer
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">
                Puzzle {puzzleIndex + 1}: {puzzle.title}
              </h3>
              <p className="text-amber-800 text-sm">{puzzle.description}</p>
            </div>

            <div>
              <Label htmlFor="answer" className="text-amber-900 font-medium">
                Your Answer:
              </Label>
              <Input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="mt-1 border-amber-300 focus:border-amber-500"
                required
              />
            </div>

            {showError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-800 text-sm text-center">
                  That's not quite right. Try again or check the hints!
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Submit Answer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          handleClose();
        }}
        puzzle={puzzle}
        puzzleIndex={puzzleIndex}
      />
    </>
  );
};

export default AnswerModal;
