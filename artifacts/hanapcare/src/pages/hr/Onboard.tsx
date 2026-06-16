import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListDepartments } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const WORKER_ROLES = [
  "Doctor", "Nurse", "Receptionist", "Pharmacist",
  "Lab Staff", "Cashier", "Support", "HR Manager", "Admin",
] as const;

const SHIFTS = ["Morning (6AM–2PM)", "Afternoon (2PM–10PM)", "Night (10PM–6AM)", "Day (8AM–5PM)", "Flexible"] as const;

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  role: z.enum(WORKER_ROLES, { required_error: "Select a role" }),
  contactNumber: z.string().optional(),
  departmentId: z.coerce.number().optional(),
  employeeId: z.string().optional(),
  shift: z.string().optional(),
  joinedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardEmployee() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const { data: departments } = useListDepartments();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: undefined,
      contactNumber: "",
      departmentId: undefined,
      employeeId: "",
      shift: undefined,
      joinedAt: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/hr/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          password: data.password,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          contactNumber: data.contactNumber || undefined,
          departmentId: data.departmentId || undefined,
          employeeId: data.employeeId || undefined,
          shift: data.shift || undefined,
          joinedAt: data.joinedAt || undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error ?? "Failed to onboard employee");
        return;
      }

      toast.success(`${data.firstName} ${data.lastName} has been onboarded successfully!`);
      setLocation("/staff");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Onboard New Employee</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a login account and staff record for a new team member.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input placeholder="Maria" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input placeholder="Santos" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="+63 9XX XXX XXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Account Access */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Login Account</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Work Email</FormLabel>
                  <FormControl><Input type="email" placeholder="employee@hanapcare.ph" {...field} /></FormControl>
                  <FormDescription className="text-xs">This will be their login email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 chars, 1 uppercase, 1 number"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">Ask the employee to change this after first login.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Role & Department */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Role & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {WORKER_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="departmentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? undefined : Number(v))} value={field.value?.toString() ?? ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="shift" render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === "none" ? undefined : v)} value={field.value ?? ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {SHIFTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="employeeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="e.g. HC-2026-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="joinedAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[160px]">
              <UserPlus className="w-4 h-4 mr-2" />
              {isPending ? "Onboarding…" : "Onboard Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
