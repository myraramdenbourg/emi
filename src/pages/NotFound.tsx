import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const primaryBtn =
  "w-full min-h-[56px] bg-ink text-paper font-display uppercase tracking-[0.2em] text-sm hover:bg-ink/90 active:translate-y-px transition";

const Rule = ({ double = false }: { double?: boolean }) => (
  <div className={double ? "border-t-2 border-b border-rule h-[6px]" : "border-t border-rule"} />
);

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-paper-deep flex items-center justify-center p-4">
      <div className="paper bg-paper w-full max-w-[520px] shadow-paper px-8 py-12 text-ink animate-fade-in">
        <div className="text-center pb-8">
          <p className="font-display text-xs tracking-[0.35em] text-rule-text uppercase">Echoes of the</p>
          <h1 className="font-display text-4xl font-semibold tracking-[0.12em] mt-1">MARKET</h1>
        </div>
        <Rule double />
        <div className="text-center py-10 px-1">
          <p className="font-hand text-6xl text-rule-text leading-none">404</p>
          <p className="font-body text-[17px] leading-relaxed mt-6">
            This page isn't in the Market Log.
          </p>
          <p className="font-body text-[17px] leading-relaxed">
            Perhaps it wandered off between the stalls — but your journey is still safe, right where you left it.
          </p>
        </div>
        <Rule />
        <div className="pt-8">
          <a href="/" className="block">
            <button className={primaryBtn}>Return to your Market Log →</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
