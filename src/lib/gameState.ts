import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "eotm_journey_v1";

export type View = "welcome" | "log" | "final" | "howto" | { puzzle: string };

export interface GameState {
  introDone: boolean;
  startedAt: number | null;
  accumulatedMs: number;
  runningSince: number | null;
  finishedMs: number | null;
  solved: string[];
  hintsOpened: Record<string, number>;
  wrongAttempts: Record<string, number>;
  celebrated: boolean;
  view: View;
}

const initial: GameState = {
  introDone: false,
  startedAt: null,
  accumulatedMs: 0,
  runningSince: null,
  finishedMs: null,
  solved: [],
  hintsOpened: {},
  wrongAttempts: {},
  celebrated: false,
  view: "welcome",
};

const load = (): GameState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return initial;
};

let state: GameState = load();
let storageOk = (() => {
  try {
    localStorage.setItem("eotm_probe", "1");
    localStorage.removeItem("eotm_probe");
    return true;
  } catch {
    return false;
  }
})();
export const isStorageOk = () => storageOk;
const listeners = new Set<() => void>();

export const setGame = (fn: (s: GameState) => GameState) => {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    // Private mode, disabled, or full storage: keep playing in memory, but tell the player.
    storageOk = false;
  }
  listeners.forEach((l) => l());
};

export const useGame = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );

export const elapsedMs = (s: GameState, now = Date.now()) => {
  if (s.finishedMs != null) return Math.max(0, s.finishedMs);
  const live = s.runningSince ? Math.max(0, now - s.runningSince) : 0;
  return Math.max(0, (s.accumulatedMs || 0) + live);
};

export const actions = {
  begin: () =>
    setGame((s) => {
      const now = Date.now();
      return { ...s, introDone: true, startedAt: s.startedAt ?? now, runningSince: s.startedAt ? s.runningSince : now, view: "log" };
    }),
  go: (view: View) => setGame((s) => ({ ...s, view })),
  pause: () =>
    setGame((s) =>
      s.runningSince && !s.finishedMs
        ? (() => {
            const now = Date.now();
            return { ...s, accumulatedMs: elapsedMs(s, now), runningSince: null };
          })()
        : s,
    ),
  resume: () => setGame((s) => (!s.runningSince && !s.finishedMs && s.introDone ? { ...s, runningSince: Date.now() } : s)),
  finish: () => setGame((s) => (s.finishedMs ? s : { ...s, finishedMs: elapsedMs(s), runningSince: null })),
  solve: (key: string) => setGame((s) => (s.solved.includes(key) ? s : { ...s, solved: [...s.solved, key] })),
  wrong: (key: string) => setGame((s) => ({ ...s, wrongAttempts: { ...s.wrongAttempts, [key]: (s.wrongAttempts[key] ?? 0) + 1 } })),
  openHint: (key: string, n: number) =>
    setGame((s) => ({ ...s, hintsOpened: { ...s.hintsOpened, [key]: Math.max(s.hintsOpened[key] ?? 0, n) } })),
  celebrate: () => setGame((s) => ({ ...s, celebrated: true })),
  reset: () => setGame(() => ({ ...initial })),
};

export const useNow = (active: boolean) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    // Refresh immediately so a stale "now" from before a pause never precedes runningSince.
    setNow(Date.now());
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [active]);
  return now;
};

export const formatTime = (ms: number) => {
  const t = Math.max(0, Math.floor((Number.isFinite(ms) ? ms : 0) / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = t % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
};

export const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
