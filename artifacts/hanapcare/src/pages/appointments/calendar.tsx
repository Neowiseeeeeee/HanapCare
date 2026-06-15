import { useState } from "react";
import { Link } from "wouter";
import { useListAppointments } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { LoadingCard } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";

export default function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // We fetch appointments for the selected date
  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;
  const { data, isLoading } = useListAppointments({ date: dateStr });

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/appointments"><ArrowLeft className="mr-2 h-4 w-4" /> List View</Link>
      </Button>

      <PageHeader 
        title="Appointment Calendar" 
        description="View appointments by date."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md mx-auto"
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                Appointments for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-16 bg-muted rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                        <div className="h-3 w-1/4 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                  No appointments scheduled for this day.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.data.map((appt) => (
                    <div key={appt.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col items-center justify-center shrink-0 w-20 text-center border-r pr-4">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="font-semibold text-sm">{appt.timeSlot}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-primary">{appt.patientName}</h4>
                          <Badge variant="outline">{appt.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Dr. {appt.doctorName}</p>
                        {appt.reason && <p className="text-sm mt-2">{appt.reason}</p>}
                        <div className="mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/appointments/${appt.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
