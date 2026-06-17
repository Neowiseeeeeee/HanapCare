import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Users, Shield, ClipboardList, Plus, Copy, Trash2,
  CheckCheck, ChevronRight, Activity, Key,
  UserCog, BarChart3, RefreshCw, Loader2, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const ALL_ROLES = ["Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "Admin"];

interface RoleCode {
  id: number;
  code: string;
  assignedRole: string;
  description: string | null;
  isActive: boolean;
  usedById: number | null;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

function useRoleCodes(token: string | null) {
  const [codes, setCodes] = useState<RoleCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetch_ = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/role-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCodes(await res.json());
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  return { codes, loading, hasFetched, fetch_, setCodes };
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "role-codes">("overview");
  const [copied, setCopied] = useState<string | null>(null);
  const [newRole, setNewRole] = useState(ALL_ROLES[0]);
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const { codes, loading: codesLoading, hasFetched, fetch_: fetchCodes, setCodes } = useRoleCodes(token);

  const firstName = user?.fullName?.split(" ")[0] ?? "Admin";

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/role-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignedRole: newRole, description: newDesc || undefined }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? "Failed to create code");
      }
      const created = await res.json();
      setCodes((prev) => [created, ...prev]);
      setNewDesc("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCode = async (id: number) => {
    try {
      await fetch(`/api/role-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const QUICK_LINKS = [
    { icon: Users, label: "Manage Patients", href: "/patients", color: "bg-sky-50 dark:bg-sky-950 text-sky-600" },
    { icon: UserCog, label: "Staff Directory", href: "/staff", color: "bg-violet-50 dark:bg-violet-950 text-violet-600" },
    { icon: ClipboardList, label: "Appointments", href: "/appointments", color: "bg-teal-50 dark:bg-teal-950 text-teal-600" },
    { icon: BarChart3, label: "Reports", href: "/reports", color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600" },
    { icon: Activity, label: "Audit Logs", href: "/audit-logs", color: "bg-amber-50 dark:bg-amber-950 text-amber-600" },
    { icon: Settings, label: "Settings", href: "/settings", color: "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-extrabold text-foreground">
          Good to see you, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">System overview and control panel.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex gap-2 border-b border-border overflow-x-auto"
      >
        {[
          { key: "overview", label: "Overview", icon: BarChart3 },
          { key: "role-codes", label: "Role Codes", icon: Key },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSection(tab.key as typeof activeSection);
              if (tab.key === "role-codes" && !hasFetched) fetchCodes();
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeSection === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {activeSection === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 transition-all text-center"
                >
                  <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-500/10 to-violet-500/10 border border-sky-500/20 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Role Assignment Codes</h3>
              <p className="text-muted-foreground text-sm mt-0.5">
                Generate secure codes that staff members can redeem to unlock their role-specific dashboard access.
              </p>
            </div>
            <button
              onClick={() => { setActiveSection("role-codes"); if (!hasFetched) fetchCodes(); }}
              className="flex-shrink-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
            >
              Manage Codes
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              For full operations data, visit{" "}
              <Link href="/reports" className="text-primary hover:underline font-medium">Reports</Link>
              {" "}and{" "}
              <Link href="/audit-logs" className="text-primary hover:underline font-medium">Audit Logs</Link>.
            </p>
          </div>
        </motion.div>
      )}

      {activeSection === "role-codes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Role Code
            </h2>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block uppercase tracking-wider">
                    Assign Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-background border border-input text-foreground rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block uppercase tracking-wider">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g., For Dr. Johnson"
                    className="w-full bg-background border border-input text-foreground rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              {createError && (
                <p className="text-destructive text-sm">{createError}</p>
              )}
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-xl text-sm transition-colors"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {creating ? "Generating…" : "Generate Code"}
              </button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                Active Codes
              </h2>
              <button
                onClick={fetchCodes}
                disabled={codesLoading}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${codesLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {codesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
              </div>
            ) : codes.length === 0 ? (
              <div className="py-12 text-center">
                <Key className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No codes created yet. Generate your first code above.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {codes.map((code) => (
                  <div key={code.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="font-mono text-primary font-bold text-sm tracking-wider">
                          {code.code}
                        </code>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          !code.isActive || code.usedById
                            ? "bg-muted text-muted-foreground"
                            : "bg-green-500/10 text-green-600"
                        }`}>
                          {code.usedById ? "Used" : code.isActive ? "Active" : "Deactivated"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Role: <span className="text-foreground font-medium">{code.assignedRole}</span>
                        {code.description && <> · {code.description}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!code.usedById && code.isActive && (
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Copy code"
                        >
                          {copied === code.code ? (
                            <CheckCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCode(code.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-600 dark:text-amber-400">
            <strong>How it works:</strong> Share the code with a staff member. They redeem it from their profile settings under "Activate Role Code". Their account will immediately gain access to the assigned role dashboard.
          </div>
        </motion.div>
      )}
    </div>
  );
}
