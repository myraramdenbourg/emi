
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PuzzleData } from "@/types/puzzle";
import { Trophy, Star } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  puzzleIndex: number;
}

const SuccessModal = ({ isOpen, onClose, puzzle, puzzleIndex }: SuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-900 font-serif flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {puzzle.title} Solved!
            </h3>
            <p className="text-green-700">
              You've successfully solved "{puzzle.title}"
            </p>
          </div>

          <div className="text-center">
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Continue Your Journey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
