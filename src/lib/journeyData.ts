import { puzzleData } from "@/data/puzzleData";
import envelopeAsset from "@/assets/envelope.png.asset.json";

export interface JourneyPuzzle {
  key: string;
  name: string;
  icon: string;
  line: string;
  answers: string[];
  hints: string[];
  index: number;
  nudges?: { matches: string[]; message: string }[];
}

const ORDER: { title: string; key: string; icon: string; nudges?: JourneyPuzzle["nudges"] }[] = [
  { title: "COFFEE", key: "coffee", icon: "coffee" },
  { title: "FISH", key: "fish", icon: "fish" },
  {
    title: "FERRIS WHEEL",
    key: "ferris",
    icon: "ferris",
    nudges: [
      {
        matches: ["panora", "panoramic", "panoramic view"],
        message: "So close — keep going round and round!",
      },
    ],
  },
  { title: "CHEESE", key: "cheese", icon: "cheese" },
  { title: "GUM WALL", key: "gum", icon: "gum" },
  { title: "FLOWERS", key: "flowers", icon: "flowers" },
  { title: "PIGS", key: "pigs", icon: "pigs" },
  { title: "POST ALLEY", key: "postalley", icon: "postalley" },
  { title: "PRODUCE", key: "produce", icon: "produce" },
];

const toJourney = (o: { title: string; key: string; icon: string; nudges?: JourneyPuzzle["nudges"] }): JourneyPuzzle => {
  const index = puzzleData.findIndex((p) => p.title.toUpperCase() === o.title);
  const p = puzzleData[index];
  return {
    key: o.key,
    name: o.title,
    icon: `/assets/icons/${o.icon}.png`,
    line: p.description,
    answers: Array.isArray(p.answer) ? p.answer : [p.answer],
    hints: p.hints,
    index,
    nudges: o.nudges,
  };
};

export const journeyPuzzles: JourneyPuzzle[] = ORDER.map(toJourney);

export const finalPuzzle: JourneyPuzzle = toJourney({
  title: "THE FINAL LETTER",
  key: "final",
  icon: "final",
});

export const allPuzzles: JourneyPuzzle[] = [...journeyPuzzles, finalPuzzle];
