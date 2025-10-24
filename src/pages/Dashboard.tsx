import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";

interface DashboardStats {
  todayTotal: number;
  todayPaid: number;
  todayUnpaid: number;
  todayCount: number;
  monthTotal: number;
  monthPaid: number;
  monthUnpaid: number;
  monthCount: number;
  todayParties: { party_name: string; total: number; status: string; payment_type: string }[];
  recentTransactions: any[];
}

export default function Dashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayTotal: 0,
    todayPaid: 0,
    todayUnpaid: 0,
    todayCount: 0,
    monthTotal: 0,
    monthPaid: 0,
    monthUnpaid: 0,
    monthCount: 0,
    todayParties: [],
    recentTransactions: [],
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
        .select("total, status, party_id, payment_type, parties(name)")
        .eq("date", today);

      if (todayError) throw todayError;

      // Fetch this month's transactions
      const { data: monthData, error: monthError } = await supabase
        .from("transactions")
        .select("total, status")
        .gte("date", firstDayOfMonth);

      if (monthError) throw monthError;

      // Fetch recent transactions
      const { data: recentData, error: recentError } = await supabase
        .from("transactions")
        .select("*, parties(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      const todayTotal = todayData?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const todayPaid = todayData?.filter(t => t.status === "Paid").reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const monthTotal = monthData?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const monthPaid = monthData?.filter(t => t.status === "Paid").reduce((sum, t) => sum + Number(t.total), 0) || 0;

      const todayParties = todayData?.map((t: any) => ({
        party_name: t.parties?.name,
        total: Number(t.total),
        status: t.status,
        payment_type: t.payment_type,
      })) || [];

      setStats({
        todayTotal,
        todayPaid,
        todayUnpaid: todayTotal - todayPaid,
        todayCount: todayData?.length || 0,
        monthTotal,
        monthPaid,
        monthUnpaid: monthTotal - monthPaid,
        monthCount: monthData?.length || 0,
        todayParties,
        recentTransactions: recentData || [],
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayPaymentRate = stats.todayTotal > 0 ? (stats.todayPaid / stats.todayTotal) * 100 : 0;
  const monthPaymentRate = stats.monthTotal > 0 ? (stats.monthPaid / stats.monthTotal) * 100 : 0;

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
            {role === "owner" 
              ? "Track pharmaceutical payments and analytics" 
              : "View today's transaction activity"}
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Today's Total"
            value={`₹${stats.todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
          />
          <SummaryCard
            title="Today's Paid"
            value={`₹${stats.todayPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            className="border-green-500/30"
          />
          <SummaryCard
            title="Today's Unpaid"
            value={`₹${stats.todayUnpaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            className="border-destructive/30"
          />
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Transactions</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stats.todayCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Owner-Only Monthly Summary */}
        {role === "owner" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Month's Total"
                value={`₹${stats.monthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                icon={DollarSign}
              />
              <SummaryCard
                title="Month's Paid"
                value={`₹${stats.monthPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                icon={TrendingUp}
                className="border-green-500/30"
              />
              <SummaryCard
                title="Month's Unpaid"
                value={`₹${stats.monthUnpaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                icon={TrendingDown}
                className="border-destructive/30"
              />
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Month's Transactions</p>
                      <p className="text-2xl font-bold text-foreground mt-2">{stats.monthCount}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Rate Progress */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Payment Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Collection Progress</span>
                      <span className="font-semibold">{todayPaymentRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={todayPaymentRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      ₹{stats.todayPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} of ₹
                      {stats.todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} collected
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Payment Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Collection Progress</span>
                      <span className="font-semibold">{monthPaymentRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={monthPaymentRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      ₹{stats.monthPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} of ₹
                      {stats.monthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} collected
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Activity Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Parties with Payments */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.todayParties.length > 0 ? (
                  stats.todayParties.map((party, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 glass-card border-border/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{party.party_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            ₹{party.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                          <span className="text-xs text-muted-foreground">• {party.payment_type}</span>
                        </div>
                      </div>
                      <Badge
                        variant={party.status === "Paid" ? "default" : "destructive"}
                        className={
                          party.status === "Paid"
                            ? "bg-green-500/20 text-green-500 border-green-500/50"
                            : ""
                        }
                      >
                        {party.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 glass-card border-border/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{transaction.parties?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            ₹{Number(transaction.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(transaction.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={transaction.status === "Paid" ? "default" : "destructive"}
                        className={
                          transaction.status === "Paid"
                            ? "bg-green-500/20 text-green-500 border-green-500/50"
                            : ""
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
