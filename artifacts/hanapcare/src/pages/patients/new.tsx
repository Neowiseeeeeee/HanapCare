import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePatient } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodType: z.string().optional(),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  allergies: z.string().optional(),
  existingConditions: z.string().optional(),
  philhealthNumber: z.string().optional(),
  insuranceInfo: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const createPatient = useCreatePatient();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      contactNumber: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      allergies: "",
      existingConditions: "",
      philhealthNumber: "",
      insuranceInfo: "",
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    createPatient.mutate({ data }, {
      onSuccess: (response) => {
        toast.success("Patient registered successfully");
        setLocation(`/patients/${response.id}`);
      },
      onError: () => {
        toast.error("Failed to register patient");
      }
    });
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/patients"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients</Link>
      </Button>
      
      <PageHeader 
        title="Register New Patient" 
        description="Enter patient demographics and medical information."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Full Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                <FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="emergencyContactNumber" render={({ field }) => (
                <FormItem><FormLabel>Emergency Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Medical & Insurance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="allergies" render={({ field }) => (
                <FormItem><FormLabel>Allergies</FormLabel><FormControl><Input placeholder="None" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="existingConditions" render={({ field }) => (
                <FormItem><FormLabel>Existing Conditions</FormLabel><FormControl><Input placeholder="None" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="philhealthNumber" render={({ field }) => (
                <FormItem><FormLabel>PhilHealth Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="insuranceInfo" render={({ field }) => (
                <FormItem><FormLabel>HMO / Insurance Info</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>Cancel</Button>
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? "Registering..." : "Register Patient"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
