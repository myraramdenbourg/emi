import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, LogOut, Eye, MousePointerClick, Users, CheckCircle2, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { puzzleData } from "@/data/puzzleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: any;
  puzzle_index: number | null;
  puzzle_title: string | null;
  session_id: string | null;
  created_at: string;
}

interface KPIMetrics {
  uniqueUsers: number;
  hintClickRate: number;
  answerCorrectness: number;
  finalPuzzleCompletion: number;
}

interface PuzzleMetrics {
  puzzleName: string;
  uniqueUsers: number;
  hintClickRate: number;
  correctnessRate: number;
  avgHintsPerUser: number;
  finalCompletionRate: number;
}

const COLORS = ['#03404A', '#F6DC9F', '#E74C3C', '#3498DB', '#2ECC71'];

const Dashboard = () => {
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AnalyticsEvent[]>([]);
  const [dateRange, setDateRange] = useState<string>("30");
  const [selectedPuzzle, setSelectedPuzzle] = useState<string>("all");
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics>({
    uniqueUsers: 0,
    hintClickRate: 0,
    answerCorrectness: 0,
    finalPuzzleCompletion: 0,
  });
  const [puzzleMetrics, setPuzzleMetrics] = useState<PuzzleMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (roleError || !roleData) {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadAnalytics();
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAllEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allEvents.length > 0) {
      applyFilters();
    }
  }, [dateRange, selectedPuzzle, allEvents]);

  const applyFilters = () => {
    const daysAgo = parseInt(dateRange);
    const startDate = startOfDay(subDays(new Date(), daysAgo));
    const endDate = endOfDay(new Date());

    let filtered = allEvents.filter(event => {
      const eventDate = new Date(event.created_at);
      return eventDate >= startDate && eventDate <= endDate;
    });

    if (selectedPuzzle !== "all") {
      filtered = filtered.filter(event => event.puzzle_title === selectedPuzzle);
    }

    setFilteredEvents(filtered);
    calculateMetrics(filtered);
  };

  const calculateMetrics = (events: AnalyticsEvent[]) => {
    // Get unique users
    const uniqueSessionIds = new Set(events.filter(e => e.session_id).map(e => e.session_id));
    const uniqueUsers = uniqueSessionIds.size;

    // Users who clicked at least one hint
    const usersWithHints = new Set(
      events.filter(e => e.event_type === "unlock_hint" || e.event_type === "view_hints")
        .filter(e => e.session_id)
        .map(e => e.session_id)
    );
    const hintClickRate = uniqueUsers > 0 ? (usersWithHints.size / uniqueUsers) * 100 : 0;

    // Answer correctness
    const correctAnswers = events.filter(e => 
      e.event_type === "check_answer" && e.event_data?.correct === true
    ).length;
    const totalAnswers = events.filter(e => e.event_type === "check_answer").length;
    const answerCorrectness = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    // Final puzzle completion
    const finalPuzzleTitle = puzzleData[puzzleData.length - 1].title;
    const usersCompletedFinal = new Set(
      events.filter(e => 
        e.event_type === "check_answer" && 
        e.event_data?.correct === true &&
        e.puzzle_title === finalPuzzleTitle
      ).filter(e => e.session_id).map(e => e.session_id)
    );
    const finalPuzzleCompletion = uniqueUsers > 0 ? (usersCompletedFinal.size / uniqueUsers) * 100 : 0;

    setKpiMetrics({
      uniqueUsers,
      hintClickRate,
      answerCorrectness,
      finalPuzzleCompletion,
    });

    // Calculate puzzle-level metrics
    const metrics: PuzzleMetrics[] = puzzleData.map((puzzle) => {
      const puzzleEvents = events.filter(e => e.puzzle_title === puzzle.title);
      const puzzleUsers = new Set(puzzleEvents.filter(e => e.session_id).map(e => e.session_id));
      const puzzleUsersWithHints = new Set(
        puzzleEvents.filter(e => e.event_type === "unlock_hint" || e.event_type === "view_hints")
          .filter(e => e.session_id)
          .map(e => e.session_id)
      );
      const puzzleCorrectAnswers = puzzleEvents.filter(e => 
        e.event_type === "check_answer" && e.event_data?.correct === true
      ).length;
      const puzzleTotalAnswers = puzzleEvents.filter(e => e.event_type === "check_answer").length;
      const puzzleHintClicks = puzzleEvents.filter(e => e.event_type === "unlock_hint").length;
      
      const finalPuzzleTitle = puzzleData[puzzleData.length - 1].title;
      const puzzleUsersCompletedFinal = new Set(
        events.filter(e => 
          e.event_type === "check_answer" && 
          e.event_data?.correct === true &&
          e.puzzle_title === finalPuzzleTitle &&
          e.session_id &&
          puzzleUsers.has(e.session_id)
        ).map(e => e.session_id)
      );

      return {
        puzzleName: puzzle.title,
        uniqueUsers: puzzleUsers.size,
        hintClickRate: puzzleUsers.size > 0 ? (puzzleUsersWithHints.size / puzzleUsers.size) * 100 : 0,
        correctnessRate: puzzleTotalAnswers > 0 ? (puzzleCorrectAnswers / puzzleTotalAnswers) * 100 : 0,
        avgHintsPerUser: puzzleUsers.size > 0 ? puzzleHintClicks / puzzleUsers.size : 0,
        finalCompletionRate: puzzleUsers.size > 0 ? (puzzleUsersCompletedFinal.size / puzzleUsers.size) * 100 : 0,
      };
    });

    setPuzzleMetrics(metrics);
  };

  const getHintUsageChartData = () => {
    const dailyData: { [key: string]: { date: string; hints: number; answers: number } } = {};
    
    filteredEvents.forEach(event => {
      const date = format(new Date(event.created_at), 'MM/dd');
      if (!dailyData[date]) {
        dailyData[date] = { date, hints: 0, answers: 0 };
      }
      
      if (event.event_type === "unlock_hint" || event.event_type === "view_hints") {
        dailyData[date].hints++;
      }
      if (event.event_type === "check_answer") {
        dailyData[date].answers++;
      }
    });

    return Object.values(dailyData).sort((a, b) => {
      const [aMonth, aDay] = a.date.split('/').map(Number);
      const [bMonth, bDay] = b.date.split('/').map(Number);
      return aMonth !== bMonth ? aMonth - bMonth : aDay - bDay;
    });
  };

  const getAnswerCorrectnessData = () => {
    const correct = filteredEvents.filter(e => 
      e.event_type === "check_answer" && e.event_data?.correct === true
    ).length;
    const incorrect = filteredEvents.filter(e => 
      e.event_type === "check_answer" && e.event_data?.correct === false
    ).length;

    return [
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect },
    ];
  };

  const getFunnelData = () => {
    const allSessionIds = new Set(filteredEvents.filter(e => e.session_id).map(e => e.session_id));
    const hintClickers = new Set(
      filteredEvents.filter(e => (e.event_type === "unlock_hint" || e.event_type === "view_hints") && e.session_id)
        .map(e => e.session_id)
    );
    const answerSubmitters = new Set(
      filteredEvents.filter(e => e.event_type === "check_answer" && e.session_id)
        .map(e => e.session_id)
    );
    const finalPuzzleTitle = puzzleData[puzzleData.length - 1].title;
    const finalSolvers = new Set(
      filteredEvents.filter(e => 
        e.event_type === "check_answer" && 
        e.event_data?.correct === true &&
        e.puzzle_title === finalPuzzleTitle &&
        e.session_id
      ).map(e => e.session_id)
    );

    const total = allSessionIds.size;
    return [
      { step: 'Visited Site', count: total, percentage: 100 },
      { step: 'Clicked Hint', count: hintClickers.size, percentage: total > 0 ? (hintClickers.size / total) * 100 : 0 },
      { step: 'Submitted Answer', count: answerSubmitters.size, percentage: total > 0 ? (answerSubmitters.size / total) * 100 : 0 },
      { step: 'Completed Final', count: finalSolvers.size, percentage: total > 0 ? (finalSolvers.size / total) * 100 : 0 },
    ];
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03404A] flex items-center justify-center">
        <p className="text-[#F6DC9F] text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const hintUsageData = getHintUsageChartData();
  const correctnessData = getAnswerCorrectnessData();
  const funnelData = getFunnelData();

  return (
    <div className="min-h-screen bg-[#03404A] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#F6DC9F] font-serif">
            Hints Analytics Dashboard
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-[#F6DC9F] text-[#F6DC9F] hover:bg-[#F6DC9F] hover:text-[#03404A]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F] mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#03404A] mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="border-[#03404A]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-[#03404A] mb-2 block">Puzzle</label>
                <Select value={selectedPuzzle} onValueChange={setSelectedPuzzle}>
                  <SelectTrigger className="border-[#03404A]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Puzzles</SelectItem>
                    {puzzleData.map((puzzle) => (
                      <SelectItem key={puzzle.title} value={puzzle.title}>
                        {puzzle.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Unique Users
              </CardTitle>
              <Users className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">{kpiMetrics.uniqueUsers}</div>
              <p className="text-xs text-[#2C2C2C] mt-1">Total unique sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Hint Click Rate
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">
                {kpiMetrics.hintClickRate.toFixed(1)}%
              </div>
              <p className="text-xs text-[#2C2C2C] mt-1">Users who clicked ≥1 hint</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Answer Correctness
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">
                {kpiMetrics.answerCorrectness.toFixed(1)}%
              </div>
              <p className="text-xs text-[#2C2C2C] mt-1">Correct vs total answers</p>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Final Puzzle Complete
              </CardTitle>
              <Target className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">
                {kpiMetrics.finalPuzzleCompletion.toFixed(1)}%
              </div>
              <p className="text-xs text-[#2C2C2C] mt-1">Completed final puzzle</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hint Usage Chart */}
          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader>
              <CardTitle className="text-[#03404A] font-serif">Hint Usage Over Time</CardTitle>
              <p className="text-sm text-[#2C2C2C]">Daily hint clicks and answer submissions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hintUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hints" fill="#03404A" name="Hints" />
                  <Bar dataKey="answers" fill="#F6DC9F" name="Answers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Answer Correctness */}
          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader>
              <CardTitle className="text-[#03404A] font-serif">Answer Correctness</CardTitle>
              <p className="text-sm text-[#2C2C2C]">Breakdown of correct vs incorrect answers</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={correctnessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {correctnessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center text-sm text-[#2C2C2C]">
                <p>Total: {correctnessData.reduce((sum, d) => sum + d.value, 0)} answers</p>
                <p>Correct: {correctnessData[0]?.value || 0} | Incorrect: {correctnessData[1]?.value || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Funnel */}
        <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F] mb-6">
          <CardHeader>
            <CardTitle className="text-[#03404A] font-serif">User Journey Funnel</CardTitle>
            <p className="text-sm text-[#2C2C2C]">Progression from site visit to final puzzle completion</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#03404A]">{item.step}</span>
                    <span className="text-sm text-[#2C2C2C]">
                      {item.count} users ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-[#03404A] h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${item.percentage}%` }}
                    >
                      <span className="text-xs text-[#F6DC9F] font-medium">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Puzzle-Level Breakdown */}
        <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
          <CardHeader>
            <CardTitle className="text-[#03404A] font-serif">Puzzle-Level Metrics</CardTitle>
            <p className="text-sm text-[#2C2C2C]">Performance breakdown by puzzle</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#03404A]">Puzzle</TableHead>
                    <TableHead className="text-[#03404A]">Users</TableHead>
                    <TableHead className="text-[#03404A]">Hint Click %</TableHead>
                    <TableHead className="text-[#03404A]">Correctness %</TableHead>
                    <TableHead className="text-[#03404A]">Avg Hints</TableHead>
                    <TableHead className="text-[#03404A]">Final Complete %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {puzzleMetrics.map((metric) => (
                    <TableRow key={metric.puzzleName}>
                      <TableCell className="font-medium text-[#2C2C2C]">
                        {metric.puzzleName}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">{metric.uniqueUsers}</TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {metric.hintClickRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {metric.correctnessRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {metric.avgHintsPerUser.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {metric.finalCompletionRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
