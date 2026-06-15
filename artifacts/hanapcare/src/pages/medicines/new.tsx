import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMedicine } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  drugName: z.string().min(1, "Drug name is required"),
  genericName: z.string().min(1, "Generic name is required"),
  category: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  unit: z.string().min(1, "Unit is required"),
  reorderLevel: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0, "Price is required"),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  supplier: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  "Antibiotics", "Analgesics", "Antipyretics", "Antihistamines",
  "Cardiovascular", "Respiratory", "Gastrointestinal", "Vitamins & Supplements",
  "Topical", "Injectables", "Others"
];

const UNITS = ["tablets", "capsules", "bottles", "vials", "ampoules", "tubes", "sachets", "boxes"];

export default function NewMedicine() {
  const [, setLocation] = useLocation();
  const createMedicine = useCreateMedicine();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      drugName: "",
      genericName: "",
      category: "",
      quantity: 0,
      unit: "tablets",
      reorderLevel: 10,
      unitPrice: 0,
      batchNumber: "",
      expirationDate: "",
      supplier: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createMedicine.mutate({ data }, {
      onSuccess: () => {
        toast.success("Medicine added to inventory");
        setLocation("/medicines");
      },
      onError: () => toast.error("Failed to add medicine")
    });
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/medicines"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory</Link>
      </Button>
      
      <PageHeader 
        title="Add Medicine" 
        description="Register a new drug into the pharmacy inventory."
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="drugName" render={({ field }) => (
                  <FormItem><FormLabel>Brand / Drug Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="genericName" render={({ field }) => (
                  <FormItem><FormLabel>Generic Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="flex gap-4">
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="reorderLevel" render={({ field }) => (
                  <FormItem><FormLabel>Low Stock Alert Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <FormField control={form.control} name="unitPrice" render={({ field }) => (
                  <FormItem><FormLabel>Unit Price (₱)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="batchNumber" render={({ field }) => (
                  <FormItem><FormLabel>Batch/Lot Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expirationDate" render={({ field }) => (
                  <FormItem><FormLabel>Expiration Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="supplier" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Supplier / Distributor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/medicines")}>Cancel</Button>
                <Button type="submit" disabled={createMedicine.isPending}>
                  {createMedicine.isPending ? "Adding..." : "Add to Inventory"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
