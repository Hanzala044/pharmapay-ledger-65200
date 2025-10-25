import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Calendar, Users, Receipt, Activity, Target, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";

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

  const todayGrowth = stats.todayTotal > 0 && stats.monthTotal > 0 
    ? ((stats.todayTotal / (stats.monthTotal / 30)) - 1) * 100 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border border-border/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Dashboard
                </h2>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {role === "owner" 
                    ? "Complete analytics and financial insights" 
                    : "Today's transaction activity and performance"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Date</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString("en-IN", { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Transactions</p>
                <Receipt className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stats.todayCount}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Target className="h-3 w-3 mr-1" />
                  <span>Total entries</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">₹{(stats.todayTotal / 1000).toFixed(1)}K</p>
                <div className="flex items-center text-xs">
                  {todayGrowth >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">+{todayGrowth.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">{todayGrowth.toFixed(1)}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground ml-1">vs avg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {role === "owner" && (
            <>
              <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                    <Percent className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">{todayPaymentRate.toFixed(0)}%</p>
                    <Progress value={todayPaymentRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">₹{(stats.todayUnpaid / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">Needs collection</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {role === "manager" && (
            <>
              <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Active Parties</p>
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.todayParties.length}</p>
                    <p className="text-xs text-muted-foreground">Engaged today</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Month Total</p>
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stats.monthCount}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Owner-Only Financial Overview */}
        {role === "owner" && (
          <>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="glass-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="glass-card border-border/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Month's Revenue</p>
                        <DollarSign className="h-5 w-5 text-cyan-500" />
                      </div>
                      <p className="text-3xl font-bold">₹{(stats.monthTotal / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground mt-1">{stats.monthCount} transactions</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-border/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Collected</p>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-3xl font-bold text-emerald-500">₹{(stats.monthPaid / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground mt-1">{monthPaymentRate.toFixed(0)}% collection rate</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-border/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      <p className="text-3xl font-bold text-amber-500">₹{(stats.monthUnpaid / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground mt-1">Pending collection</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-border/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                        <TrendingUp className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-bold">{monthPaymentRate.toFixed(0)}%</p>
                        <Progress value={monthPaymentRate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Revenue Trend with Area Chart */}
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>6-Month Revenue Trend</span>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats.monthlyData}>
                          <defs>
                            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            tickFormatter={(value) => `₹${value}K`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`₹${value.toFixed(1)}K`, '']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="paid" 
                            name="Collected" 
                            stroke="hsl(142 76% 36%)" 
                            fillOpacity={1}
                            fill="url(#colorPaid)"
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="unpaid" 
                            name="Pending" 
                            stroke="hsl(0 84% 60%)" 
                            fillOpacity={1}
                            fill="url(#colorUnpaid)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Payment Methods with Enhanced Pie */}
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Payment Distribution</span>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
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
                            strokeWidth={2}
                          >
                            {stats.paymentTypeData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                stroke="hsl(var(--background))"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {/* Top Parties */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle>Top Parties (This Month)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.topParties.map((party, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg glass-card border-border/50 hover:bg-accent/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold">
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
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                {/* Payment Progress */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Today's Collection Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Rate</span>
                          <span className="font-semibold text-lg">{todayPaymentRate.toFixed(1)}%</span>
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
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Monthly Collection Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Rate</span>
                          <span className="font-semibold text-lg">{monthPaymentRate.toFixed(1)}%</span>
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
              </TabsContent>
            </Tabs>
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
