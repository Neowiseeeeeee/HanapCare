import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAppointment, useListPatients, useListDoctors } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const createAppointment = useCreateAppointment();
  
  const { data: patients } = useListPatients({ limit: 100 });
  const { data: doctors } = useListDoctors({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      appointmentDate: "",
      timeSlot: "",
      reason: "",
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createAppointment.mutate({ data }, {
      onSuccess: () => {
        toast.success("Appointment scheduled successfully");
        setLocation("/appointments");
      },
      onError: () => {
        toast.error("Failed to schedule appointment");
      }
    });
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/appointments"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments</Link>
      </Button>
      
      <PageHeader 
        title="Schedule Appointment" 
        description="Book a new patient appointment."
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="patientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {patients?.data?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.lastName}, {p.firstName} ({p.patientCode})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="doctorId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {doctors?.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>Dr. {d.lastName} ({d.departmentName})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="timeSlot" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                        <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Routine checkup" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/appointments")}>Cancel</Button>
                <Button type="submit" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? "Scheduling..." : "Schedule"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
