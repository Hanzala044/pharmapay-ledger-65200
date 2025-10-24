import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";

const formSchema = z.object({
  party_id: z.string().min(1, "Please select a party"),
  date: z.string().min(1, "Date is required"),
  subtotal: z.string().min(1, "Subtotal is required"),
  payment_type: z.enum(["Cash", "UPI", "Bank", "Cheque"]),
  payment_date: z.string().optional(),
  ptr_number: z.string().optional(),
  cheque_number: z.string().optional(),
  notes: z.string().optional(),
});

interface Party {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  party_id: string;
  date: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  payment_type: string;
  payment_date?: string | null;
  ptr_number?: string | null;
  cheque_number?: string | null;
  notes: string | null;
}

interface TransactionFormProps {
  parties: Party[];
  transaction?: Transaction;
  onSuccess?: () => void;
}

export function TransactionForm({ parties, transaction, onSuccess }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    cgst: "0.00",
    sgst: "0.00",
    total: "0.00",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party_id: transaction?.party_id || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
      subtotal: transaction?.subtotal.toString() || "",
      payment_type: (transaction?.payment_type as "Cash" | "UPI" | "Bank" | "Cheque") || "Cash",
      payment_date: transaction?.payment_date || "",
      ptr_number: transaction?.ptr_number || "",
      cheque_number: transaction?.cheque_number || "",
      notes: transaction?.notes || "",
    },
  });

  const paymentType = form.watch("payment_type");

  useEffect(() => {
    if (transaction) {
      calculateGST(transaction.subtotal.toString());
    }
  }, [transaction]);

  const calculateGST = (subtotal: string) => {
    const subtotalNum = parseFloat(subtotal) || 0;
    const cgst = subtotalNum * 0.025; // 2.5% CGST
    const sgst = subtotalNum * 0.025; // 2.5% SGST
    const total = subtotalNum + cgst + sgst;

    setCalculatedValues({
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const subtotal = parseFloat(values.subtotal);
      const cgst = parseFloat(calculatedValues.cgst);
      const sgst = parseFloat(calculatedValues.sgst);
      const total = parseFloat(calculatedValues.total);

      const transactionData = {
        party_id: values.party_id,
        date: values.date,
        subtotal,
        cgst,
        sgst,
        total,
        payment_type: values.payment_type,
        payment_date: values.payment_date || null,
        ptr_number: values.payment_type === "UPI" ? values.ptr_number || null : null,
        cheque_number: values.payment_type === "Cheque" ? values.cheque_number || null : null,
        notes: values.notes || null,
      };

      if (transaction) {
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transaction.id);

        if (error) throw error;
        toast.success("Transaction updated successfully!");
      } else {
        const { error } = await supabase.from("transactions").insert({
          ...transactionData,
          status: "Unpaid",
        });

        if (error) throw error;
        toast.success("Transaction added successfully!");
      }

      form.reset();
      setCalculatedValues({ cgst: "0.00", sgst: "0.00", total: "0.00" });
      onSuccess?.();
    } catch (error: any) {
      toast.error(`Failed to ${transaction ? "update" : "add"} transaction: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="party_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Name</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-card border-border/50">
                      <SelectValue placeholder="Select a party" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-card border-border/50 bg-card">
                    {parties.map((party) => (
                      <SelectItem key={party.id} value={party.id}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" className="glass-card border-border/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtotal (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="glass-card border-border/50"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      calculateGST(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-card border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-card border-border/50 bg-card">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
                <FormControl>
                  <Input type="date" className="glass-card border-border/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional Fields Based on Payment Type */}
        {paymentType === "UPI" && (
          <FormField
            control={form.control}
            name="ptr_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PTR Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter PTR number"
                    className="glass-card border-border/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {paymentType === "Cheque" && (
          <FormField
            control={form.control}
            name="cheque_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cheque Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter cheque number"
                    className="glass-card border-border/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* GST Calculation Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass-card rounded-lg border border-border/50">
          <div>
            <p className="text-sm text-muted-foreground">CGST (2.5%)</p>
            <p className="text-xl font-semibold text-primary">₹{calculatedValues.cgst}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">SGST (2.5%)</p>
            <p className="text-xl font-semibold text-primary">₹{calculatedValues.sgst}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Grand Total</p>
            <p className="text-2xl font-bold text-foreground">₹{calculatedValues.total}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any remarks..."
                  className="glass-card border-border/50 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {transaction ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update Transaction"}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
