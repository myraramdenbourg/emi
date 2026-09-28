import { useState } from "react";
import { Menu, Pause, Play, Timer } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { actions, elapsedMs, formatTime, useGame, useNow } from "@/lib/gameState";

const TopBar = () => {
  const s = useGame();
  const running = !!s.runningSince && !s.finishedMs;
  const now = useNow(running);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const paused = !running && !s.finishedMs;

  const item = "block w-full text-left min-h-[48px] py-3 border-b border-rule/50 font-display uppercase tracking-[0.15em] text-sm text-ink";

  return (
    <div className="flex items-center justify-between gap-2 text-ink">
      <div className="flex items-center gap-2 text-sm font-display tabular-nums">
        <Timer className="w-4 h-4 opacity-70" />
        <span role="timer" aria-label="Elapsed time" aria-live="off" className={paused ? "opacity-50" : ""}>{formatTime(elapsedMs(s, now))}</span>
        {paused && <span className="font-hand text-lg text-rule-text leading-none">paused</span>}
        {!s.finishedMs && (
          <button
            onClick={running ? actions.pause : actions.resume}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center opacity-70 hover:opacity-100"
            aria-label={running ? "Pause timer" : "Resume timer"}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>
      <button onClick={() => setMenu(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent className="paper bg-paper border-l-2 border-rule text-ink">
          <SheetHeader>
            <SheetTitle className="font-display tracking-[0.2em] uppercase text-ink text-left">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate the Market Log, manage the timer, or reset your journey.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 border-t border-rule/50">
            <button className={item} onClick={() => { actions.go("log"); setMenu(false); }}>Market Log</button>
            <button className={item} onClick={() => { actions.go("howto"); setMenu(false); }}>How to Play</button>
            {!s.finishedMs && (
              <button className={item} onClick={() => { running ? actions.pause() : actions.resume(); setMenu(false); }}>
                {running ? "Pause Timer" : "Resume Timer"}
              </button>
            )}
            <button className={`${item} text-rule-text`} onClick={() => { setMenu(false); setConfirm(true); }}>Reset Game</button>
          </nav>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="paper bg-paper border-2 border-rule text-ink rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-ink">Start over?</AlertDialogTitle>
            <AlertDialogDescription className="text-ink/75">
              This will erase your puzzle progress and reset your timer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-ink/40 bg-transparent text-ink min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={actions.reset} className="rounded-none bg-rule-text text-paper hover:bg-rule-text/90 min-h-[44px]">
              Reset Journey
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TopBar;
