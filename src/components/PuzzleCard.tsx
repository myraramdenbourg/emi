
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
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjZEQzlGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNzIiIGZpbGw9IiMwMzQwNEEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj4/PC90ZXh0Pgo8L3N2Zz4K';
    default:
      return '/assets/cheese_front.png';
  }
};

const PuzzleCard = ({ puzzle, puzzleIndex, isSolved, onSolved }: PuzzleCardProps) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
        {isSolved && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-green-600 hover:bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Solved
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-900/10" />
        
        <CardContent className="p-6 relative flex flex-col h-full">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-amber-900 font-serif mb-3">
              {puzzle.title}
            </h3>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="mb-4 rounded-lg overflow-hidden shadow-md bg-white w-full" >
              <img 
                src={getImageForPuzzle(puzzle.title)} 
                alt={puzzle.title}
                className="w-full object-contain"
              />
            </div>

            <div className="space-y-3 mt-auto">
              <Button
                onClick={() => setShowHints(true)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                variant="default"
              >
                View Hints
              </Button>
              
              <Button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                variant="default"
              >
                Check Answer
              </Button>
            </div>

            {isSolved && (
              <div className="mt-4 pt-4 border-t border-amber-200">
                <div className="text-center">
                  <p className="text-sm text-amber-700 font-medium">Answer:</p>
                  <p className="text-lg font-bold text-amber-900 capitalize">{puzzle.answer}</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="text-xs text-amber-600 text-center">
                {/* Pike Place Market • Seattle, WA */}
              </div>
            </div>
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
