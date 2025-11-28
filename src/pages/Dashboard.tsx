import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, LogOut, Eye, MousePointerClick } from "lucide-react";

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: any;
  puzzle_index: number | null;
  puzzle_title: string | null;
  created_at: string;
}

interface EventStats {
  page_views: number;
  view_hints: number;
  check_answer: number;
  puzzle_solved: number;
}

const Dashboard = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<EventStats>({
    page_views: 0,
    view_hints: 0,
    check_answer: 0,
    puzzle_solved: 0,
  });
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
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setEvents(data || []);

      // Calculate stats
      const newStats = {
        page_views: data?.filter(e => e.event_type === "page_view").length || 0,
        view_hints: data?.filter(e => e.event_type === "view_hints").length || 0,
        check_answer: data?.filter(e => e.event_type === "check_answer").length || 0,
        puzzle_solved: data?.filter(e => e.event_type === "puzzle_solved").length || 0,
      };
      setStats(newStats);
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

  return (
    <div className="min-h-screen bg-[#03404A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#F6DC9F] font-serif">
            Analytics Dashboard
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Page Views
              </CardTitle>
              <Eye className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">{stats.page_views}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Hints Viewed
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">{stats.view_hints}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Answer Checks
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">{stats.check_answer}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#03404A]">
                Puzzles Solved
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#03404A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#03404A]">{stats.puzzle_solved}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#FFFDF5] border-2 border-[#F6DC9F]">
          <CardHeader>
            <CardTitle className="text-[#03404A] font-serif">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#03404A]">Event Type</TableHead>
                  <TableHead className="text-[#03404A]">Puzzle</TableHead>
                  <TableHead className="text-[#03404A]">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-[#2C2C2C]">
                      {event.event_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-[#2C2C2C]">
                      {event.puzzle_title || "N/A"}
                    </TableCell>
                    <TableCell className="text-[#2C2C2C]">
                      {new Date(event.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
