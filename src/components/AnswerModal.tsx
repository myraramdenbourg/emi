
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

const getCustomResponse = (answer: string, correctAnswer: string, puzzleTitle: string): string | null => {
  const userAnswer = answer.toLowerCase().trim();
  const correct = correctAnswer.toLowerCase().trim();
  
  // Check for close answers based on puzzle context
  switch (puzzleTitle.toLowerCase()) {
    case 'coffee':
      if (['warm', 'warmht', 'awrmth'].includes(userAnswer)) {
        return "You're very close!";
      }
      break;
    case 'fish':
      if (['cheek'].includes(userAnswer)) {
        return "Getting warmer! Think smaller than a river but where salmon are born.";
      }
      break;
    case 'ferris wheel':
      if (['panora', 'panoramic', 'panoramic view'].includes(userAnswer)) {
        return "Almost there! Keep going!";
      }
      break;
    case 'cheese':
      if (['rlnd'].includes(userAnswer)) {
        return "Very close!";
      }
      break;
    case 'gum wall':
      if (['stick'].includes(userAnswer)) {
        return "So close!";
      }
      break;
    case 'flowers':
      if (['hibis'].includes(userAnswer)) {
        return "You're on the right track!";
      }
      break;
    case 'pigs':
      if (['state'].includes(userAnswer)) {
        return "Almost there! Keep going!";
      }
      break;
    case 'post alley':
      if (['stone', 'stones', 'cobble'].includes(userAnswer)) {
        return "Very close!";
      }
      break;
    case 'produce':
      if (['vend'].includes(userAnswer)) {
        return "Almost there! Keep going!";
      }
      break;
    case 'the final letter':
      if (['wrong hand'].includes(userAnswer)) {
        return "So close! It looks like you used the opposite hands.";
      }
      break;
  }
  
  return null;
};

const AnswerModal = ({ isOpen, onClose, puzzle, puzzleIndex, onSolved }: AnswerModalProps) => {
  const [answer, setAnswer] = useState("");
  const [showError, setShowError] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim()) {
      setShowSuccess(true);
      onSolved();
      setAnswer("");
      setShowError(false);
      setCustomMessage("");
    } else {
      const customResponse = getCustomResponse(answer, puzzle.answer, puzzle.title);
      if (customResponse) {
        setCustomMessage(customResponse);
        setShowError(false);
      } else {
        setShowError(true);
        setCustomMessage("");
      }
      setTimeout(() => {
        setShowError(false);
        setCustomMessage("");
      }, 5000);
    }
  };

  const handleClose = () => {
    setAnswer("");
    setShowError(false);
    setCustomMessage("");
    onClose();
  };

  return (
  <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#FFFDF5] border border-[#F5D547] shadow-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#03404A] font-serif">
            Check Answer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#FFFBEA] p-4 rounded-lg border border-[#F5D547]/60">
            <h3 className="font-semibold text-[#03404A] mb-2">
              {puzzle.title}
            </h3>
            <p className="text-[#2C2C2C] text-sm">{puzzle.description}</p>
          </div>

          <div>
            <Label htmlFor="answer" className="text-[#03404A] font-medium">
              Your Answer:
            </Label>
            <Input
              id="answer"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="mt-1 border-[#F5D547]/40 focus:border-[#F5D547] text-[#2C2C2C]"
              required
            />
          </div>

          {showError && (
            <div className="bg-[#FFF3F3] border border-red-200 p-3 rounded-lg">
              <p className="text-red-800 text-sm text-center">
                That's not quite right. Try again or check the hints!
              </p>
            </div>
          )}

          {customMessage && (
            <div className="bg-[#E6F4FF] border border-blue-200 p-3 rounded-lg">
              <p className="text-blue-800 text-sm text-center">
                {customMessage}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-[#F5D547]/40 text-[#03404A] hover:bg-[#FFFBEA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F5D547] hover:bg-[#e8c734] text-[#03404A] font-semibold"
            >
              Check Answer
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
