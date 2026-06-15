import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBilling, useListPatients } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Calculator } from "lucide-react";

const schema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  consultationFee: z.coerce.number().min(0).optional(),
  medicineFee: z.coerce.number().min(0).optional(),
  labFee: z.coerce.number().min(0).optional(),
  roomFee: z.coerce.number().min(0).optional(),
  otherFees: z.coerce.number().min(0).optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  philhealthDeduction: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewBilling() {
  const [, setLocation] = useLocation();
  const createBilling = useCreateBilling();
  const { data: patients } = useListPatients({ limit: 100 });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: 0,
      consultationFee: 0,
      medicineFee: 0,
      labFee: 0,
      roomFee: 0,
      otherFees: 0,
      discountAmount: 0,
      philhealthDeduction: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      notes: "",
    },
  });

  const values = useWatch({ control: form.control });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const subtotal = 
      (Number(values.consultationFee) || 0) + 
      (Number(values.medicineFee) || 0) + 
      (Number(values.labFee) || 0) + 
      (Number(values.roomFee) || 0) + 
      (Number(values.otherFees) || 0);
      
    const deductions = 
      (Number(values.discountAmount) || 0) + 
      (Number(values.philhealthDeduction) || 0);
      
    setTotal(Math.max(0, subtotal - deductions));
  }, [values]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      totalAmount: total
    };
    
    createBilling.mutate({ data: payload }, {
      onSuccess: (res) => {
        toast.success("Invoice created successfully");
        setLocation(`/billing/${res.id}`);
      },
      onError: () => toast.error("Failed to create invoice")
    });
  };

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/billing"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing</Link>
      </Button>
      
      <PageHeader 
        title="Create Invoice" 
        description="Generate a new billing statement for a patient."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient & General Info</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="patientId" render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Charges</CardTitle>
                  <CardDescription>Enter fee breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="consultationFee" render={({ field }) => (
                      <FormItem><FormLabel>Consultation Fee</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="medicineFee" render={({ field }) => (
                      <FormItem><FormLabel>Medicine / Pharmacy</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="labFee" render={({ field }) => (
                      <FormItem><FormLabel>Laboratory / Diagnostics</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="roomFee" render={({ field }) => (
                      <FormItem><FormLabel>Room & Board</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="otherFees" render={({ field }) => (
                      <FormItem><FormLabel>Other Fees</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deductions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="philhealthDeduction" render={({ field }) => (
                    <FormItem><FormLabel>PhilHealth Deduction</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="discountAmount" render={({ field }) => (
                    <FormItem><FormLabel>Other Discounts (SC/PWD)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1 space-y-6">
              <Card className="sticky top-6 border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="flex items-center text-lg"><Calculator className="h-5 w-5 mr-2" /> Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{((Number(values.consultationFee) || 0) + (Number(values.medicineFee) || 0) + (Number(values.labFee) || 0) + (Number(values.roomFee) || 0) + (Number(values.otherFees) || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Deductions</span>
                    <span>-₱{((Number(values.discountAmount) || 0) + (Number(values.philhealthDeduction) || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">₱{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full text-base py-6" disabled={createBilling.isPending || form.watch('patientId') === 0}>
                      {createBilling.isPending ? "Generating..." : "Generate Invoice"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
