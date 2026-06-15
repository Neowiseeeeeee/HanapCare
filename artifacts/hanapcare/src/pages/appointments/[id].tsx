import { useParams, Link, useLocation } from "wouter";
import { useGetAppointment, useUpdateAppointment, getGetAppointmentQueryKey } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Stethoscope, Clock, Calendar as CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AppointmentDetails() {
  const { id } = useParams();
  const appointmentId = id ? parseInt(id) : 0;
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useGetAppointment(appointmentId, { query: { enabled: !!appointmentId } });
  const updateAppointment = useUpdateAppointment();

  const handleStatusUpdate = (status: string) => {
    updateAppointment.mutate({ id: appointmentId, data: { status } }, {
      onSuccess: () => {
        toast.success(`Appointment marked as ${status}`);
        queryClient.invalidateQueries({ queryKey: getGetAppointmentQueryKey(appointmentId) });
      },
      onError: () => {
        toast.error("Failed to update status");
      }
    });
  };

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!appointment) return <div className="p-10 text-center">Appointment not found</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/appointments"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments</Link>
      </Button>

      <PageHeader 
        title={`Appointment #${appointment.queueNumber.toString().padStart(3, '0')}`}
        description="View and manage appointment details."
        action={
          <div className="flex gap-2">
            {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
              <>
                <Button variant="outline" className="text-destructive" onClick={() => handleStatusUpdate("Cancelled")} disabled={updateAppointment.isPending}>
                  Cancel
                </Button>
                {appointment.status === "Pending" && (
                  <Button variant="default" onClick={() => handleStatusUpdate("Confirmed")} disabled={updateAppointment.isPending}>
                    Confirm
                  </Button>
                )}
                {appointment.status === "Confirmed" && (
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusUpdate("CheckedIn")} disabled={updateAppointment.isPending}>
                    Check In
                  </Button>
                )}
                {appointment.status === "CheckedIn" && (
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleStatusUpdate("Ongoing")} disabled={updateAppointment.isPending}>
                    Start Session
                  </Button>
                )}
                {appointment.status === "Ongoing" && (
                  <Button variant="default" onClick={() => handleStatusUpdate("Completed")} disabled={updateAppointment.isPending}>
                    Complete
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">{appointment.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><CalendarIcon className="h-4 w-4 mr-1" /> Date</span>
                <p className="font-medium">{format(new Date(appointment.appointmentDate), 'MMMM d, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-1" /> Time</span>
                <p className="font-medium">{appointment.timeSlot}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full"><User className="h-5 w-5 text-foreground" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-semibold text-primary">{appointment.patientName}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/patients/${appointment.patientId}`}>Profile</Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="p-2 bg-muted rounded-full"><Stethoscope className="h-5 w-5 text-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-semibold">Dr. {appointment.doctorName}</p>
                <p className="text-xs">{appointment.departmentName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reason & Notes</CardTitle>
            <CardDescription>Clinical details for this visit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center"><FileText className="h-4 w-4 mr-1" /> Reason for Visit</h4>
              <p className="bg-muted/30 p-3 rounded-md text-sm border">{appointment.reason || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center"><FileText className="h-4 w-4 mr-1" /> Staff Notes</h4>
              <p className="bg-muted/30 p-3 rounded-md text-sm border">{appointment.notes || "No additional notes"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
