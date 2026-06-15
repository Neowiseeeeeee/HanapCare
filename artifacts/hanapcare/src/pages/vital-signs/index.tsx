import { useState } from "react";
import { Link } from "wouter";
import { useListVitalSigns } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { HeartPulse, Plus } from "lucide-react";
import { format } from "date-fns";

export default function VitalSigns() {
  const { data, isLoading } = useListVitalSigns({});

  return (
    <div className="pb-10">
      <PageHeader 
        title="Vital Signs" 
        description="Monitor patient vital signs."
        action={
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Record Vitals
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={7} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No records found" 
            description="Record patient vital signs to see them here."
            icon={<HeartPulse className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>HR</TableHead>
                  <TableHead>Resp</TableHead>
                  <TableHead>SpO2</TableHead>
                  <TableHead>Temp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((vital) => (
                  <TableRow key={vital.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{format(new Date(vital.recordedAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(vital.recordedAt), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>Patient #{vital.patientId}</TableCell>
                    <TableCell>
                      {vital.bloodPressureSystolic && vital.bloodPressureDiastolic ? 
                        `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}` : '—'}
                    </TableCell>
                    <TableCell>{vital.heartRate ? `${vital.heartRate} bpm` : '—'}</TableCell>
                    <TableCell>{vital.respiratoryRate ? `${vital.respiratoryRate} /min` : '—'}</TableCell>
                    <TableCell>{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '—'}</TableCell>
                    <TableCell>{vital.temperature ? `${vital.temperature}°C` : '—'}</TableCell>
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
