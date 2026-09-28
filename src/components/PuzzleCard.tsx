import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import HintModal from "./HintModal";
import AnswerModal from "./AnswerModal";
import { PuzzleData } from "@/types/puzzle";
import { trackEvent } from "@/lib/analytics";

interface PuzzleCardProps {
  puzzle: PuzzleData;
  puzzleIndex: number;
  isSolved: boolean;
  onSolved: () => void;
}

const getIconForPuzzle = (title: string) => {
  switch (title.toLowerCase()) {
    case 'coffee': return '/assets/icons/coffee.png';
    case 'fish': return '/assets/icons/fish.png';
    case 'ferris wheel': return '/assets/icons/ferris.png';
    case 'cheese': return '/assets/icons/cheese.png';
    case 'gum wall': return '/assets/icons/gum.png';
    case 'flowers': return '/assets/icons/flowers.png';
    case 'pigs': return '/assets/icons/pigs.png';
    case 'post alley': return '/assets/icons/postalley.png';
    case 'produce': return '/assets/icons/produce.png';
    default: return '';
  }
};

const PuzzleCard = ({ puzzle, puzzleIndex, isSolved, onSolved }: PuzzleCardProps) => {
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const getDisplayAnswer = (answer: string | string[]): string =>
    Array.isArray(answer) ? answer[0] : answer;

  const openAnswer = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    trackEvent('check_answer', {}, puzzleIndex, puzzle.title);
    setShowAnswer(true);
  };

  const openHints = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    trackEvent('view_hints', {}, puzzleIndex, puzzle.title);
    setShowHints(true);
  };

  return (
    <>
      <Card
        onClick={() => openAnswer()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openAnswer();
          }
        }}
        className={`group relative overflow-hidden border-2 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 flex flex-col focus:outline-none focus:ring-2 focus:ring-[#F5D547] ${
          isSolved
            ? 'bg-[#F4EFD8] border-[#03404A]/40'
            : 'bg-gradient-to-br from-[#FFFDF5] to-[#F5D547]/10 border-[#03404A]'
        }`}
        style={{
          backgroundImage: isSolved
            ? "repeating-linear-gradient(45deg, rgba(3,64,74,0.04) 0 2px, transparent 2px 12px)"
            : "repeating-linear-gradient(0deg, rgba(3,64,74,0.025) 0 1px, transparent 1px 6px)",
        }}
      >
        {/* Postal-stamp SOLVED overlay */}
        {isSolved && (
          <div className="pointer-events-none absolute top-4 right-4 z-20 animate-stamp-in">
            <div
              className="border-[3px] border-[#A6342B] text-[#A6342B] px-3 py-1 font-serif font-extrabold tracking-[0.2em] text-sm uppercase"
              style={{
                boxShadow: 'inset 0 0 0 2px rgba(166,52,43,0.15)',
                background: 'rgba(255,253,245,0.6)',
              }}
            >
              Solved
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#03404A]/10 pointer-events-none" />

        <CardContent className="p-6 relative flex flex-col h-full">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-[#2C2C2C] font-serif mb-3 tracking-wide">
              {puzzle.title}
            </h3>
          </div>

          <div className="flex-1 flex flex-col">
            <div className={`mb-4 mx-auto w-full max-w-[220px] rounded-lg overflow-hidden shadow-md bg-[#FFFDF5] border-2 border-[#03404A] relative transition-transform duration-300 ${!isSolved ? 'group-hover:scale-[1.02]' : ''}`}>
              <div className="aspect-square flex items-center justify-center p-4">
                {puzzle.title.toLowerCase() === 'the final letter' ? (
                  <span className={`text-7xl font-serif font-extrabold text-[#A6342B] transition-all duration-500 ${isSolved ? 'saturate-50 opacity-90' : ''}`}>?</span>
                ) : (
                  <img
                    src={getIconForPuzzle(puzzle.title)}
                    alt={puzzle.title}
                    className={`max-w-full max-h-full object-contain transition-all duration-500 ${isSolved ? 'saturate-50 opacity-90' : ''}`}
                  />
                )}
              </div>
              {isSolved && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/20">
                  <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-auto" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={openAnswer}
                className="w-full bg-[#F5D547] hover:bg-[#e8c734] text-[#03404A] font-semibold shadow-sm h-11"
              >
                {isSolved ? 'Revisit Answer' : 'Enter Answer'}
              </Button>

              <Button
                onClick={openHints}
                variant="ghost"
                className="w-full text-[#03404A]/70 hover:text-[#03404A] hover:bg-[#03404A]/5 font-normal h-9 text-sm"
              >
                Need a nudge? View hints
              </Button>
            </div>

            {isSolved && (
              <div className="mt-4 pt-4 border-t border-dashed border-[#03404A]/40 animate-fade-in">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-[#03404A]/60 font-medium">Answer</p>
                  <p className="text-lg font-bold text-[#2C2C2C] capitalize font-serif">
                    {getDisplayAnswer(puzzle.answer)}
                  </p>
                </div>
                {puzzle.title.toLowerCase() === 'the final letter' && (
                  <div className="mt-3 pt-3 border-t border-dashed border-[#03404A]/40">
                    <p className="text-sm text-center text-[#03404A] font-medium italic">
                      Open the last envelope after solving this puzzle
                    </p>
                  </div>
                )}
              </div>
            )}
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
