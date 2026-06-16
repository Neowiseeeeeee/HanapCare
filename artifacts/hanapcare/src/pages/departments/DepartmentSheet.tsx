import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2, Users2, CheckCircle2, XCircle, Pencil, X, Save,
  Phone, Clock, Hash, ChevronRight, Loader2, AlertCircle,
} from "lucide-react";

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  contactNumber: string | null;
  shift: string | null;
  isActive: boolean;
  employeeId: string | null;
  joinedAt: string | null;
};

type DeptDetail = {
  id: number;
  name: string;
  description: string | null;
  staffCount: number;
  activeCount: number;
  inactiveCount: number;
  members: Member[];
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Doctor:       { bg: "bg-blue-50 dark:bg-blue-950",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800" },
  Nurse:        { bg: "bg-teal-50 dark:bg-teal-950",   text: "text-teal-700 dark:text-teal-300",   border: "border-teal-200 dark:border-teal-800" },
  Pharmacist:   { bg: "bg-violet-50 dark:bg-violet-950",text: "text-violet-700 dark:text-violet-300",border: "border-violet-200 dark:border-violet-800"},
  "Lab Staff":  { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800"},
  Receptionist: { bg: "bg-rose-50 dark:bg-rose-950",   text: "text-rose-700 dark:text-rose-300",   border: "border-rose-200 dark:border-rose-800" },
};
const ROLE_DEFAULT = { bg: "bg-muted", text: "text-foreground", border: "border-border" };

function roleBadge(role: string) {
  const c = ROLE_COLORS[role] ?? ROLE_DEFAULT;
  return `${c.bg} ${c.text} ${c.border}`;
}

function avatarColor(role: string) {
  const map: Record<string, string> = {
    Doctor: "from-blue-500 to-cyan-500",
    Nurse:  "from-teal-500 to-emerald-500",
    Pharmacist: "from-violet-500 to-purple-500",
    "Lab Staff": "from-amber-500 to-orange-500",
    Receptionist: "from-rose-500 to-pink-500",
  };
  return map[role] ?? "from-sky-500 to-teal-500";
}

interface Props {
  deptId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
  canEdit?: boolean;
}

export default function DepartmentSheet({ deptId, onClose, onUpdated, canEdit = false }: Props) {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const [data, setData] = useState<DeptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const open = deptId !== null;

  useEffect(() => {
    if (!open) { setData(null); setError(null); setEditing(false); return; }
    setLoading(true);
    setError(null);
    fetch(`/api/departments/${deptId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: DeptDetail) => { setData(d); setEditName(d.name); setEditDesc(d.description ?? ""); })
      .catch(() => setError("Failed to load department details."))
      .finally(() => setLoading(false));
  }, [deptId, token, open]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/departments/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || null }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData(prev => prev ? { ...prev, name: updated.name, description: updated.description } : null);
      setEditing(false);
      toast.success("Department updated");
      onUpdated?.();
    } catch {
      toast.error("Failed to update department");
    } finally {
      setSaving(false);
    }
  };

  const roleGroups = data
    ? data.members.reduce<Record<string, Member[]>>((acc, m) => {
        (acc[m.role] ??= []).push(m);
        return acc;
      }, {})
    : {};

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="text-base font-bold h-8 px-2"
                  autoFocus
                />
              ) : (
                <SheetTitle className="text-lg leading-tight">{data?.name ?? "Department"}</SheetTitle>
              )}
              <SheetDescription className="mt-1 text-xs">
                Manage department members and details
              </SheetDescription>
            </div>
            {canEdit && !loading && !error && (
              <div className="flex gap-1 flex-shrink-0">
                {editing ? (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(false); setEditName(data?.name ?? ""); setEditDesc(data?.description ?? ""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8" onClick={save} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setEditing(true)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <div className="px-6 py-5 space-y-5">
              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</p>
                {editing ? (
                  <Textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Brief description of this department…"
                    rows={3}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">
                    {data.description || <span className="text-muted-foreground italic">No description provided.</span>}
                  </p>
                )}
              </div>

              <Separator />

              {/* Stats */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Overview</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-foreground">{data.staffCount}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Total Staff</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 text-center">
                    <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{data.activeCount}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Active</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${data.inactiveCount > 0 ? "bg-red-50 dark:bg-red-950/40" : "bg-muted/40"}`}>
                    <p className={`text-xl font-extrabold ${data.inactiveCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>{data.inactiveCount}</p>
                    <p className={`text-[11px] mt-0.5 ${data.inactiveCount > 0 ? "text-red-500" : "text-muted-foreground"}`}>Inactive</p>
                  </div>
                </div>
              </div>

              {/* Role breakdown */}
              {Object.keys(roleGroups).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(roleGroups).map(([role, members]) => (
                        <span key={role} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleBadge(role)}`}>
                          {role}
                          <span className="bg-white/40 dark:bg-black/20 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            {members.length}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Members list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Members ({data.staffCount})
                  </p>
                </div>

                {data.members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <Users2 className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No staff assigned to this department.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {data.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => { onClose(); setLocation(`/staff/${member.id}`); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className={`w-9 h-9 bg-gradient-to-br ${avatarColor(member.role)} rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                          {member.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                              {member.lastName}, {member.firstName}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleBadge(member.role)}`}>
                              {member.role}
                            </Badge>
                            {member.isActive ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-500">
                                <XCircle className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {member.shift && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="w-3 h-3" />{member.shift}
                              </span>
                            )}
                            {member.contactNumber && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Phone className="w-3 h-3" />{member.contactNumber}
                              </span>
                            )}
                            {member.employeeId && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Hash className="w-3 h-3" />{member.employeeId}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
