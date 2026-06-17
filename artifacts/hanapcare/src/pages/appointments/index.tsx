import { useState } from "react";
import { Link } from "wouter";
import { useListAppointments } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function Appointments() {
  const { data, isLoading } = useListAppointments({});

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "Confirmed": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case "CheckedIn": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Checked In</Badge>;
      case "Ongoing": return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Ongoing</Badge>;
      case "Completed": return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Completed</Badge>;
      case "Cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Appointments" 
        description="Manage patient bookings and schedules."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild size="sm">
              <Link href="/appointments/calendar">
                <CalendarDays className="mr-2 w-4 h-4" />
                Calendar
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/appointments/new">
                <Plus className="mr-2 w-4 h-4" />
                New Appointment
              </Link>
            </Button>
          </div>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={6} />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState 
            title="No appointments" 
            description="There are no scheduled appointments yet."
            icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button asChild variant="outline">
                <Link href="/appointments/new">Schedule Appointment</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium text-primary">
                      #{appt.queueNumber.toString().padStart(3, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{format(new Date(appt.appointmentDate), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{appt.timeSlot}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appt.patientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{appt.doctorName}</div>
                      <div className="text-xs text-muted-foreground">{appt.departmentName}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appt.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/appointments/${appt.id}`}>Manage</Link>
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
