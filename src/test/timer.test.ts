import { describe, it, expect, vi, beforeEach } from "vitest";

describe("timer: pause → reload → long pause → resume", () => {
  beforeEach(() => { localStorage.clear(); vi.resetModules(); vi.useFakeTimers(); });

  it("never shows negative time", async () => {
    vi.setSystemTime(1_000_000);
    let g = await import("@/lib/gameState");
    g.actions.begin();
    vi.setSystemTime(1_000_000 + 60_000);
    g.actions.pause();
    // reload
    vi.resetModules();
    g = await import("@/lib/gameState");
    const staleNow = Date.now(); // UI "now" captured while paused
    vi.setSystemTime(Date.now() + 4 * 3600_000); // long pause
    g.actions.resume();
    let s = JSON.parse(localStorage.getItem("eotm_journey_v1")!);
    expect(s.accumulatedMs).toBe(60_000);
    expect(g.elapsedMs(s, staleNow)).toBe(60_000);
    expect(g.formatTime(g.elapsedMs(s, staleNow))).toBe("00:01:00");
    vi.setSystemTime(Date.now() + 5_000);
    s = JSON.parse(localStorage.getItem("eotm_journey_v1")!);
    expect(g.elapsedMs(s)).toBe(65_000);
    expect(g.formatTime(-64_000)).toBe("00:00:00");
  });
});
