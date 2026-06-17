import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DispensingRecord {
  id: number;
  patientId: number;
  patientName: string;
  medicineId: number;
  medicineName: string;
  quantityDispensed: number;
  dispensedAt: string;
  dispensedBy?: string | null;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  patientCode: string;
}

interface Medicine {
  id: number;
  drugName: string;
  genericName?: string | null;
  quantity: number;
}

export default function Dispensing() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    medicineId: "",
    quantityDispensed: "1",
  });

  const { data, isLoading } = useQuery<DispensingRecord[]>({
    queryKey: ["dispensing-records"],
    queryFn: async () => {
      const res = await fetch("/api/dispensing-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const res = await fetch("/api/patients?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!token && showModal,
  });

  const { data: medicines = [] } = useQuery<Medicine[]>({
    queryKey: ["medicines-list"],
    queryFn: async () => {
      const res = await fetch("/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token && showModal,
  });

  const dispenseMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/dispensing-records", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: Number(data.patientId),
          medicineId: Number(data.medicineId),
          quantityDispensed: Number(data.quantityDispensed),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to dispense");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Medication dispensed successfully");
      setShowModal(false);
      setForm({ patientId: "", medicineId: "", quantityDispensed: "1" });
      qc.invalidateQueries({ queryKey: ["dispensing-records"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="pb-10 space-y-5">
      <PageHeader
        title="Dispensing Records"
        description="Pharmacy log of dispensed medications."
        action={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Dispense Medication
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingTable columns={5} /></div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No records found"
            description="No medications have been dispensed yet."
            icon={<Pill className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button variant="outline" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Dispense First
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Dispensed</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Dispensed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(record.dispensedAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{record.patientName}</TableCell>
                    <TableCell className="font-medium text-primary">{record.medicineName}</TableCell>
                    <TableCell>{record.quantityDispensed}</TableCell>
                    <TableCell>{record.dispensedBy || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dispense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl border border-border shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Dispense Medication</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Patient *</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select patient…</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Medicine *</label>
                <select
                  value={form.medicineId}
                  onChange={e => setForm(f => ({ ...f, medicineId: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select medicine…</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}
                      disabled={m.quantity === 0}
                    >
                      {m.drugName}{m.genericName ? ` (${m.genericName})` : ""} — {m.quantity > 0 ? `Stock: ${m.quantity}` : "Out of stock"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Quantity to Dispense *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantityDispensed}
                  onChange={e => setForm(f => ({ ...f, quantityDispensed: e.target.value }))}
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Verify prescription before dispensing. Dispensing reduces inventory stock.
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!form.patientId) { toast.error("Select a patient"); return; }
                  if (!form.medicineId) { toast.error("Select a medicine"); return; }
                  if (!form.quantityDispensed || Number(form.quantityDispensed) < 1) { toast.error("Quantity must be at least 1"); return; }
                  dispenseMutation.mutate(form);
                }}
                disabled={dispenseMutation.isPending}
              >
                {dispenseMutation.isPending ? "Dispensing…" : "Confirm Dispense"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
