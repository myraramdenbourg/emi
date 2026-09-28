import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Instagram,
  LogOut,
  MousePointerClick,
  Share2,
  Target,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { allPuzzles } from "@/lib/journeyData";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  puzzle_index: number | null;
  puzzle_title: string | null;
  session_id: string | null;
  created_at: string;
}

interface PuzzleMetrics {
  puzzleName: string;
  uniqueUsers: number;
  hintClickRate: number;
  correctnessRate: number;
  avgHintsPerUser: number;
  commonWrongAnswers: { answer: string; count: number }[];
}

const chartInk = "hsl(var(--ink))";
const chartRule = "hsl(var(--rule))";
const chartPaper = "hsl(var(--paper))";

const Rule = ({ double = false }: { double?: boolean }) => (
  <div className={double ? "h-[6px] border-y-2 border-rule" : "border-t border-rule/70"} />
);

const MetricHelp = ({ children }: { children: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center cursor-help" aria-label="More information">
        <HelpCircle className="h-4 w-4 text-rule-text" />
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs bg-ink text-paper"><p>{children}</p></TooltipContent>
  </Tooltip>
);

const formatDuration = (milliseconds: number | null) => {
  if (milliseconds == null || !Number.isFinite(milliseconds)) return "—";
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};

const normalizeWrongAnswer = (answer: string) => answer.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const Dashboard = () => {
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([]);
  const [dateRange, setDateRange] = useState("30");
  const [selectedPuzzle, setSelectedPuzzle] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();
        if (roleError || !roleData) {
          toast({ title: "Access denied", description: "You must be an admin to view the Market Log report.", variant: "destructive" });
          navigate("/");
          return;
        }
        setIsAdmin(true);
        const { data, error } = await supabase.from("analytics_events").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setAllEvents((data ?? []) as AnalyticsEvent[]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "The report could not be loaded.";
        toast({ title: "Error loading analytics", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate, toast]);

  const periodEvents = useMemo(() => {
    const start = startOfDay(subDays(new Date(), Number.parseInt(dateRange, 10)));
    const end = endOfDay(new Date());
    return allEvents.filter((event) => {
      const date = new Date(event.created_at);
      return date >= start && date <= end;
    });
  }, [allEvents, dateRange]);

  const filteredEvents = useMemo(
    () => selectedPuzzle === "all" ? periodEvents : periodEvents.filter((event) => event.puzzle_title === selectedPuzzle),
    [periodEvents, selectedPuzzle],
  );

  const metrics = useMemo(() => {
    const uniqueSessions = new Set(filteredEvents.flatMap((event) => event.session_id ? [event.session_id] : []));
    const hintSessions = new Set(filteredEvents.filter((event) => ["unlock_hint", "view_hints"].includes(event.event_type)).flatMap((event) => event.session_id ? [event.session_id] : []));
    const answers = filteredEvents.filter((event) => event.event_type === "check_answer");
    const correct = answers.filter((event) => event.event_data?.correct === true).length;
    const finalTitle = allPuzzles[allPuzzles.length - 1]?.name;
    const finalSolvers = new Set(periodEvents.filter((event) => event.event_type === "check_answer" && event.event_data?.correct === true && event.puzzle_title === finalTitle).flatMap((event) => event.session_id ? [event.session_id] : []));

    const sessionStarts = new Map<string, number>();
    periodEvents
      .filter((event) => event.event_type === "begin_journey" && event.session_id)
      .forEach((event) => sessionStarts.set(event.session_id as string, new Date(event.created_at).getTime()));
    const durations = periodEvents
      .filter((event) => event.event_type === "finish_journey")
      .map((event) => {
        const explicit = event.event_data?.durationMs;
        if (typeof explicit === "number" && Number.isFinite(explicit) && explicit >= 0) return explicit;
        if (!event.session_id) return null;
        const start = sessionStarts.get(event.session_id);
        return start == null ? null : Math.max(0, new Date(event.created_at).getTime() - start);
      })
      .filter((duration): duration is number => duration != null);

    return {
      uniqueUsers: uniqueSessions.size,
      hintClickRate: uniqueSessions.size ? hintSessions.size / uniqueSessions.size * 100 : 0,
      answerCorrectness: answers.length ? correct / answers.length * 100 : 0,
      finalPuzzleCompletion: new Set(periodEvents.flatMap((event) => event.session_id ? [event.session_id] : [])).size
        ? finalSolvers.size / new Set(periodEvents.flatMap((event) => event.session_id ? [event.session_id] : [])).size * 100
        : 0,
      averageCompletionMs: durations.length ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : null,
      completedGames: durations.length,
    };
  }, [filteredEvents, periodEvents]);

  const puzzleMetrics = useMemo<PuzzleMetrics[]>(() => allPuzzles.map((puzzle) => {
    const events = periodEvents.filter((event) => event.puzzle_title === puzzle.name);
    const users = new Set(events.flatMap((event) => event.session_id ? [event.session_id] : []));
    const hintUsers = new Set(events.filter((event) => ["unlock_hint", "view_hints"].includes(event.event_type)).flatMap((event) => event.session_id ? [event.session_id] : []));
    const answers = events.filter((event) => event.event_type === "check_answer");
    const correct = answers.filter((event) => event.event_data?.correct === true).length;
    const hintClicks = events.filter((event) => event.event_type === "unlock_hint").length;
    const answerCounts = new Map<string, { label: string; count: number }>();
    answers.filter((event) => event.event_data?.correct === false).forEach((event) => {
      const raw = event.event_data?.answer;
      if (typeof raw !== "string" || !raw.trim()) return;
      const key = normalizeWrongAnswer(raw);
      const current = answerCounts.get(key);
      answerCounts.set(key, { label: current?.label ?? raw.trim().replace(/\s+/g, " "), count: (current?.count ?? 0) + 1 });
    });
    return {
      puzzleName: puzzle.name,
      uniqueUsers: users.size,
      hintClickRate: users.size ? hintUsers.size / users.size * 100 : 0,
      correctnessRate: answers.length ? correct / answers.length * 100 : 0,
      avgHintsPerUser: users.size ? hintClicks / users.size : 0,
      commonWrongAnswers: [...answerCounts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 3),
    };
  }), [periodEvents]);

  const engagement = useMemo(() => [
    { label: "Shared time card", event: "share_time_click", icon: Clock3 },
    { label: "Shared the game", event: "share_game_click", icon: Share2 },
    { label: "Clicked Instagram", event: "instagram_click", icon: Instagram },
    { label: "Behind the Scenes / Credits", event: "behind_scenes_click", icon: BookOpen },
  ].map((item) => ({ ...item, count: periodEvents.filter((event) => event.event_type === item.event).length })), [periodEvents]);

  const dailyData = useMemo(() => {
    const daily = new Map<string, { date: string; hints: number; answers: number }>();
    filteredEvents.forEach((event) => {
      const date = format(new Date(event.created_at), "MM/dd");
      const row = daily.get(date) ?? { date, hints: 0, answers: 0 };
      if (["unlock_hint", "view_hints"].includes(event.event_type)) row.hints += 1;
      if (event.event_type === "check_answer") row.answers += 1;
      daily.set(date, row);
    });
    return [...daily.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEvents]);

  const funnel = useMemo(() => {
    const sessions = new Set(periodEvents.flatMap((event) => event.session_id ? [event.session_id] : []));
    const withEvent = (types: string[], correctFinal = false) => new Set(periodEvents.filter((event) => {
      if (!types.includes(event.event_type) || !event.session_id) return false;
      return !correctFinal || (event.event_data?.correct === true && event.puzzle_title === allPuzzles[allPuzzles.length - 1]?.name);
    }).map((event) => event.session_id as string));
    const rows = [
      { step: "Visited site", count: sessions.size },
      { step: "Opened a hint", count: withEvent(["unlock_hint", "view_hints"]).size },
      { step: "Submitted an answer", count: withEvent(["check_answer"]).size },
      { step: "Completed the journey", count: withEvent(["check_answer"], true).size },
    ];
    return rows.map((row) => ({ ...row, percentage: sessions.size ? row.count / sessions.size * 100 : 0 }));
  }, [periodEvents]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) return <main className="paper min-h-screen bg-paper flex items-center justify-center"><p className="font-hand text-3xl text-ink">Opening the ledger…</p></main>;
  if (!isAdmin) return null;

  return (
    <main className="paper min-h-screen bg-paper text-ink px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-hand text-2xl text-rule-text">Origami Escape</p>
              <h1 className="font-display text-3xl font-semibold tracking-[0.12em] md:text-5xl">MARKET REPORT</h1>
              <p className="mt-2 text-lg text-ink/75">How players explore Echoes of the Market.</p>
            </div>
            <Button onClick={logout} variant="outline" className="min-h-[44px] border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-paper">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
          <div className="mt-6"><Rule double /></div>
        </header>

        <section aria-label="Report filters" className="mb-8 grid gap-4 border-b border-rule pb-7 md:grid-cols-2">
          <label className="font-display text-xs font-semibold uppercase tracking-[0.2em]">Date range
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="mt-2 min-h-[48px] border-2 border-ink/60 bg-paper/70 text-base text-ink"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-paper text-ink">
                <SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem><SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="font-display text-xs font-semibold uppercase tracking-[0.2em]">Puzzle
            <Select value={selectedPuzzle} onValueChange={setSelectedPuzzle}>
              <SelectTrigger className="mt-2 min-h-[48px] border-2 border-ink/60 bg-paper/70 text-base text-ink"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-paper text-ink">
                <SelectItem value="all">All puzzles</SelectItem>
                {allPuzzles.map((puzzle) => <SelectItem key={puzzle.key} value={puzzle.name}>{puzzle.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </section>

        <section aria-labelledby="overview-title" className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-3"><h2 id="overview-title" className="font-display text-xl font-semibold tracking-[0.1em]">AT A GLANCE</h2><p className="font-hand text-xl text-rule-text">selected period</p></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Unique sessions", value: metrics.uniqueUsers, note: "Anonymous browser sessions", icon: Users, help: "Distinct session IDs that recorded activity in this period." },
              { label: "Hint click rate", value: `${metrics.hintClickRate.toFixed(1)}%`, note: "Sessions opening a hint", icon: MousePointerClick, help: "The share of sessions that opened at least one hint." },
              { label: "Answer correctness", value: `${metrics.answerCorrectness.toFixed(1)}%`, note: "Correct submissions", icon: CheckCircle2, help: "Correct answers divided by every submitted answer." },
              { label: "Journey completion", value: `${metrics.finalPuzzleCompletion.toFixed(1)}%`, note: "Sessions solving the finale", icon: Target, help: "The share of sessions that correctly solved the Final Letter." },
              { label: "Average game time", value: formatDuration(metrics.averageCompletionMs), note: `${metrics.completedGames} completed ${metrics.completedGames === 1 ? "game" : "games"}`, icon: Clock3, help: "Average elapsed timer value when Finish Journey was selected. Older records use start-to-finish timestamps when available." },
            ].map((item) => (
              <Card key={item.label} className="rounded-sm border-2 border-rule/60 bg-paper-deep/45 shadow-paper">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink">{item.label}</CardTitle>
                  <item.icon className="h-5 w-5 shrink-0 text-rule-text" />
                </CardHeader>
                <CardContent><p className="font-display text-3xl font-semibold tabular-nums">{item.value}</p><div className="flex items-center justify-between gap-1"><p className="text-sm text-ink/70">{item.note}</p><MetricHelp>{item.help}</MetricHelp></div></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="engagement-title" className="mb-10">
          <div className="mb-4"><Rule /><h2 id="engagement-title" className="pt-5 font-display text-xl font-semibold tracking-[0.1em]">AFTER THE JOURNEY</h2><p className="mt-1 text-ink/70">Button clicks after players finish. These count intent, not confirmed posts or follows.</p></div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {engagement.map((item) => <Card key={item.event} className="rounded-sm border border-rule/60 bg-paper/60"><CardContent className="flex min-h-[110px] items-center gap-4 p-4"><item.icon className="h-6 w-6 shrink-0 text-rule-text" /><div><p className="font-display text-3xl font-semibold tabular-nums">{item.count}</p><p className="text-sm text-ink/75">{item.label}</p></div></CardContent></Card>)}
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-sm border-2 border-rule/60 bg-paper/65 shadow-paper">
            <CardHeader><CardTitle className="flex items-center gap-2 font-display tracking-[0.08em] text-ink"><BarChart3 className="h-5 w-5 text-rule-text" /> HINTS & ANSWERS</CardTitle><p className="text-sm text-ink/70">Daily activity for the selected filters</p></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={dailyData}><CartesianGrid stroke={chartRule} strokeOpacity={0.25} vertical={false} /><XAxis dataKey="date" stroke={chartInk} /><YAxis stroke={chartInk} allowDecimals={false} /><RechartsTooltip contentStyle={{ background: chartPaper, borderColor: chartRule, color: chartInk }} /><Legend /><Bar dataKey="hints" fill={chartRule} name="Hints" /><Bar dataKey="answers" fill={chartInk} name="Answers" /></BarChart></ResponsiveContainer></CardContent>
          </Card>
          <Card className="rounded-sm border-2 border-rule/60 bg-paper/65 shadow-paper">
            <CardHeader><CardTitle className="font-display tracking-[0.08em] text-ink">JOURNEY FUNNEL</CardTitle><p className="text-sm text-ink/70">Progress through the companion</p></CardHeader>
            <CardContent className="space-y-5">{funnel.map((item) => <div key={item.step}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-display font-medium">{item.step}</span><span>{item.count} ({item.percentage.toFixed(1)}%)</span></div><div className="h-3 overflow-hidden bg-paper-deep"><div className="h-full bg-rule" style={{ width: `${Math.max(item.percentage, item.count ? 2 : 0)}%` }} /></div></div>)}</CardContent>
          </Card>
        </section>

        <section aria-labelledby="puzzles-title" className="mb-10">
          <div className="mb-4"><Rule /><h2 id="puzzles-title" className="pt-5 font-display text-xl font-semibold tracking-[0.1em]">PUZZLE NOTES</h2><p className="mt-1 text-ink/70">Difficulty signals and the three most common incorrect submissions per puzzle.</p></div>
          <Card className="rounded-sm border-2 border-rule/60 bg-paper/65 shadow-paper">
            <CardContent className="p-0"><div className="overflow-x-auto"><Table>
              <TableHeader><TableRow className="border-rule/60 hover:bg-transparent"><TableHead className="text-ink">Puzzle</TableHead><TableHead className="text-ink">Sessions</TableHead><TableHead className="text-ink">Hint rate</TableHead><TableHead className="text-ink">Correct</TableHead><TableHead className="text-ink">Avg. hints</TableHead><TableHead className="min-w-[240px] text-ink">Common incorrect answers</TableHead></TableRow></TableHeader>
              <TableBody>{puzzleMetrics.map((puzzle) => <TableRow key={puzzle.puzzleName} className="border-rule/40"><TableCell className="font-display font-medium">{puzzle.puzzleName}</TableCell><TableCell>{puzzle.uniqueUsers}</TableCell><TableCell>{puzzle.hintClickRate.toFixed(1)}%</TableCell><TableCell>{puzzle.correctnessRate.toFixed(1)}%</TableCell><TableCell>{puzzle.avgHintsPerUser.toFixed(1)}</TableCell><TableCell>{puzzle.commonWrongAnswers.length ? <ol className="space-y-1">{puzzle.commonWrongAnswers.map((answer) => <li key={answer.answer}><span className="font-medium">“{answer.answer}”</span> <span className="text-ink/60">× {answer.count}</span></li>)}</ol> : <span className="text-ink/55">None recorded</span>}</TableCell></TableRow>)}</TableBody>
            </Table></div></CardContent>
          </Card>
        </section>

        <aside className="border-y-2 border-rule py-5 text-sm text-ink/75">
          <p><strong className="font-display text-ink">Data retention:</strong> analytics events currently have no automatic deletion date. They remain stored indefinitely unless manually deleted.</p>
        </aside>
      </div>
    </main>
  );
};

export default Dashboard;
