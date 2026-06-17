import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientVisits, useListConsultations } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone, Activity, Calendar, HeartPulse, Plus, Thermometer, Wind, Droplets } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

// ── helpers ─────────────────────────────────────────────────────────────────
function n(v: unknown) { return Number(v ?? 0); }

interface VitalSign {
  id: number;
  patientId: number;
  recordedAt: string;
  recordedBy: string | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: string | null;
  temperature: string | null;
  weight: string | null;
  height: string | null;
}

// ── Vital Signs Tab ──────────────────────────────────────────────────────────
function VitalSignsTab({ patientId }: { patientId: number }) {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    systolic: "", diastolic: "", heartRate: "", respiratoryRate: "",
    oxygenSaturation: "", temperature: "", weight: "", height: "",
  });

  const { data: vitals = [], isLoading } = useQuery<VitalSign[]>({
    queryKey: ["vital-signs", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/vital-signs?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch vitals");
      return res.json();
    },
    enabled: !!patientId && !!token,
  });

  const addMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      const body: Record<string, unknown> = {
        patientId,
        recordedAt: new Date().toISOString(),
        recordedBy: user?.fullName ?? "Staff",
      };
      if (f.systolic)         body.bloodPressureSystolic  = Number(f.systolic);
      if (f.diastolic)        body.bloodPressureDiastolic = Number(f.diastolic);
      if (f.heartRate)        body.heartRate              = Number(f.heartRate);
      if (f.respiratoryRate)  body.respiratoryRate        = Number(f.respiratoryRate);
      if (f.oxygenSaturation) body.oxygenSaturation       = f.oxygenSaturation;
      if (f.temperature)      body.temperature            = f.temperature;
      if (f.weight)           body.weight                 = f.weight;
      if (f.height)           body.height                 = f.height;

      const res = await fetch("/api/vital-signs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Vital signs recorded");
      setOpen(false);
      setForm({ systolic: "", diastolic: "", heartRate: "", respiratoryRate: "", oxygenSaturation: "", temperature: "", weight: "", height: "" });
      qc.invalidateQueries({ queryKey: ["vital-signs", patientId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  // Build chart data sorted oldest → newest
  const chartData = [...vitals]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((v) => ({
      label: format(new Date(v.recordedAt), "MMM d HH:mm"),
      systolic:  v.bloodPressureSystolic  ?? null,
      diastolic: v.bloodPressureDiastolic ?? null,
      hr:        v.heartRate              ?? null,
      rr:        v.respiratoryRate        ?? null,
      spo2:      v.oxygenSaturation != null ? n(v.oxygenSaturation) : null,
      temp:      v.temperature      != null ? n(v.temperature)      : null,
    }));

  // Latest reading
  const latest = vitals[0] ?? null;

  const STAT_CARDS = [
    {
      label: "Blood Pressure",
      value: latest?.bloodPressureSystolic
        ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
        : "—",
      unit: "mmHg",
      icon: Activity,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
    },
    {
      label: "Heart Rate",
      value: latest?.heartRate ? String(latest.heartRate) : "—",
      unit: "bpm",
      icon: HeartPulse,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950",
    },
    {
      label: "SpO₂",
      value: latest?.oxygenSaturation ? `${n(latest.oxygenSaturation)}` : "—",
      unit: "%",
      icon: Droplets,
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-950",
    },
    {
      label: "Temperature",
      value: latest?.temperature ? `${n(latest.temperature)}` : "—",
      unit: "°C",
      icon: Thermometer,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Resp. Rate",
      value: latest?.respiratoryRate ? String(latest.respiratoryRate) : "—",
      unit: "/min",
      icon: Wind,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  const CHART_LINE_STYLE = "hsl(var(--primary))";
  const TOOLTIP_STYLE = {
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };
  const AXIS_TICK = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {vitals.length === 0
              ? "No vital sign records yet."
              : `${vitals.length} reading${vitals.length !== 1 ? "s" : ""} · Latest: ${format(new Date(vitals[0].recordedAt), "MMM d, yyyy h:mm a")}`}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Vital Signs</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Systolic BP (mmHg)</Label>
                  <Input type="number" placeholder="e.g. 120" value={form.systolic}
                    onChange={(e) => setForm(f => ({ ...f, systolic: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Diastolic BP (mmHg)</Label>
                  <Input type="number" placeholder="e.g. 80" value={form.diastolic}
                    onChange={(e) => setForm(f => ({ ...f, diastolic: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Heart Rate (bpm)</Label>
                  <Input type="number" placeholder="e.g. 72" value={form.heartRate}
                    onChange={(e) => setForm(f => ({ ...f, heartRate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Resp. Rate (/min)</Label>
                  <Input type="number" placeholder="e.g. 16" value={form.respiratoryRate}
                    onChange={(e) => setForm(f => ({ ...f, respiratoryRate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>SpO₂ (%)</Label>
                  <Input type="number" step="0.1" placeholder="98" value={form.oxygenSaturation}
                    onChange={(e) => setForm(f => ({ ...f, oxygenSaturation: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Temp (°C)</Label>
                  <Input type="number" step="0.1" placeholder="36.8" value={form.temperature}
                    onChange={(e) => setForm(f => ({ ...f, temperature: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight (kg)</Label>
                  <Input type="number" step="0.1" placeholder="65" value={form.weight}
                    onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Saving…" : "Save Reading"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Latest reading stat cards */}
      {vitals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-card border rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground leading-tight">
                  {s.value} <span className="text-xs font-medium text-muted-foreground">{s.value !== "—" ? s.unit : ""}</span>
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {vitals.length === 0 ? (
        <div className="border border-dashed rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HeartPulse className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No vital signs recorded</h3>
          <p className="text-sm text-muted-foreground mb-4">Add the first reading for this patient.</p>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Reading</Button>
        </div>
      ) : chartData.length >= 2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Blood Pressure */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" /> Blood Pressure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[40, 200]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} label={{ value: "120", position: "right", fill: "#ef4444", fontSize: 10 }} />
                  <ReferenceLine y={80}  stroke="#f97316" strokeDasharray="4 2" strokeWidth={1} label={{ value: "80",  position: "right", fill: "#f97316", fontSize: 10 }} />
                  <Legend />
                  <Line type="monotone" dataKey="systolic"  name="Systolic"  stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} connectNulls />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heart Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" /> Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[40, 160]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} bpm`, "Heart Rate"]} />
                  <ReferenceLine y={60}  stroke="#64748b" strokeDasharray="4 2" strokeWidth={1} />
                  <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 2" strokeWidth={1} />
                  <Line type="monotone" dataKey="hr" name="HR (bpm)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: "#f43f5e" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SpO₂ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" /> Oxygen Saturation (SpO₂)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[85, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "SpO₂"]} />
                  <ReferenceLine y={95} stroke="#0ea5e9" strokeDasharray="4 2" strokeWidth={1} label={{ value: "95%", position: "right", fill: "#0ea5e9", fontSize: 10 }} />
                  <Line type="monotone" dataKey="spo2" name="SpO₂ (%)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: "#0ea5e9" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-500" /> Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[35, 41]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}°C`, "Temp"]} />
                  <ReferenceLine y={37.5} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} label={{ value: "37.5°C", position: "right", fill: "#f59e0b", fontSize: 10 }} />
                  <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Only 1 reading — show a table instead of charts (need ≥2 points for a trend)
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/30">
            <p className="text-xs text-muted-foreground">Add at least 2 readings to see trend charts.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">BP</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">HR</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">SpO₂</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Temp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">By</th>
              </tr>
            </thead>
            <tbody>
              {vitals.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium">{format(new Date(v.recordedAt), "MMM d, yyyy h:mm a")}</td>
                  <td className="px-5 py-3">{v.bloodPressureSystolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : "—"}</td>
                  <td className="px-5 py-3">{v.heartRate ? `${v.heartRate} bpm` : "—"}</td>
                  <td className="px-5 py-3">{v.oxygenSaturation ? `${n(v.oxygenSaturation)}%` : "—"}</td>
                  <td className="px-5 py-3">{v.temperature ? `${n(v.temperature)}°C` : "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{v.recordedBy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Raw data table (when charts are shown, collapsed below) */}
      {chartData.length >= 2 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 select-none">
            <span className="group-open:hidden">▶</span>
            <span className="hidden group-open:inline">▼</span>
            All readings ({vitals.length})
          </summary>
          <div className="mt-3 bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Date & Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">BP</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">HR</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">SpO₂</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Temp</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium whitespace-nowrap">{format(new Date(v.recordedAt), "MMM d, yyyy h:mm a")}</td>
                    <td className="px-5 py-3">{v.bloodPressureSystolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg` : "—"}</td>
                    <td className="px-5 py-3">{v.heartRate ? `${v.heartRate} bpm` : "—"}</td>
                    <td className="px-5 py-3">{v.oxygenSaturation ? `${n(v.oxygenSaturation)}%` : "—"}</td>
                    <td className="px-5 py-3">{v.temperature ? `${n(v.temperature)}°C` : "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{v.recordedBy ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PatientDetails() {
  const { id } = useParams();
  const patientId = id ? parseInt(id) : 0;

  const { data: patient, isLoading } = useGetPatient(patientId, { query: { enabled: !!patientId } });
  const { data: visits } = useGetPatientVisits(patientId, { query: { enabled: !!patientId } });
  const { data: consultations } = useListConsultations({ patientId }, { query: { enabled: !!patientId } });

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!patient)  return <div>Patient not found</div>;

  return (
    <div className="pb-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/patients"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients</Link>
      </Button>

      <PageHeader 
        title={`${patient.lastName}, ${patient.firstName}`}
        description={`Code: ${patient.patientCode} · Registered ${format(new Date(patient.createdAt!), 'MMM d, yyyy')}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit Info</Button>
            <Button>New Appointment</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary"><User className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Demographics</p>
                <p className="font-medium">{format(new Date(patient.dateOfBirth), 'MMM d, yyyy')} ({patient.gender})</p>
                <p className="text-sm">Blood: {patient.bloodType || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/10 rounded-full text-secondary"><Phone className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{patient.contactNumber}</p>
                <p className="text-sm truncate">{patient.email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-full text-accent"><Activity className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p className="font-medium">{patient.emergencyContactName || 'None'}</p>
                <p className="text-sm">{patient.emergencyContactNumber || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="medical">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Allergies</h4>
                <p>{patient.allergies || 'None recorded'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Existing Conditions</h4>
                <p>{patient.existingConditions || 'None recorded'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">PhilHealth Number</h4>
                <p>{patient.philhealthNumber || '—'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Insurance Info</h4>
                <p>{patient.insuranceInfo || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <VitalSignsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
            <CardContent>
              {visits && visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-md"><Calendar className="h-4 w-4" /></div>
                        <div>
                          <p className="font-medium">{format(new Date(visit.visitDate), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">{visit.doctorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{visit.reason}</p>
                        <p className="text-xs text-muted-foreground">{visit.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No visit history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader><CardTitle>Consultations</CardTitle></CardHeader>
            <CardContent>
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((cons) => (
                    <div key={cons.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-primary">{format(new Date(cons.consultationDate), 'MMM d, yyyy')}</span>
                        <span className="text-sm text-muted-foreground">Dr. {cons.doctorName}</span>
                      </div>
                      {cons.diagnosis && <p className="text-sm mb-2"><span className="font-medium">Diagnosis:</span> {cons.diagnosis}</p>}
                      <Button variant="link" size="sm" className="px-0">View full notes</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No medical records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
