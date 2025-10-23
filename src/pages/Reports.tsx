import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileDown, Filter } from "lucide-react";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    const { data } = await supabase.from("parties").select("*").order("name");
    if (data) setParties(data);
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return "";

    const headers = [
      "Date",
      "Party Name",
      "Subtotal",
      "CGST",
      "SGST",
      "Total",
      "Payment Type",
      "Status",
      "Notes",
    ];

    const rows = data.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.parties?.name || "",
      Number(t.subtotal).toFixed(2),
      Number(t.cgst).toFixed(2),
      Number(t.sgst).toFixed(2),
      Number(t.total).toFixed(2),
      t.payment_type,
      t.status,
      t.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  };

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*, parties(name)")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (selectedParty !== "all") {
        query = query.eq("party_id", selectedParty);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("No transactions found for the selected criteria");
        return;
      }

      const csv = generateCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pharma-pay-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (error: any) {
      toast.error("Failed to generate report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground mt-1">
            Generate and export custom payment reports
          </p>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-card border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-card border-border/50"
                />
              </div>
            </div>

            {/* Party Selection */}
            <div className="space-y-2">
              <Label htmlFor="party-select">Party (Optional)</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger id="party-select" className="glass-card border-border/50">
                  <SelectValue placeholder="All parties" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50 bg-card">
                  <SelectItem value="all">All Parties</SelectItem>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-select">Payment Status (Optional)</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-select" className="glass-card border-border/50">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50 bg-card">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={downloadReport}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Download Excel Report (CSV)"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-card border-border/50 border-primary/30">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                📊 Report Information
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Reports are generated in CSV format (Excel-compatible)</li>
                <li>Includes all transaction details: amounts, GST, payment type, and status</li>
                <li>Filter by date range, specific party, or payment status</li>
                <li>Perfect for accounting, audits, and business analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
