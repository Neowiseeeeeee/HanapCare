import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLabRequest, useListPatients, useListDoctors } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  testType: z.string().min(1, "Test type is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TEST_TYPES = [
  "CBC (Complete Blood Count)",
  "Urinalysis",
  "Blood Chemistry",
  "Lipid Profile",
  "X-Ray",
  "ECG",
  "Ultrasound",
  "CT Scan",
  "MRI"
];

export default function NewLabRequest() {
  const [, setLocation] = useLocation();
  const createRequest = useCreateLabRequest();
  
  const { data: patients } = useListPatients({ limit: 100 });
  const { data: doctors } = useListDoctors({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      testType: "",
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createRequest.mutate({ data }, {
      onSuccess: (res) => {
        toast.success("Lab request created successfully");
        setLocation(`/lab-requests/${res.id}`);
      },
      onError: () => {
        toast.error("Failed to create lab request");
      }
    });
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/lab-requests"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Lab Requests</Link>
      </Button>
      
      <PageHeader 
        title="New Lab Request" 
        description="Order laboratory tests for a patient."
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>Requesting Doctor</FormLabel>
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
                </div>

                <FormField control={form.control} name="testType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select test type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TEST_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinical Notes / Instructions</FormLabel>
                    <FormControl><Textarea placeholder="Add any specific instructions for the laboratory..." className="min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setLocation("/lab-requests")}>Cancel</Button>
                <Button type="submit" disabled={createRequest.isPending}>
                  {createRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
