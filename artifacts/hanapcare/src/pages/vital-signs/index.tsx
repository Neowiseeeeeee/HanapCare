import { useState } from "react";
import { useListVitalSigns } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeartPulse, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function VitalSigns() {
  const { data, isLoading } = useListVitalSigns({});
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    temperature: "",
    weight: "",
    height: "",
  });

  const recordMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const body: Record<string, unknown> = {
        patientId: Number(data.patientId),
        recordedAt: new Date().toISOString(),
        recordedBy: user?.fullName ?? "Staff",
      };
      if (data.bloodPressureSystolic) body.bloodPressureSystolic = Number(data.bloodPressureSystolic);
      if (data.bloodPressureDiastolic) body.bloodPressureDiastolic = Number(data.bloodPressureDiastolic);
      if (data.heartRate) body.heartRate = Number(data.heartRate);
      if (data.respiratoryRate) body.respiratoryRate = Number(data.respiratoryRate);
      if (data.oxygenSaturation) body.oxygenSaturation = data.oxygenSaturation;
      if (data.temperature) body.temperature = data.temperature;
      if (data.weight) body.weight = data.weight;
      if (data.height) body.height = data.height;

      const res = await fetch("/api/vital-signs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to record vitals");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vital signs recorded");
      setOpen(false);
      setForm({
        patientId: "", bloodPressureSystolic: "", bloodPressureDiastolic: "",
        heartRate: "", respiratoryRate: "", oxygenSaturation: "",
        temperature: "", weight: "", height: "",
      });
      qc.invalidateQueries({ queryKey: ["vital-signs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { toast.error("Patient ID is required"); return; }
    recordMutation.mutate(form);
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Vital Signs" 
        description="Monitor patient vital signs."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 w-4 h-4" />
                Record Vitals
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Vital Signs</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Patient ID <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    placeholder="Enter patient ID"
                    value={form.patientId}
                    onChange={(e) => setForm(f => ({ ...f, patientId: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>BP Systolic (mmHg)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 120"
                      value={form.bloodPressureSystolic}
                      onChange={(e) => setForm(f => ({ ...f, bloodPressureSystolic: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>BP Diastolic (mmHg)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 80"
                      value={form.bloodPressureDiastolic}
                      onChange={(e) => setForm(f => ({ ...f, bloodPressureDiastolic: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Heart Rate (bpm)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 72"
                      value={form.heartRate}
                      onChange={(e) => setForm(f => ({ ...f, heartRate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Resp. Rate (/min)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 16"
                      value={form.respiratoryRate}
                      onChange={(e) => setForm(f => ({ ...f, respiratoryRate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>SpO₂ (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 98"
                      value={form.oxygenSaturation}
                      onChange={(e) => setForm(f => ({ ...f, oxygenSaturation: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Temp (°C)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 36.8"
                      value={form.temperature}
                      onChange={(e) => setForm(f => ({ ...f, temperature: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 65"
                      value={form.weight}
                      onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={recordMutation.isPending}>
                    {recordMutation.isPending ? "Saving…" : "Save Vitals"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={7} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No records found" 
            description="Record patient vital signs to see them here."
            icon={<HeartPulse className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>HR</TableHead>
                  <TableHead>Resp</TableHead>
                  <TableHead>SpO₂</TableHead>
                  <TableHead>Temp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((vital) => (
                  <TableRow key={vital.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{format(new Date(vital.recordedAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(vital.recordedAt), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>Patient #{vital.patientId}</TableCell>
                    <TableCell>
                      {vital.bloodPressureSystolic && vital.bloodPressureDiastolic ? 
                        `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}` : '—'}
                    </TableCell>
                    <TableCell>{vital.heartRate ? `${vital.heartRate} bpm` : '—'}</TableCell>
                    <TableCell>{vital.respiratoryRate ? `${vital.respiratoryRate} /min` : '—'}</TableCell>
                    <TableCell>{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '—'}</TableCell>
                    <TableCell>{vital.temperature ? `${vital.temperature}°C` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
