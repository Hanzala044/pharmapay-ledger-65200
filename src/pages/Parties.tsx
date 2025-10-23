import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Party {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  payment_type: string;
  status: string;
  notes: string | null;
}

export default function Parties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    if (selectedParty) {
      fetchTransactions(selectedParty);
    }
  }, [selectedParty]);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from("parties")
        .select("*")
        .order("name");

      if (error) throw error;
      setParties(data || []);
      if (data && data.length > 0) {
        setSelectedParty(data[0].id);
      }
    } catch (error: any) {
      toast.error("Failed to load parties: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (partyId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("party_id", partyId)
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast.error("Failed to load transactions: " + error.message);
    }
  };

  const togglePaymentStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
      const { error } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setTransactions(
        transactions.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Payment marked as ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPartyName = parties.find((p) => p.id === selectedParty)?.name || "";
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total), 0);
  const paidAmount = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + Number(t.total), 0);
  const unpaidAmount = totalAmount - paidAmount;

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Party Accounts</h2>
            <p className="text-muted-foreground mt-1">
              Manage transactions for pharmaceutical businesses
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                parties={parties}
                onSuccess={() => {
                  setDialogOpen(false);
                  if (selectedParty) fetchTransactions(selectedParty);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Party List */}
          <Card className="glass-card border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Parties</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-card border-border/50"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
              {filteredParties.map((party) => (
                <button
                  key={party.id}
                  onClick={() => setSelectedParty(party.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedParty === party.id
                      ? "glass-card border-primary bg-primary/10"
                      : "glass-card border-border/50 hover:bg-accent"
                  }`}
                >
                  <p className="font-medium text-sm">{party.name}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card border-green-500/30 border">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-500 mt-2">
                    ₹{paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card border-destructive/30 border">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Unpaid</p>
                  <p className="text-2xl font-bold text-destructive mt-2">
                    ₹{unpaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>{selectedPartyName} - Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>CGST</TableHead>
                        <TableHead>SGST</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id} className="border-border/50">
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>
                              ₹{Number(transaction.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              ₹{Number(transaction.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              ₹{Number(transaction.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{Number(transaction.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-border/50">
                                {transaction.payment_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={transaction.status === "Paid"}
                                  onCheckedChange={() =>
                                    togglePaymentStatus(transaction.id, transaction.status)
                                  }
                                />
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
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {transaction.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No transactions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
