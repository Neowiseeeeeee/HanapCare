import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const TABS = ["All", "Pending", "Processing", "Completed"] as const;
type Tab = typeof TABS[number];

interface LabRequest {
  id: number;
  patientName: string;
  testType: string;
  doctorName: string;
  status: string;
  requestedAt: string;
  completedAt?: string | null;
  resultSummary?: string | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Pending":    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400">Pending</Badge>;
    case "Processing": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400">Processing</Badge>;
    case "Completed":  return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">Completed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function LabRequests() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("All");

  const isLabStaff = user?.role === "Lab Staff" || user?.role === "Admin";

  const { data: allRequests = [], isLoading } = useQuery<LabRequest[]>({
    queryKey: ["lab-requests"],
    queryFn: async () => {
      const res = await fetch("/api/lab-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/lab-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Lab request updated");
      qc.invalidateQueries({ queryKey: ["lab-requests"] });
    },
    onError: () => toast.error("Failed to update lab request"),
  });

  const filtered = tab === "All" ? allRequests : allRequests.filter(r => r.status === tab);

  const counts = {
    All: allRequests.length,
    Pending: allRequests.filter(r => r.status === "Pending").length,
    Processing: allRequests.filter(r => r.status === "Processing").length,
    Completed: allRequests.filter(r => r.status === "Completed").length,
  };

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Lab Requests"
        description="Manage laboratory tests and results."
        action={
          <Button asChild>
            <Link href="/lab-requests/new">
              <Plus className="mr-2 w-4 h-4" />
              New Lab Request
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === t ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4"><LoadingTable columns={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === "All" ? "No lab requests found" : `No ${tab.toLowerCase()} requests`}
            description={tab === "All" ? "Create a new lab request to get started." : `No requests with status "${tab}".`}
            icon={<FlaskConical className="h-8 w-8 text-muted-foreground" />}
            action={
              <Button asChild variant="outline">
                <Link href="/lab-requests/new">New Request</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{format(new Date(req.requestedAt), "MMM d, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(req.requestedAt), "h:mm a")}</div>
                    </TableCell>
                    <TableCell><div className="font-medium">{req.patientName}</div></TableCell>
                    <TableCell><Badge variant="secondary">{req.testType}</Badge></TableCell>
                    <TableCell>Dr. {req.doctorName}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLabStaff && req.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: req.id, status: "Processing" })}
                          >
                            Start Processing
                          </Button>
                        )}
                        {isLabStaff && req.status === "Processing" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: req.id, status: "Completed" })}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/lab-requests/${req.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
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
