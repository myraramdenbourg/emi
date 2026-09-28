import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { actions, elapsedMs, formatTime, normalize, useGame, useNow } from "@/lib/gameState";
import { allPuzzles, journeyPuzzles, JourneyPuzzle } from "@/lib/journeyData";
import { trackEvent } from "@/lib/analytics";
import { HandCheck, HandCircle, LockMark } from "./Marks";
import { Completion } from "./Completion";

// Levenshtein distance for "close answer" nudges
const editDistance = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
};

// True when the guess is nearly right: small typo, shared long prefix
// (e.g. "panorama" vs "panoramic views"), or one contains the other.
const isClose = (guess: string, answers: string[]): boolean => {
  const g = normalize(guess);
  if (g.length < 4) return false;
  return answers.some((a) => {
    const t = normalize(a);
    if (t === g) return false;
    if (t.startsWith(g) || g.startsWith(t)) return true;
    let prefix = 0;
    while (prefix < Math.min(g.length, t.length) && g[prefix] === t[prefix]) prefix++;
    if (prefix >= 5) return true;
    return editDistance(g, t) <= 2;
  });
};

const primaryBtn =
  "w-full min-h-[56px] bg-ink text-paper font-display uppercase tracking-[0.2em] text-sm hover:bg-ink/90 active:translate-y-px transition";

const Rule = ({ double = false }: { double?: boolean }) => (
  <div className={double ? "border-t-2 border-b border-rule h-[6px]" : "border-t border-rule"} />
);

export const Welcome = () => (
  <div className="animate-fade-in">
      <div className="text-center pt-6 pb-8">
        <h1 tabIndex={-1} className="font-body text-ink leading-none">
          <span className="block text-[24px] md:text-[30px] font-normal tracking-normal">Echoes of the</span>
          <span className="block text-[48px] md:text-[68px] font-medium tracking-[0.06em] mt-[6px]">MARKET</span>
        </h1>
      </div>
    <Rule double />
    <p className="text-[14px] text-ink/70 text-center pt-6">Read the introductory letter included with your game before you begin.</p>
    <article className="py-6 px-1 space-y-4 text-ink text-[17px] leading-relaxed">
      <p className="font-hand text-3xl">Dear friend,</p>
      <p>Something has changed at the market. The place I've known all my life feels different, and I believe Grandpa's postcards might hold the answers.</p>
      <p>Will you help me solve the puzzles he left in them?</p>
      <p>Use this Market Log to keep track of your answers. If you get stuck, I'll do my best to guide you.</p>
      <p>Thank you for helping me.</p>
      <div className="pt-2">
        <p className="font-hand text-4xl text-rule-text">Emi</p>
      </div>
    </article>
    <Rule />
    <section className="py-6 text-ink" aria-labelledby="before-you-begin">
      <h2 id="before-you-begin" className="font-display text-sm uppercase tracking-[0.2em] font-semibold">Before you begin</h2>
      <ul className="mt-3 pl-5 list-disc space-y-2 text-[16px] leading-snug">
        <li>Solve the nine postcards in any order.</li>
        <li>Select the matching postcard in the Market Log to check your answer.</li>
        <li>Hints are optional and become more specific as you open them.</li>
        <li>Keep both envelopes sealed until the companion tells you to open them.</li>
        <li>You can pause the timer at any time.</li>
      </ul>
    </section>
    <Rule />
    <div className="pt-6 pb-4">
      <button className={primaryBtn} onClick={() => { trackEvent("begin_journey"); actions.begin(); }}>
        Start Journey &amp; Timer
      </button>
    </div>
  </div>
);

export const MarketLog = ({ compact = false }: { compact?: boolean }) => {
  const s = useGame();
  const count = journeyPuzzles.filter((p) => s.solved.includes(p.key)).length;
  const allDone = count === journeyPuzzles.length;
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (allDone && !s.celebrated) {
      setCelebrating(true);
      actions.celebrate();
      const t = setTimeout(() => setCelebrating(false), 3200);
      return () => clearTimeout(t);
    }
  }, [allDone, s.celebrated]);

  return (
    <div className={`animate-fade-in relative ${celebrating ? "animate-brighten" : ""}`}>
      <Rule />
      {compact ? (
        <h2 className="font-display font-medium text-center text-ink tracking-wide text-xl py-5">MARKET LOG</h2>
      ) : (
        <h1 tabIndex={-1} className="font-display font-medium text-center text-ink tracking-wide text-3xl py-7">MARKET LOG</h1>
      )}
      <Rule double />
      <ul>
        {journeyPuzzles.map((p) => {
          const done = s.solved.includes(p.key);
          return (
            <li key={p.key} className="border-b border-rule">
              <button
                onClick={() => { trackEvent("open_puzzle", {}, p.index, p.name); actions.go({ puzzle: p.key }); }}
                aria-label={`${p.name.charAt(0) + p.name.slice(1).toLowerCase()}, ${done ? "solved" : "not yet solved"}`}
                className="w-full flex items-center gap-4 min-h-[68px] py-2 text-left group"
              >
                <img src={p.icon} alt="" className="w-11 h-11 object-contain shrink-0 mix-blend-multiply" />
                <span className="flex-1 font-display text-lg sm:text-xl text-ink tracking-wide border-r border-rule self-stretch flex items-center pr-2">
                  {p.name}
                </span>
                <span className="w-12 h-12 shrink-0 flex items-center justify-center">
                  {done ? <HandCheck className="w-10 h-10" animate={celebrating} /> : <HandCircle className="w-9 h-9 group-hover:opacity-70" />}
                </span>
              </button>
            </li>
          );
        })}
        <li className="border-b border-rule">
          {allDone ? (
            <button
              onClick={() => { trackEvent("open_final"); actions.go({ puzzle: "final" }); }}
              aria-label={`Final Letter, ${s.solved.includes("final") ? "solved" : "unlocked"}`}
              className="w-full flex items-center gap-4 min-h-[76px] py-2 text-left bg-rule/10 hover:bg-rule/15 transition"
            >
              <span className="w-11 shrink-0" aria-hidden="true" />

              <span className="flex-1">
                <span className="block font-display text-lg sm:text-xl text-ink tracking-wide">FINAL LETTER</span>
                <span className="block font-display text-xs tracking-[0.3em] text-rule-text">
                  {s.solved.includes("final") ? "SOLVED" : "UNLOCKED — OPEN ENVELOPE 1"}
                </span>
              </span>
              <span className="w-12 text-center text-rule-text text-xl">→</span>
            </button>
          ) : (
            <div className="flex items-center gap-4 min-h-[68px] py-2 opacity-60" aria-label="Final Letter, locked">
              <LockMark className="w-10 h-10 shrink-0" />
              <span className="flex-1 font-display text-lg sm:text-xl text-ink tracking-wide">FINAL LETTER</span>
              <span className="w-12 text-center font-hand text-lg text-ink/70">locked</span>
            </div>
          )}
        </li>
      </ul>
      <div className="border-b-2 border-rule mt-[3px]" />
      <p className="text-center font-hand text-2xl text-ink/80 pt-6">
        {count} of {journeyPuzzles.length} stalls explored
      </p>
    </div>
  );
};

const HintCard = ({ p, hintIndex, opened, onReveal }: { p: JourneyPuzzle; hintIndex: number; opened: boolean; onReveal: (text: string) => void }) => {
  const [expanded, setExpanded] = useState(opened);
  const contentId = `hint-${p.key}-${hintIndex}`;
  return (
    <div className="border-t border-rule">
      <button
        aria-expanded={opened && expanded}
        aria-controls={contentId}
        onClick={() => {
          if (!opened) {
            trackEvent("unlock_hint", { hintIndex }, p.index, p.name);
            actions.openHint(p.key, hintIndex + 1);
            onReveal(`Hint ${hintIndex + 1}: ${p.hints[hintIndex]}`);
            setExpanded(true);
          } else setExpanded((v) => !v);
        }}
        className="w-full flex items-center gap-3 min-h-[52px] text-left"
      >
        <span className="font-hand text-2xl text-rule-text w-6" aria-hidden="true">{hintIndex + 1}</span>
        <span className="flex-1 font-display text-sm uppercase tracking-[0.15em] text-ink">Hint {hintIndex + 1}</span>
        <span className="text-xs font-display tracking-widest text-rule-text" aria-hidden="true">{opened && expanded ? "CLOSE" : "OPEN"}</span>
      </button>
      <div id={contentId} hidden={!opened || !expanded} className="animate-unfold origin-top pb-4 pl-9 pr-1 text-ink/90 text-[16px] leading-relaxed">
        <p>{p.hints[hintIndex]}</p>
      </div>
    </div>
  );
};

export const PuzzlePage = ({ puzzleKey }: { puzzleKey: string }) => {
  const s = useGame();
  const p = allPuzzles.find((x) => x.key === puzzleKey)!;
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "empty" | "wrong" | "close" | "right">(s.solved.includes(p.key) ? "right" : "idle");
  const [closeMsg, setCloseMsg] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [hintAnnouncement, setHintAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const answerRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const submittedCorrect = useRef(false);
  const opened = s.hintsOpened[p.key] ?? 0;
  const wrongs = s.wrongAttempts[p.key] ?? 0;
  const alreadySolved = s.solved.includes(p.key);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (status === "wrong" || status === "close" || status === "empty") answerRef.current?.focus();
    if (status === "right" && submittedCorrect.current) successRef.current?.focus();
  }, [status]);

  const errorId = `answer-error-${p.key}`;
  const error = status === "wrong" || status === "close" || status === "empty";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const ok = p.answers.some((a) => normalize(a) === normalize(value));
    const nudge = p.nudges?.find((n) => n.matches.some((m) => normalize(m) === normalize(value)));
    const close = !ok && (!!nudge || isClose(value, p.answers));
    trackEvent("check_answer", { answer: value, correct: ok, close }, p.index, p.name);
    if (ok) {
      submittedCorrect.current = true;
      setStatus("right");
      actions.solve(p.key);
    } else {
      setStatus(close ? "close" : "wrong");
      setCloseMsg(close && nudge ? nudge.message : null);
      actions.wrong(p.key);
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={() => actions.go("log")} className="flex items-center gap-1 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70">
        <ChevronLeft className="w-4 h-4" /> Market Log
      </button>
      <Rule />
      <div className="flex items-center justify-center gap-4 py-7">
        <img src={p.icon} alt="" className="w-14 h-14 object-contain mix-blend-multiply" />
        <h1 tabIndex={-1} className="font-display text-3xl font-medium text-ink tracking-wide">{p.name}</h1>
      </div>
      <Rule double />
      <p className="font-hand text-2xl text-center text-ink/85 py-6 leading-snug">{p.line}</p>
      {p.key === "final" && !alreadySolved && (
        <p className="font-display text-sm uppercase tracking-[0.25em] text-rule-text text-center pb-6 animate-fade-in">
          Open envelope 1
        </p>
      )}

      {status === "right" ? (
        <div className="text-center py-6">
          <HandCheck className="w-20 h-20 mx-auto" animate={!alreadySolved || status === "right"} />
          <h2 ref={successRef} tabIndex={-1} className="font-display text-2xl text-ink mt-2">That's it!</h2>
          <p role="status" className="sr-only">Correct answer. {p.name} solved.{p.key === "final" ? " Open envelope 2." : " Added to your Market Log."}</p>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-ink/70 mt-3">Answer: <span className="text-rule-text tracking-[0.2em]">{p.answers[0]}</span></p>
          {p.key === "final" ? (
            <>
              <p className="font-display text-sm uppercase tracking-[0.25em] text-rule-text mt-3">Open envelope 2</p>
              <button onClick={() => actions.go("final")} className="mt-4 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70 underline underline-offset-4">
                Continue →
              </button>
            </>
          ) : (
            <>
              <p className="text-ink/75 mt-1">{p.name.charAt(0) + p.name.slice(1).toLowerCase()} has been added to your Market Log.</p>
              <button onClick={() => actions.go("log")} className="mt-5 min-h-[48px] px-6 border-2 border-ink text-ink font-display text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-ink/5">
                Return to Market Log
              </button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            id="answer"
            ref={answerRef}
            aria-label={`Answer for ${p.name}`}
            aria-invalid={error}
            aria-describedby={error ? errorId : undefined}
            value={value}
            onChange={(e) => { setValue(e.target.value); if (status === "wrong" || status === "close" || status === "empty") { setStatus("idle"); setCloseMsg(null); } }}
            placeholder="Enter your answer..."
            autoComplete="off"
            autoCapitalize="characters"
            className="w-full min-h-[56px] bg-transparent border-0 border-b-2 border-ink/60 focus:border-rule focus:outline-none px-1 text-[18px] font-display tracking-wider text-ink placeholder:text-ink/85"
          />
          <button type="submit" className={primaryBtn}>Enter Answer</button>
          {status === "wrong" && (
            <div key={wrongs} id={errorId} role="status" className="text-center pt-2 animate-fade-in">
              <p className="font-display text-ink">Not quite.</p>
            </div>
          )}
          {status === "close" && (
            <div key={wrongs} id={errorId} role="status" className="text-center pt-2 animate-fade-in">
              {closeMsg ? (
                <p className="font-display text-ink">{closeMsg}</p>
              ) : (
                <p className="font-display text-ink">So close — you're onto something.</p>
              )}
            </div>
          )}
          {wrongs >= 3 && (
            <p className="text-center font-hand text-xl text-rule-text pt-1">Still stuck? A hint might point you in the right direction.</p>
          )}
        </form>
      )}

      <section className="mt-10">
        <h2 className="font-display text-sm uppercase tracking-[0.25em] text-ink text-center pb-3">Need a hint?</h2>
        <p role="status" className="sr-only">{hintAnnouncement}</p>
        {p.hints.slice(0, opened + 1).map((_, t) => (
          <HintCard key={t} p={p} hintIndex={t} opened={opened > t} onReveal={setHintAnnouncement} />
        ))}
        {opened >= p.hints.length && (
          <div className="border-t border-rule py-4 text-center animate-fade-in">
            {!revealed && !confirmReveal ? (
              <button
                onClick={() => setConfirmReveal(true)}
                className="min-h-[44px] font-display text-sm uppercase tracking-[0.2em] text-rule-text underline underline-offset-4"
              >
                Reveal Solution — Spoiler
              </button>
            ) : !revealed ? (
              <div role="group" aria-labelledby={`confirm-${p.key}`} className="animate-fade-in">
                <p id={`confirm-${p.key}`} className="text-ink">Show the answer to {p.name.charAt(0) + p.name.slice(1).toLowerCase()}? This can't be hidden again.</p>
                <div className="flex justify-center gap-3 mt-3">
                  <button onClick={() => setConfirmReveal(false)} className="min-h-[44px] px-5 border-2 border-ink/50 text-ink font-display text-xs uppercase tracking-[0.2em] rounded-sm">Keep Trying</button>
                  <button
                    autoFocus
                    onClick={() => { trackEvent("reveal_answer", {}, p.index, p.name); setRevealed(true); }}
                    className="min-h-[44px] px-5 bg-ink text-paper font-display text-xs uppercase tracking-[0.2em] rounded-sm"
                  >
                    Yes, Reveal
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-display text-lg tracking-[0.2em] text-ink uppercase animate-unfold">{p.answers[0]}</p>
            )}
          </div>
        )}
        <Rule />
      </section>
    </div>
  );
};

export const FinalScreen = () => {
  const s = useGame();
  const now = useNow(!!s.runningSince && !s.finishedMs);
  const time = formatTime(elapsedMs(s, now));

  if (s.finishedMs) return <Completion time={time} />;

  return (
    <div className="animate-fade-in">
      <button onClick={() => actions.go("log")} className="flex items-center gap-1 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70">
        <ChevronLeft className="w-4 h-4" /> Market Log
      </button>
      <Rule />
      <div className="text-center py-8 space-y-3 text-ink">
        <h1 tabIndex={-1} className="font-display text-3xl font-medium">You found them all.</h1>
        <p className="text-[17px]">Grandpa's postcards have led you as far as they can.</p>
        <p className="text-[17px]">There's one last thing waiting for you.</p>
      </div>
      <Rule double />
      <div className="text-center py-10">
        <p className="font-display text-3xl font-semibold tracking-[0.15em] text-rule-text">OPEN ENVELOPE 2</p>

        <p className="font-hand text-2xl text-ink/85 mt-2">Inside, you'll find Emi's final letter.</p>
      </div>
      <Rule />
      <div className="pt-8">
        <button
          className={primaryBtn}
          onClick={() => {
            const durationMs = elapsedMs(s);
            trackEvent("finish_journey", { durationMs });
            actions.finish();
          }}
        >
          Finish Journey
        </button>
      </div>
    </div>
  );
};

export const HowTo = () => (
  <div className="animate-fade-in">
    <button onClick={() => actions.go("log")} className="flex items-center gap-1 min-h-[44px] font-display text-xs uppercase tracking-[0.2em] text-ink/70">
      <ChevronLeft className="w-4 h-4" /> Market Log
    </button>
    <Rule />
    <h1 tabIndex={-1} className="font-display text-3xl font-medium text-center text-ink py-7">HOW TO PLAY</h1>
    <Rule double />
    <ol className="py-6 space-y-4 text-ink text-[17px] leading-relaxed list-decimal pl-6">
      <li>Solve the postcards in any order — work together around the table.</li>
      <li>When you think you have an answer, tap that stall in the Market Log and enter it.</li>
      <li>Stuck? Open hints one at a time. Each one says a little more.</li>
      <li>Once all nine are found, the Final Letter unlocks and tells you when to open the last envelope.</li>
      <li>Your timer runs in the corner. Pause it any time from the top bar or the menu.</li>
    </ol>
  </div>
);
