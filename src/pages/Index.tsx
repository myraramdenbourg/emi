import { useEffect, useRef, useState } from "react";
import { isStorageOk, useGame } from "@/lib/gameState";
import { journeyPuzzles } from "@/lib/journeyData";
import { useAnalytics } from "@/hooks/useAnalytics";
import TopBar from "@/components/journey/TopBar";
import { FinalScreen, HowTo, MarketLog, PuzzlePage, Welcome } from "@/components/journey/Screens";

const Index = () => {
  useAnalytics();
  const s = useGame();
  const view = s.introDone ? s.view : "welcome";
  const viewKey = typeof view === "object" ? `puzzle-${view.puzzle}` : view === "final" && s.finishedMs !== null ? "complete" : view;
  const previousView = useRef(viewKey);
  const explored = journeyPuzzles.filter((p) => s.solved.includes(p.key)).length;
  const previousExplored = useRef(explored);
  const [unlockAnnouncement, setUnlockAnnouncement] = useState("");

  useEffect(() => {
    if (previousExplored.current < journeyPuzzles.length && explored === journeyPuzzles.length) {
      setUnlockAnnouncement("All nine postcards explored. Final Letter unlocked.");
    }
    previousExplored.current = explored;
  }, [explored]);

  useEffect(() => {
    if (previousView.current !== viewKey) {
      const heading = document.querySelector<HTMLElement>("main h1");
      // Radix returns focus to the menu trigger as it closes; move it to the new heading afterward.
      const focusTimer = window.setTimeout(() => heading?.focus(), 350);
      previousView.current = viewKey;
      return () => window.clearTimeout(focusTimer);
    }
  }, [viewKey]);

  let body;
  if (view === "welcome") body = <Welcome />;
  else if (view === "final") body = <FinalScreen />;
  else if (view === "howto") body = <HowTo />;
  else if (typeof view === "object") body = <PuzzlePage key={view.puzzle} puzzleKey={view.puzzle} />;
  else body = <MarketLog />;

  const isPuzzle = typeof view === "object";

  return (
    <div className="min-h-screen md:py-10 bg-paper-deep">
      <main
        className={`paper bg-paper mx-auto w-full min-h-screen md:min-h-0 md:shadow-paper px-6 md:px-10 pb-12 ${
          isPuzzle
            ? "max-w-[520px] md:max-w-[680px] lg:max-w-[1120px]"
            : "max-w-[520px] md:max-w-[680px]"
        }`}
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)", paddingBottom: "max(env(safe-area-inset-bottom), 3rem)" }}
      >
        <p role="status" className="sr-only">{unlockAnnouncement}</p>
        {s.introDone && <TopBar />}
        {!isStorageOk() && (
          <p role="alert" className="my-3 border-2 border-rule/60 bg-paper-deep/60 px-3 py-2 text-[15px] text-ink">
            This browser isn't saving progress, so a refresh will start over. Keep this page open, or turn off private browsing.
          </p>
        )}
        {isPuzzle ? (
          <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
            <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 border-r border-rule pr-8">
              <MarketLog compact />
            </aside>
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">{body}</div>
          </div>
        ) : (
          body
        )}
      </main>
    </div>
  );
};

export default Index;
