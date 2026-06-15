import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function Payments() {
  const { data, isLoading } = useListPayments({});

  return (
    <div className="pb-10">
      <PageHeader 
        title="Payment Records" 
        description="Log of all received payments and collections."
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={6} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No payments found" 
            description="No payments have been recorded yet."
            icon={<CreditCard className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Received By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.paidAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">#{payment.billingId}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">
                      ₱{payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{payment.referenceNumber || "—"}</TableCell>
                    <TableCell>{payment.receivedBy || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
