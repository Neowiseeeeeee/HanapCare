import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateConsultation, useListPatients, useListDoctors } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  consultationDate: z.string().min(1, "Date is required"),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  diagnosis: z.string().optional(),
  icdCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewConsultation() {
  const [, setLocation] = useLocation();
  const createConsultation = useCreateConsultation();
  
  const { data: patients } = useListPatients({ limit: 100 });
  const { data: doctors } = useListDoctors({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      consultationDate: new Date().toISOString().split('T')[0],
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      diagnosis: "",
      icdCode: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createConsultation.mutate({ data }, {
      onSuccess: (res) => {
        toast.success("Consultation recorded successfully");
        setLocation(`/consultations/${res.id}`);
      },
      onError: () => {
        toast.error("Failed to record consultation");
      }
    });
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/consultations"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Consultations</Link>
      </Button>
      
      <PageHeader 
        title="New Consultation" 
        description="Record SOAP notes and diagnosis."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Encounter Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {patients?.data?.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.lastName}, {p.firstName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="doctorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Attending Doctor</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {doctors?.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>Dr. {d.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="consultationDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SOAP Notes</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="subjective" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjective</FormLabel>
                  <FormControl><Textarea placeholder="Chief complaint, history of present illness..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="objective" render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl><Textarea placeholder="Physical exam findings, vital signs, lab results..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="assessment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment</FormLabel>
                  <FormControl><Textarea placeholder="Diagnosis, differential diagnosis..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="plan" render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl><Textarea placeholder="Treatment, medications, follow-up..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Diagnosis & Coding</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="diagnosis" render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Diagnosis</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icdCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>ICD-10 Code</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setLocation("/consultations")}>Cancel</Button>
            <Button type="submit" disabled={createConsultation.isPending}>
              {createConsultation.isPending ? "Saving..." : "Save Consultation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
