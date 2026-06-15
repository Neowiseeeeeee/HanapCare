import { useState } from "react";
import { Link } from "wouter";
import { useListConsultations } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText } from "lucide-react";
import { format } from "date-fns";

export default function Consultations() {
  const { data, isLoading } = useListConsultations({});

  return (
    <div className="pb-10">
      <PageHeader 
        title="Consultations" 
        description="Electronic health records and SOAP notes."
        action={
          <Button asChild>
            <Link href="/consultations/new">
              <Plus className="mr-2 w-4 h-4" />
              New Consultation
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={5} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No consultations found" 
            description="Start a new patient consultation to begin recording SOAP notes."
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button asChild variant="outline">
                <Link href="/consultations/new">New Consultation</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((cons) => (
                  <TableRow key={cons.id}>
                    <TableCell>
                      <div className="font-medium">{format(new Date(cons.consultationDate), 'MMM d, yyyy')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{cons.patientName}</div>
                    </TableCell>
                    <TableCell>Dr. {cons.doctorName}</TableCell>
                    <TableCell>
                      <div className="truncate max-w-[200px]" title={cons.diagnosis || ''}>
                        {cons.diagnosis || '—'}
                      </div>
                      {cons.icdCode && <div className="text-xs text-muted-foreground">{cons.icdCode}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/consultations/${cons.id}`}>View Notes</Link>
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
