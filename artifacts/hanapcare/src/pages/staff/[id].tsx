import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetStaffMember, useListDepartments } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft, Pencil, X, CheckCircle2, UserX, UserCheck,
  Mail, Phone, Building2 as Building, Briefcase, Clock, Calendar, Hash,
} from "lucide-react";

const WORKER_ROLES = [
  "Doctor", "Nurse", "Receptionist", "Pharmacist",
  "Lab Staff", "Cashier", "Support", "HR Manager", "Admin",
] as const;

const SHIFTS = ["Morning (6AM–2PM)", "Afternoon (2PM–10PM)", "Night (10PM–6AM)", "Day (8AM–5PM)", "Flexible"] as const;

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  role: z.enum(WORKER_ROLES, { required_error: "Required" }),
  contactNumber: z.string().optional(),
  departmentId: z.coerce.number().optional(),
  employeeId: z.string().optional(),
  shift: z.string().optional(),
  joinedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function StaffProfile() {
  const [, params] = useRoute("/staff/:id");
  const [, setLocation] = useLocation();
  const { token, user: me } = useAuth();
  const id = Number(params?.id);
  const canEdit = me?.role === "HR Manager" || me?.role === "Admin";

  const { data: staff, isLoading, refetch } = useGetStaffMember(id);
  const { data: departments } = useListDepartments();

  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: staff
      ? {
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: (WORKER_ROLES as readonly string[]).includes(staff.role)
            ? (staff.role as typeof WORKER_ROLES[number])
            : "Nurse",
          contactNumber: staff.contactNumber ?? "",
          departmentId: staff.departmentId ?? undefined,
          employeeId: staff.employeeId ?? "",
          shift: staff.shift ?? undefined,
          joinedAt: staff.joinedAt ?? "",
        }
      : undefined,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          contactNumber: data.contactNumber || null,
          departmentId: data.departmentId || null,
          employeeId: data.employeeId || null,
          shift: data.shift || null,
          joinedAt: data.joinedAt || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated successfully");
      setEditing(false);
      refetch();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const toggleActive = async () => {
    if (!staff) return;
    const action = staff.isActive ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} ${staff.firstName} ${staff.lastName}?`)) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !staff.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Account ${staff.isActive ? "deactivated" : "reactivated"} successfully`);
      refetch();
    } catch {
      toast.error("Failed to update account status");
    } finally {
      setToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-xl w-48" />
          <div className="h-40 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="max-w-3xl mx-auto pb-10 text-center pt-20">
        <p className="text-muted-foreground">Staff member not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/staff")}>
          Back to Staff
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/staff"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff</Link>
      </Button>

      {/* Header card */}
      <Card className="mb-5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {staff.firstName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-foreground">
                {staff.firstName} {staff.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">{staff.role}</Badge>
                {staff.departmentName && (
                  <Badge variant="outline" className="text-xs bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                    {staff.departmentName}
                  </Badge>
                )}
                {staff.isActive ? (
                  <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2 flex-shrink-0">
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
                <Button
                  variant={staff.isActive ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleActive}
                  disabled={toggling}
                  className="gap-1.5"
                >
                  {staff.isActive ? (
                    <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                  ) : (
                    <><UserCheck className="w-3.5 h-3.5" /> Reactivate</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editing ? (
        /* ── Edit form ── */
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Edit Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {WORKER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="departmentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v === "none" ? undefined : Number(v))} value={field.value?.toString() ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">— None —</SelectItem>
                          {departments?.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="employeeId" render={({ field }) => (
                    <FormItem><FormLabel>Employee ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="shift" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v === "none" ? undefined : v)} value={field.value ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">— None —</SelectItem>
                          {SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="joinedAt" render={({ field }) => (
                    <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        /* ── Read-only view ── */
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Staff Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={Mail} label="Email" value={staff.email} />
            <InfoRow icon={Phone} label="Contact Number" value={staff.contactNumber} />
            <InfoRow icon={Briefcase} label="Role" value={staff.role} />
            <InfoRow icon={Building} label="Department" value={staff.departmentName} />
            <InfoRow icon={Clock} label="Shift" value={staff.shift} />
            <InfoRow icon={Hash} label="Employee ID" value={staff.employeeId} />
            <InfoRow icon={Calendar} label="Start Date" value={staff.joinedAt} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
