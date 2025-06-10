
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
      if (['warm', 'heat', 'cozy', 'comfort'].includes(userAnswer)) {
        return "You're very close! Think about the feeling coffee brings to your hands and heart.";
      }
      break;
    case 'fish':
      if (['river', 'stream', 'water', 'salmon'].includes(userAnswer)) {
        return "Getting warmer! Think smaller than a river but where salmon are born.";
      }
      break;
    case 'ferris wheel':
      if (['view', 'views', 'panoramic', 'panorama'].includes(userAnswer)) {
        return "Almost there! You need both words - what kind of views?";
      }
      break;
    case 'cheese':
      if (['skin', 'crust', 'outer', 'covering'].includes(userAnswer)) {
        return "Very close! What's the specific term for the outer layer of aged cheese?";
      }
      break;
    case 'gum wall':
      if (['stick', 'stuck', 'adhering', 'attaching'].includes(userAnswer)) {
        return "So close! You need the action word - what is the gum doing?";
      }
      break;
    case 'flowers':
      if (['flower', 'tropical', 'hawaii', 'exotic'].includes(userAnswer)) {
        return "You're on the right track! What specific tropical flower is known for its beauty?";
      }
      break;
    case 'pigs':
      if (['fair', 'county fair', 'carnival', 'agriculture'].includes(userAnswer)) {
        return "Almost! What type of fair features livestock competitions?";
      }
      break;
    case 'post alley':
      if (['stone', 'stones', 'cobble', 'historic'].includes(userAnswer)) {
        return "Very close! What's the full term for this type of historic street paving?";
      }
      break;
    case 'produce':
      if (['farmers', 'sellers', 'merchants', 'people'].includes(userAnswer)) {
        return "Almost there! What do you call the people who sell goods at a market?";
      }
      break;
    case 'the final letter':
      if (['remember', 'memories', 'recall', 'nostalgia'].includes(userAnswer)) {
        return "So close! What's the specific word for fondly remembering the past?";
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
        <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-orange-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900 font-serif">
              Check Answer
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-100 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">
                {puzzle.title}
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

            {customMessage && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
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
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
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
