
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
      return 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=600&fit=crop';
    case 'fish':
      return 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=600&fit=crop';
    case 'ferris wheel':
      return 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop';
    case 'cheese':
      return 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop';
    case 'gum wall':
      return 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&h=600&fit=crop';
    case 'flowers':
      return 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=600&fit=crop';
    case 'pigs':
      return 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=600&fit=crop';
    case 'post alley':
      return 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop';
    case 'produce':
      return 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop';
    case 'the final letter':
      return 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&h=600&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=600&fit=crop';
  }
};

const PuzzleCard = ({ puzzle, puzzleIndex, isSolved, onSolved }: PuzzleCardProps) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {isSolved && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-green-600 hover:bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Solved
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-900/10" />
        
        <CardContent className="p-6 relative">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              {getIconForPuzzle(puzzle.title)}
            </div>
            <h3 className="text-lg font-bold text-amber-900 font-serif mb-3">
              {puzzle.title}
            </h3>
            <div className="w-full h-48 mb-4 rounded-lg overflow-hidden shadow-md">
              <img 
                src={getImageForPuzzle(puzzle.title)} 
                alt={puzzle.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-3">
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

          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="text-xs text-amber-600 text-center">
              {/* Pike Place Market • Seattle, WA */}
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
