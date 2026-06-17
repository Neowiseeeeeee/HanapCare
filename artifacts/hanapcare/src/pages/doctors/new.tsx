import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateDoctor, useListDepartments } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  specialization: z.string().min(1, "Specialization is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  availability: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewDoctor() {
  const [, setLocation] = useLocation();
  const createDoctor = useCreateDoctor();
  const { data: departments } = useListDepartments();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      licenseNumber: "",
      specialization: "",
      departmentId: 0,
      contactNumber: "",
      email: "",
      availability: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createDoctor.mutate({ data }, {
      onSuccess: () => {
        toast.success("Doctor added successfully");
        setLocation("/doctors");
      },
      onError: () => {
        toast.error("Failed to add doctor");
      }
    });
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/doctors"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors</Link>
      </Button>
      
      <PageHeader 
        title="Add Doctor" 
        description="Register a new doctor to the system."
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                  <FormItem><FormLabel>License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="specialization" render={({ field }) => (
                  <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {departments?.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactNumber" render={({ field }) => (
                  <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="availability" render={({ field }) => (
                  <FormItem><FormLabel>Availability / Schedule</FormLabel><FormControl><Input placeholder="e.g., Mon-Wed-Fri, 9AM-5PM" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/doctors")}>Cancel</Button>
                <Button type="submit" disabled={createDoctor.isPending}>
                  {createDoctor.isPending ? "Adding..." : "Add Doctor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
