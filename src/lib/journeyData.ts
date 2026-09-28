import { puzzleData } from "@/data/puzzleData";

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

const ORDER: { title: string; key: string; icon: string; line: string; nudges?: JourneyPuzzle["nudges"] }[] = [
  { title: "COFFEE", key: "coffee", icon: "coffee", line: "The market always smelled like fresh beginnings." },
  { title: "FISH", key: "fish", icon: "fish", line: "Grandpa swore he once caught one mid-air." },
  {
    title: "FERRIS WHEEL",
    key: "ferris",
    icon: "ferris",
    line: "From the top, the whole city felt small enough to hold.",
    nudges: [
      {
        matches: ["panora", "panoramic", "panoramic view"],
        message: "So close — keep going round and round!",
      },
    ],
  },
  { title: "CHEESE", key: "cheese", icon: "cheese", line: "He always asked for a taste before he bought a thing." },
  { title: "GUM WALL", key: "gum", icon: "gum", line: "Every color on that wall was somebody's moment." },
  { title: "FLOWERS", key: "flowers", icon: "flowers", line: "He never left without a bundle for Grandma." },
  { title: "PIGS", key: "pigs", icon: "pigs", line: "A coin for luck, every single visit." },
  { title: "POST ALLEY", key: "postalley", icon: "postalley", line: "Some streets remember more than people do." },
  { title: "PRODUCE", key: "produce", icon: "produce", line: "He knew every stall owner by their first name." },
];

const toJourney = (o: { title: string; key: string; icon: string; line: string; nudges?: JourneyPuzzle["nudges"] }): JourneyPuzzle => {
  const index = puzzleData.findIndex((p) => p.title.toUpperCase() === o.title);
  const p = puzzleData[index];
  return {
    key: o.key,
    name: o.title,
    icon: `/assets/icons/${o.icon}.png`,
    line: o.line,
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
  line: "One last memory, saved for the very end.",
});

export const allPuzzles: JourneyPuzzle[] = [...journeyPuzzles, finalPuzzle];
