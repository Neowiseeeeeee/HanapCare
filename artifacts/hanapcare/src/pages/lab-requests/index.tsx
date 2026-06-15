import { useState } from "react";
import { Link } from "wouter";
import { useListLabRequests } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus } from "lucide-react";
import { format } from "date-fns";

export default function LabRequests() {
  const { data, isLoading } = useListLabRequests({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "Processing": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "Completed": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Lab Requests" 
        description="Manage laboratory tests and results."
        action={
          <Button asChild>
            <Link href="/lab-requests/new">
              <Plus className="mr-2 w-4 h-4" />
              New Lab Request
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={6} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No lab requests found" 
            description="Create a new lab request to get started."
            icon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button asChild variant="outline">
                <Link href="/lab-requests/new">New Request</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{format(new Date(req.requestedAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(req.requestedAt), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.patientName}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{req.testType}</Badge></TableCell>
                    <TableCell>Dr. {req.doctorName}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/lab-requests/${req.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
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
