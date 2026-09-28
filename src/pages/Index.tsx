import { useGame } from "@/lib/gameState";
import { useAnalytics } from "@/hooks/useAnalytics";
import TopBar from "@/components/journey/TopBar";
import { FinalScreen, HowTo, MarketLog, PuzzlePage, Welcome } from "@/components/journey/Screens";

const Index = () => {
  useAnalytics();
  const s = useGame();
  const view = s.introDone ? s.view : "welcome";

  let body;
  if (view === "welcome") body = <Welcome />;
  else if (view === "final") body = <FinalScreen />;
  else if (view === "howto") body = <HowTo />;
  else if (typeof view === "object") body = <PuzzlePage key={view.puzzle} puzzleKey={view.puzzle} />;
  else body = <MarketLog />;

  return (
    <div className="min-h-screen md:py-10 bg-paper-deep">
      <main
        className="paper bg-paper mx-auto w-full max-w-[520px] min-h-screen md:min-h-0 md:shadow-paper px-6 pb-12"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)", paddingBottom: "max(env(safe-area-inset-bottom), 3rem)" }}
      >
        {s.introDone && <TopBar />}
        {body}
      </main>
    </div>
  );
};

export default Index;
