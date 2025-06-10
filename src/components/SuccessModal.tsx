
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
              Puzzle {puzzleIndex + 1} Solved!
            </h3>
            <p className="text-green-700">
              You've successfully solved "{puzzle.title}"
            </p>
          </div>

          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-900 mb-2">Story Continues...</h4>
              <p className="text-green-800 leading-relaxed">
                {puzzle.storyProgression}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Pike Place Market Recommendations
              </h4>
              <div className="space-y-2">
                {puzzle.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-100 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900">{rec.title}</h5>
                    <p className="text-blue-800 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
