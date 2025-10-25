import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Calendar, Users, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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
  monthlyData: { month: string; paid: number; unpaid: number }[];
  paymentTypeData: { name: string; value: number }[];
  topParties: { name: string; total: number }[];
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
    monthlyData: [],
    paymentTypeData: [],
    topParties: [],
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
        .select("total, status, date, payment_type, parties(name)")
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

      // Calculate monthly trend data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split("T")[0];
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split("T")[0];
        
        const monthTransactions = monthData?.filter(t => t.date >= monthStart && t.date <= monthEnd);
        const paid = monthTransactions?.filter(t => t.status === "Paid").reduce((sum, t) => sum + Number(t.total), 0) || 0;
        const unpaid = monthTransactions?.filter(t => t.status === "Unpaid").reduce((sum, t) => sum + Number(t.total), 0) || 0;
        
        monthlyData.push({
          month: monthDate.toLocaleDateString("en-IN", { month: "short" }),
          paid: paid / 1000,
          unpaid: unpaid / 1000,
        });
      }

      // Payment type distribution
      const paymentTypes = monthData?.reduce((acc: any, t: any) => {
        acc[t.payment_type] = (acc[t.payment_type] || 0) + Number(t.total);
        return acc;
      }, {});

      const paymentTypeData = Object.entries(paymentTypes || {}).map(([name, value]) => ({
        name,
        value: Number(value),
      }));

      // Top parties by transaction value
      const partiesMap = monthData?.reduce((acc: any, t: any) => {
        const partyName = t.parties?.name || "Unknown";
        acc[partyName] = (acc[partyName] || 0) + Number(t.total);
        return acc;
      }, {});

      const topParties = Object.entries(partiesMap || {})
        .map(([name, total]) => ({ name, total: Number(total) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

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
        monthlyData,
        paymentTypeData,
        topParties,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayPaymentRate = stats.todayTotal > 0 ? (stats.todayPaid / stats.todayTotal) * 100 : 0;
  const monthPaymentRate = stats.monthTotal > 0 ? (stats.monthPaid / stats.monthTotal) * 100 : 0;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(142 76% 36%)', 'hsl(221 83% 53%)'];

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
              ? "Complete overview of pharmaceutical payment analytics" 
              : "Today's transaction activity and performance"}
          </p>
        </div>

        {/* Today's Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Today's Transactions"
            value={stats.todayCount.toString()}
            icon={Receipt}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          />
          <SummaryCard
            title="Today's Total"
            value={`₹${(stats.todayTotal / 1000).toFixed(1)}K`}
            icon={DollarSign}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          />
          {role === "owner" && (
            <>
              <SummaryCard
                title="Today's Paid"
                value={`₹${(stats.todayPaid / 1000).toFixed(1)}K`}
                icon={TrendingUp}
                className="bg-gradient-to-br from-green-500/10 to-green-600/5"
              />
              <SummaryCard
                title="Today's Pending"
                value={`₹${(stats.todayUnpaid / 1000).toFixed(1)}K`}
                icon={TrendingDown}
                className="bg-gradient-to-br from-red-500/10 to-red-600/5"
              />
            </>
          )}
          {role === "manager" && (
            <>
              <SummaryCard
                title="Active Parties"
                value={stats.todayParties.length.toString()}
                icon={Users}
                className="bg-gradient-to-br from-green-500/10 to-green-600/5"
              />
              <SummaryCard
                title="This Month"
                value={stats.monthCount.toString()}
                icon={Calendar}
                className="bg-gradient-to-br from-orange-500/10 to-orange-600/5"
              />
            </>
          )}
        </div>

        {/* Owner-Only Financial Overview */}
        {role === "owner" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Month's Total"
                value={`₹${(stats.monthTotal / 1000).toFixed(1)}K`}
                icon={DollarSign}
                className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"
              />
              <SummaryCard
                title="Month's Paid"
                value={`₹${(stats.monthPaid / 1000).toFixed(1)}K`}
                icon={CheckCircle2}
                className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"
              />
              <SummaryCard
                title="Month's Pending"
                value={`₹${(stats.monthUnpaid / 1000).toFixed(1)}K`}
                icon={AlertCircle}
                className="bg-gradient-to-br from-amber-500/10 to-amber-600/5"
              />
              <Card className="glass-card border-border/50 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Collection Rate</p>
                      <p className="text-2xl font-bold text-foreground mt-2">{monthPaymentRate.toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Trend Chart */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>6-Month Payment Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="paid" name="Paid (₹K)" fill="hsl(142 76% 36%)" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="unpaid" name="Unpaid (₹K)" fill="hsl(0 84% 60%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Type Distribution */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.paymentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.paymentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Parties */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Top Parties (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topParties.map((party, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{party.name}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        ₹{party.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Progress */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Collection Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Rate</span>
                      <span className="font-semibold">{todayPaymentRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={todayPaymentRate} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      ₹{stats.todayPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} of ₹
                      {stats.todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} collected
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Collection Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Rate</span>
                      <span className="font-semibold">{monthPaymentRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={monthPaymentRate} className="h-3" />
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
                      className="flex items-center justify-between p-3 glass-card border-border/50 rounded-lg hover-scale"
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
                      {role === "owner" && (
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
                      )}
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
                      className="flex items-center justify-between p-3 glass-card border-border/50 rounded-lg hover-scale"
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
                      {role === "owner" && (
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
                      )}
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
