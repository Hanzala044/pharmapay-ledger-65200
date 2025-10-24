import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  todayParties: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayTotal: 0,
    todayCount: 0,
    monthTotal: 0,
    monthCount: 0,
    todayParties: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          fetchDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0];

      // Fetch today's transactions
      const { data: todayData, error: todayError } = await supabase
        .from("transactions")
        .select("total, party_id, parties(name)")
        .eq("date", today)
        .eq("status", "Paid");

      if (todayError) throw todayError;

      // Fetch this month's transactions
      const { data: monthData, error: monthError } = await supabase
        .from("transactions")
        .select("total")
        .gte("date", firstDayOfMonth)
        .eq("status", "Paid");

      if (monthError) throw monthError;

      const todayTotal = todayData?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const monthTotal = monthData?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const todayParties = Array.from(
        new Set(todayData?.map((t: any) => t.parties?.name).filter(Boolean) || [])
      );

      setStats({
        todayTotal,
        todayCount: todayData?.length || 0,
        monthTotal,
        monthCount: monthData?.length || 0,
        todayParties,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your payment summary.
          </p>
        </div>

        {/* Summary Cards - Only visible to owners */}
        {role === 'owner' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              title="Today's Payments"
              value={`₹${stats.todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={`${stats.todayCount} transactions`}
              trendUp={stats.todayCount > 0}
            />
            <SummaryCard
              title="This Month"
              value={`₹${stats.monthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              trend={`${stats.monthCount} transactions`}
              trendUp={stats.monthCount > 0}
            />
            <SummaryCard
              title="Active Parties Today"
              value={stats.todayParties.length.toString()}
              icon={Users}
            />
            <SummaryCard
              title="Date"
              value={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              icon={Calendar}
            />
          </div>
        )}

        {/* Today's Parties */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Parties with Payments Today</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todayParties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.todayParties.map((party, index) => (
                  <div
                    key={index}
                    className="glass-card glass-card-hover p-4 rounded-lg border border-border/50"
                  >
                    <p className="font-medium text-foreground">{party}</p>
                    <p className="text-xs text-muted-foreground mt-1">Payment received</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No payments received today yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/parties")} className="bg-primary hover:bg-primary/90">
              {role === 'manager' ? 'Manage Transactions' : 'Add Transaction'}
            </Button>
            {role === 'owner' && (
              <>
                <Button onClick={() => navigate("/analytics")} variant="outline" className="border-border/50">
                  View Analytics
                </Button>
                <Button onClick={() => navigate("/reports")} variant="outline" className="border-border/50">
                  Generate Report
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
