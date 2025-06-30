import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HintModal from "./HintModal";
import AnswerModal from "./AnswerModal";
import { PuzzleData } from "@/types/puzzle";
import { Check, Coffee, Fish, FerrisWheel, Flower } from "lucide-react";

interface PuzzleCardProps {
  puzzle: PuzzleData;
  puzzleIndex: number;
  isSolved: boolean;
  onSolved: () => void;
}

const getIconForPuzzle = (title: string) => {
  switch (title.toLowerCase()) {
    case 'coffee':
      return <Coffee className="w-8 h-8 text-white" />;
    case 'fish':
      return <Fish className="w-8 h-8 text-white" />;
    case 'ferris wheel':
      return <FerrisWheel className="w-8 h-8 text-white" />;
    case 'cheese':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as closest available
    case 'gum wall':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as placeholder
    case 'flowers':
      return <Flower className="w-8 h-8 text-white" />;
    case 'pigs':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as placeholder
    case 'post alley':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as placeholder
    case 'produce':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as placeholder
    case 'the final letter':
      return <Coffee className="w-8 h-8 text-white" />; // Using coffee as placeholder
    default:
      return <Coffee className="w-8 h-8 text-white" />;
  }
};

const getImageForPuzzle = (title: string) => {
  switch (title.toLowerCase()) {
    case 'coffee':
      return '/assets/coffee_front.png';
    case 'fish':
      return '/assets/fish_front.png';
    case 'ferris wheel':
      return '/assets/ferris_front.png';
    case 'cheese':
      return '/assets/cheese_front.png';
    case 'gum wall':
      return '/assets/gum_front.png';
    case 'flowers':
      return '/assets/flowers_front.png';
    case 'pigs':
      return '/assets/pigs_front.png';
    case 'post alley':
      return '/assets/postalley_front.png';
    case 'produce':
      return '/assets/produce_front.png';
    case 'the final letter':
      return '/assets/meta_front2.png';
    default:
      return '/assets/cheese_front.png';
  }
};

const PuzzleCard = ({ puzzle, puzzleIndex, isSolved, onSolved }: PuzzleCardProps) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const getDisplayAnswer = (answer: string | string[]): string => {
    return Array.isArray(answer) ? answer[0] : answer;
  };

  return (
    <>
     <Card className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF5] to-[#F5D547]/10 border-2 border-[#F5D547] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
  {isSolved && (
    <div className="absolute top-2 right-2 z-10">
      <Badge className="bg-green-700 hover:bg-green-700 text-white">
        <Check className="w-3 h-3 mr-1" />
        Solved
      </Badge>
    </div>

  )}

  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#03404A]/10" />

  <CardContent className="p-6 relative flex flex-col h-full">
    <div className="text-center mb-4">
      <h3 className="text-2xl font-bold text-[#2C2C2C] font-serif mb-3">
        {puzzle.title}
      </h3>
    </div>

    <div className="flex-1 flex flex-col">
      <div className="mb-4 rounded-lg overflow-hidden shadow-md bg-white w-full">
        <img 
          src={getImageForPuzzle(puzzle.title)} 
          alt={puzzle.title}
          className="w-full object-contain"
        />
      </div>

      <div className="space-y-3 mt-auto">
        <Button
          onClick={() => setShowHints(true)}
          className="w-full bg-[#F5D547] hover:bg-[#E87E04] text-[#03404A] font-semibold"
          variant="default"
        >
          View Hints
        </Button>

        <Button
          onClick={() => setShowAnswer(true)}
          className="w-full bg-[#03404A] hover:bg-[#022F37] text-white"
          variant="default"
        >
          Check Answer
        </Button>
      </div>

      {isSolved && (
        <div className="mt-4 pt-4 border-t border-[#F5D547]/60">
          <div className="text-center">
            <p className="text-sm text-[#03404A] font-medium">Answer:</p>
            <p className="text-lg font-bold text-[#2C2C2C] capitalize">{getDisplayAnswer(puzzle.answer)}</p>
          </div>
          {puzzle.title.toLowerCase() === 'the final letter' && (
            <div className="mt-3 pt-3 border-t border-[#F5D547]/40">
              <p className="text-sm text-center text-[#03404A] font-medium italic">
                Open the last envelope after solving this puzzle
              </p>
            </div>
          )}
        </div>
      )}

      {/* <div className="mt-4 pt-4 border-t border-[#F5D547]/40">
        <div className="text-xs text-[#03404A]/70 text-center">
           Optional footer text 
        </div>
      </div> */}
    </div>
  </CardContent>
</Card>

      <HintModal
        isOpen={showHints}
        onClose={() => setShowHints(false)}
        puzzle={puzzle}
        puzzleIndex={puzzleIndex}
      />

      <AnswerModal
        isOpen={showAnswer}
        onClose={() => setShowAnswer(false)}
        puzzle={puzzle}
        puzzleIndex={puzzleIndex}
        onSolved={onSolved}
      />
    </>
  );
};

export default PuzzleCard;
