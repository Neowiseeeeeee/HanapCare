import { useParams, Link } from "wouter";
import { useGetBilling, useCreatePayment, getGetBillingQueryKey } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Receipt, CreditCard, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function n(v: unknown): number {
  return Number(v ?? 0);
}

function fmt(v: unknown): string {
  return n(v).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

export default function BillingDetails() {
  const { id } = useParams();
  const billingId = id ? parseInt(id) : 0;
  const queryClient = useQueryClient();

  const { data: bill, isLoading } = useGetBilling(billingId, { query: { enabled: !!billingId } });
  const createPayment = useCreatePayment();

  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const balance = bill ? n(bill.totalAmount) - n(bill.paidAmount) : 0;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || amount > balance) {
      toast.error("Invalid payment amount");
      return;
    }

    createPayment.mutate({
      data: {
        billingId,
        amount,
        method: paymentMethod,
      }
    }, {
      onSuccess: () => {
        toast.success("Payment recorded successfully");
        setIsPaymentOpen(false);
        setPaymentAmount("");
        queryClient.invalidateQueries({ queryKey: getGetBillingQueryKey(billingId) });
      },
      onError: () => toast.error("Failed to record payment")
    });
  };

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!bill) return <div className="p-10 text-center">Invoice not found</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/billing"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing</Link>
      </Button>

      <PageHeader 
        title={`Invoice ${bill.invoiceNumber}`}
        description="Billing statement details and payment collection."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Print Invoice</Button>
            {bill.status !== "Paid" && (
              <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Collect Payment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePayment} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Outstanding Balance</Label>
                      <div className="text-2xl font-bold text-destructive">₱{fmt(balance)}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Amount (₱)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={paymentAmount} 
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={balance.toString()}
                        max={balance}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="HMO">HMO Guarantee Letter</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="GCash/Maya">E-Wallet (GCash/Maya)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createPayment.isPending || !paymentAmount}>
                      {createPayment.isPending ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6 border-b pb-6">
              <div>
                <h3 className="text-lg font-bold text-primary flex items-center"><Receipt className="mr-2 h-5 w-5" /> HanapCare Hospital</h3>
                <p className="text-sm text-muted-foreground mt-1">123 Health Ave, Manila, Philippines</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
                <p className="text-sm font-mono text-muted-foreground">{bill.invoiceNumber}</p>
                <div className="mt-2">
                  <Badge variant="outline" className={
                    bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    bill.status === 'Partially Paid' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }>{bill.status}</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Bill To:</p>
                <p className="font-semibold text-base flex items-center"><User className="h-4 w-4 mr-1 text-muted-foreground" /> {bill.patientName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm flex justify-end gap-4"><span className="text-muted-foreground">Date Issued:</span> <span>{format(new Date(bill.issuedAt), 'MMM d, yyyy')}</span></p>
                {bill.dueDate && <p className="text-sm flex justify-end gap-4 mt-1"><span className="text-muted-foreground">Due Date:</span> <span>{format(new Date(bill.dueDate), 'MMM d, yyyy')}</span></p>}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {n(bill.consultationFee) > 0 && <tr><td className="py-3 px-3">Consultation Fee</td><td className="text-right py-3 px-3">₱{fmt(bill.consultationFee)}</td></tr>}
                {n(bill.medicineFee) > 0 && <tr><td className="py-3 px-3">Pharmacy & Medicines</td><td className="text-right py-3 px-3">₱{fmt(bill.medicineFee)}</td></tr>}
                {n(bill.labFee) > 0 && <tr><td className="py-3 px-3">Laboratory & Diagnostics</td><td className="text-right py-3 px-3">₱{fmt(bill.labFee)}</td></tr>}
                {n(bill.roomFee) > 0 && <tr><td className="py-3 px-3">Room & Board</td><td className="text-right py-3 px-3">₱{fmt(bill.roomFee)}</td></tr>}
                {n(bill.otherFees) > 0 && <tr><td className="py-3 px-3">Other Fees</td><td className="text-right py-3 px-3">₱{fmt(bill.otherFees)}</td></tr>}
              </tbody>
            </table>

            <div className="mt-6 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="w-32 text-right">₱{fmt(n(bill.totalAmount) + n(bill.philhealthDeduction) + n(bill.discountAmount))}</span>
              </div>
              {n(bill.philhealthDeduction) > 0 && (
                <div className="flex justify-end gap-8 text-emerald-600">
                  <span>PhilHealth Deduction:</span>
                  <span className="w-32 text-right">-₱{fmt(bill.philhealthDeduction)}</span>
                </div>
              )}
              {n(bill.discountAmount) > 0 && (
                <div className="flex justify-end gap-8 text-emerald-600">
                  <span>Discounts:</span>
                  <span className="w-32 text-right">-₱{fmt(bill.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-end gap-8 font-bold text-lg pt-2 border-t mt-2">
                <span>Total Amount:</span>
                <span className="w-32 text-right text-primary">₱{fmt(bill.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Bill</span>
                  <span className="font-medium">₱{fmt(bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Amount Paid</span>
                  <span>₱{fmt(bill.paidAmount)}</span>
                </div>
                <div className="border-t border-primary/20 pt-3 flex justify-between font-bold">
                  <span>Balance Due</span>
                  <span className="text-destructive text-xl">₱{fmt(balance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center"><CreditCard className="mr-2 h-4 w-4" /> Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {n(bill.paidAmount) > 0 ? (
                <div className="text-sm text-muted-foreground flex items-center justify-center p-4 border rounded border-dashed">
                  Payments recorded. Balance updated.
                </div>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center justify-center p-4">
                  No payments made yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
