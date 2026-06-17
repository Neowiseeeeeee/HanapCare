import { useState } from "react";
import { Link } from "wouter";
import { useListBillings } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus } from "lucide-react";
import { format } from "date-fns";

export default function Billing() {
  const { data, isLoading } = useListBillings({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Unpaid": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Unpaid</Badge>;
      case "Partially Paid": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Partial</Badge>;
      case "Paid": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Billing & Finance" 
        description="Manage patient invoices and payments."
        action={
          <Button asChild>
            <Link href="/billing/new">
              <Plus className="mr-2 w-4 h-4" />
              Create Invoice
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={7} />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState 
            title="No invoices found" 
            description="Create a new billing invoice to get started."
            icon={<Receipt className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button asChild variant="outline">
                <Link href="/billing/new">Create Invoice</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((bill) => {
                  const balance = Number(bill.totalAmount) - Number(bill.paidAmount || 0);
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono text-sm">{bill.invoiceNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(bill.issuedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{bill.patientName}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{Number(bill.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        {balance > 0 ? `₱${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '—'}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/billing/${bill.id}`}>View / Pay</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
