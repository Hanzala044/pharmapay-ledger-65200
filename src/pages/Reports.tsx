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
import { FileDown, Filter, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const generateExcel = (data: any[]) => {
    if (data.length === 0) return;

    // Create header data
    const headerData = [
      ["GSTIN: 29CRIPS99400Q1ZG", "", "", "CASH/BILL", "", "", "Mob: 8095064482"],
      ["PRADHAN MANTRI BHARATIYA JANAUSHADI KENDRA"],
      ["BIN-NOOR CENTER BUILDING NO:G-3, 108 DOWN TOWN"],
      ["MAIN ROAD BHATKAL-581320-DL NO: KA-KW1-172867, KA-KW1-172868"],
      [""],
      ["Date: " + new Date().toLocaleDateString("en-IN")],
      [""],
    ];

    const headers = [
      "Date",
      "Party Name",
      "Subtotal",
      "CGST",
      "SGST",
      "Total",
      "Payment Type",
      "Payment Date",
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
      t.payment_date ? new Date(t.payment_date).toLocaleDateString("en-IN") : "-",
      t.status,
      t.notes || "",
    ]);

    // Combine all data
    const worksheetData = [...headerData, headers, ...rows];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Generate file and download
    XLSX.writeFile(workbook, `pharma-pay-report-${startDate}-to-${endDate}.xlsx`);
  };

  const generatePDF = (data: any[]) => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(10);
    doc.setTextColor(128, 0, 128); // Purple color
    
    // First line with GSTIN and Mobile
    doc.text("GSTIN: 29CRIPS99400Q1ZG", 14, 15);
    doc.text("CASH/BILL", 105, 15, { align: "center" });
    doc.text("Mob: 8095064482", 196, 15, { align: "right" });
    
    // Main title
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("PRADHAN MANTRI BHARATIYA JANAUSHADI KENDRA", 105, 22, { align: "center" });
    
    // Address lines
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("BIN-NOOR CENTER BUILDING NO:G-3, 108 DOWN TOWN", 105, 28, { align: "center" });
    doc.text("MAIN ROAD BHATKAL-581320-DL NO: KA-KW1-172867, KA-KW1-172868", 105, 33, { align: "center" });
    
    // Date
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 196, 40, { align: "right" });
    
    // Table data
    const tableData = data.map((t) => [
      new Date(t.date).toLocaleDateString("en-IN"),
      t.parties?.name || "",
      Number(t.subtotal).toFixed(2),
      Number(t.cgst).toFixed(2),
      Number(t.sgst).toFixed(2),
      Number(t.total).toFixed(2),
      t.payment_type,
      t.payment_date ? new Date(t.payment_date).toLocaleDateString("en-IN") : "-",
      t.status,
      t.notes || "",
    ]);

    autoTable(doc, {
      head: [["Date", "Party Name", "Subtotal", "CGST", "SGST", "Total", "Payment Type", "Payment Date", "Status", "Notes"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [128, 0, 128], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 18 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 15 },
        9: { cellWidth: 25 },
      },
    });

    doc.save(`pharma-pay-report-${startDate}-to-${endDate}.pdf`);
  };

  const fetchTransactions = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return null;
    }

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
        return null;
      }

      return data;
    } catch (error: any) {
      toast.error("Failed to fetch transactions: " + error.message);
      return null;
    }
  };

  const downloadExcelReport = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      if (data) {
        generateExcel(data);
        toast.success("Excel report downloaded successfully!");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      if (data) {
        generatePDF(data);
        toast.success("PDF report downloaded successfully!");
      }
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

            {/* Generate Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={downloadExcelReport}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Download Excel Report"}
              </Button>
              <Button
                onClick={downloadPDFReport}
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                <FileDown className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Download PDF Report"}
              </Button>
            </div>
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
                <li>Reports are generated in Excel (.xlsx) and PDF formats</li>
                <li>Includes all transaction details: amounts, GST, payment type, payment date, and status</li>
                <li>Custom header with business information on all exports</li>
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
