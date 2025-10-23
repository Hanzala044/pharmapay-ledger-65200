import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [topParties, setTopParties] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch status distribution
      const { data: transactions } = await supabase
        .from("transactions")
        .select("status, total");

      if (transactions) {
        const paidTotal = transactions
          .filter((t) => t.status === "Paid")
          .reduce((sum, t) => sum + Number(t.total), 0);
        const unpaidTotal = transactions
          .filter((t) => t.status === "Unpaid")
          .reduce((sum, t) => sum + Number(t.total), 0);

        setStatusData([
          { name: "Paid", value: paidTotal },
          { name: "Unpaid", value: unpaidTotal },
        ]);
      }

      // Fetch top 5 parties
      const { data: partiesData } = await supabase
        .from("transactions")
        .select("party_id, total, parties(name)");

      if (partiesData) {
        const partyTotals: Record<string, { name: string; total: number }> = {};
        
        partiesData.forEach((t: any) => {
          const partyName = t.parties?.name || "Unknown";
          if (!partyTotals[partyName]) {
            partyTotals[partyName] = { name: partyName, total: 0 };
          }
          partyTotals[partyName].total += Number(t.total);
        });

        const sorted = Object.values(partyTotals)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setTopParties(sorted);
      }

      // Fetch monthly trend for last 6 months
      const { data: monthlyData } = await supabase
        .from("transactions")
        .select("date, total")
        .gte("date", new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      if (monthlyData) {
        const monthlyTotals: Record<string, number> = {};
        
        monthlyData.forEach((t) => {
          const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
          monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(t.total);
        });

        const trend = Object.entries(monthlyTotals).map(([month, total]) => ({
          month,
          amount: total,
        }));

        setMonthlyTrend(trend);
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
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
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Visualize your payment data and trends
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status Distribution */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ₹${value.toLocaleString("en-IN")}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#10b981" : "#ef4444"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Parties */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Top 5 Parties by Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topParties}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.9)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Payment Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip
                    formatter={(value: number) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      backgroundColor: "rgba(31, 41, 55, 0.9)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
