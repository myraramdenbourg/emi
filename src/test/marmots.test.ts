import { describe, it, expect } from "vitest";
import { puzzleData } from "@/data/puzzleData";
import { normalize } from "@/lib/gameState";

// The Marmots postcard: title and accepted answer, per the user's wording.
const marmots = puzzleData.find((p) => p.title === "MARMOTS");
const list: string[] = marmots
  ? Array.isArray(marmots.answer)
    ? marmots.answer
    : [marmots.answer]
  : [];
const accepted = (value: string) => list.some((a) => normalize(a) === normalize(value));

describe("MARMOTS postcard", () => {
  it("is named MARMOTS and no postcard is named PIGS", () => {
    expect(marmots).toBeDefined();
    expect(puzzleData.some((p) => p.title === "PIGS")).toBe(false);
    expect(marmots!.hints.some((h) => /\bmarmots?\b/i.test(h))).toBe(true);
    expect(marmots!.hints.some((h) => /\bpigs?\b/i.test(h) && !/pigpen/i.test(h))).toBe(false);
  });

  it("accepts 'stall mascot' ignoring case, spacing and punctuation", () => {
    expect(accepted("stall mascot")).toBe(true);
    expect(accepted("  StAll   MasCoT  ")).toBe(true);
    expect(accepted("STALL-MASCOT")).toBe(true);
  });

  it("rejects the old answer and unrelated guesses", () => {
    expect(accepted("state fair")).toBe(false);
    expect(accepted("marmot")).toBe(false);
  });
});
