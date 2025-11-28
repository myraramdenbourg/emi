
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PuzzleData } from "@/types/puzzle";
import SuccessModal from "./SuccessModal";
import { trackEvent } from "@/lib/analytics";

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  puzzleIndex: number;
  onSolved: () => void;
}

const getCustomResponse = (answer: string, correctAnswers: string | string[], puzzleTitle: string): string | null => {
  const userAnswer = answer.toLowerCase().replace(/\s+/g, '');
  const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  
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
      if (['panora', 'panoramic', 'panoramicview'].includes(userAnswer)) {
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
      if (['vend', 'vendor'].includes(userAnswer)) {
        return "Almost there! Keep going!";
      }
      break;
    case 'the final letter':
      if (['wronghand'].includes(userAnswer)) {
        return "So close! It looks like you used the opposite hands.";
      }
      break;
  }
  
  return null;
};

const checkAnswer = (userAnswer: string, correctAnswers: string | string[]): boolean => {
  const userAnswerNormalized = userAnswer.toLowerCase().replace(/\s+/g, '');
  const correctList = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
  
  return correctList.some(correct => 
    userAnswerNormalized === correct.toLowerCase().replace(/\s+/g, '')
  );
};

const AnswerModal = ({ isOpen, onClose, puzzle, puzzleIndex, onSolved }: AnswerModalProps) => {
  const [answer, setAnswer] = useState("");
  const [showError, setShowError] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkAnswer(answer, puzzle.answer)) {
      trackEvent('puzzle_solved', { answer }, puzzleIndex, puzzle.title);
      setShowSuccess(true);
      onSolved();
      setAnswer("");
      setShowError(false);
      setCustomMessage("");
    } else {
      trackEvent('wrong_answer', { answer }, puzzleIndex, puzzle.title);
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
      <DialogContent className="max-w-md bg-[#FFFDF5] border-2 border-[#03404A] shadow-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#03404A] font-serif">
            Check Answer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#FFFBEA] p-4 rounded-lg border-2 border-[#03404A]">
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
              className="mt-1 border-2 border-[#03404A] focus:border-[#03404A] text-[#2C2C2C]"
              required
            />
          </div>

          {showError && (
            <div className="bg-[#FFF3F3] border-2 border-red-800 p-3 rounded-lg">
              <p className="text-red-800 text-sm text-center">
                That's not quite right. Try again or check the hints!
              </p>
            </div>
          )}

          {customMessage && (
            <div className="bg-[#E6F4FF] border-2 border-blue-800 p-3 rounded-lg">
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
              className="flex-1 border-2 border-[#03404A] text-[#03404A] hover:bg-[#FFFBEA]"
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
