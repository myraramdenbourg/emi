
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
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#FFFDF5] border-2 border-[#03404A] shadow-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#03404A] font-serif flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#F5D547]" />
          Congratulations!
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#F5D547] to-[#e8c734] rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-10 h-10 text-[#03404A]" />
          </div>
          <h3 className="text-xl font-bold text-[#03404A] mb-2">
            {puzzle.title} Solved!
          </h3>
          <p className="text-[#2C2C2C]">
            You've successfully solved "{puzzle.title}"
          </p>
        </div>

        <div className="text-center">
          <Button
            onClick={onClose}
            className="bg-[#03404A] hover:bg-[#022F37] text-white px-8"
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
