import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Users, Shield, MessageCircle, ClipboardList, Plus, Copy, Trash2,
  CheckCheck, LogOut, ChevronRight, Settings, Activity, Key,
  UserCog, BarChart3, Bell, Menu, X, RefreshCw, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

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
  const { user, token, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
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
    { icon: Users, label: "Manage Patients", href: "/patients", color: "bg-sky-50 text-sky-600" },
    { icon: UserCog, label: "Staff Directory", href: "/staff", color: "bg-violet-50 text-violet-600" },
    { icon: ClipboardList, label: "Appointments", href: "/appointments", color: "bg-teal-50 text-teal-600" },
    { icon: BarChart3, label: "Reports", href: "/reports", color: "bg-emerald-50 text-emerald-600" },
    { icon: Activity, label: "Audit Logs", href: "/audit-logs", color: "bg-amber-50 text-amber-600" },
    { icon: Settings, label: "Settings", href: "/settings", color: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#0d1526] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <HanapCareLogoIcon size={32} />
            <span className="font-bold text-base text-white">
              Hanap<span className="text-sky-400">Care</span>
              <span className="ml-2 text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex p-2 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white leading-none">{user?.fullName}</p>
                <p className="text-xs text-white/40 mt-0.5">Administrator</p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-white/40 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-extrabold text-white">
            Good to see you, {firstName} 👋
          </h1>
          <p className="text-white/50 mt-1 text-sm">Here's your system overview and control panel.</p>
        </motion.div>

        {/* Section Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex gap-2 border-b border-white/10 pb-0"
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
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-8">
            {/* Quick Links */}
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all group text-center"
                  >
                    <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors leading-tight">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Role Code Teaser */}
            <div className="bg-gradient-to-r from-sky-600/20 to-violet-600/20 border border-sky-500/20 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">Role Assignment Codes</h3>
                <p className="text-white/50 text-sm mt-0.5">
                  Generate secure codes that staff members can redeem to unlock their role-specific dashboard access.
                </p>
              </div>
              <button
                onClick={() => { setActiveSection("role-codes"); if (!hasFetched) fetchCodes(); }}
                className="flex-shrink-0 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Manage Codes
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Shield className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">
                For full operations data, visit{" "}
                <Link href="/reports" className="text-sky-400 hover:underline font-medium">Reports</Link>
                {" "}and{" "}
                <Link href="/audit-logs" className="text-sky-400 hover:underline font-medium">Audit Logs</Link>.
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === "role-codes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Create Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                Create New Role Code
              </h2>
              <form onSubmit={handleCreateCode} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 font-medium mb-1.5 block uppercase tracking-wider">
                      Assign Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      {ALL_ROLES.map((r) => <option key={r} value={r} className="bg-[#0d1526]">{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium mb-1.5 block uppercase tracking-wider">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="e.g., For Dr. Johnson"
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 placeholder:text-white/30"
                    />
                  </div>
                </div>
                {createError && (
                  <p className="text-red-400 text-sm">{createError}</p>
                )}
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {creating ? "Generating…" : "Generate Code"}
                </button>
              </form>
            </div>

            {/* Code List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-white/40" />
                  Active Codes
                </h2>
                <button
                  onClick={fetchCodes}
                  disabled={codesLoading}
                  className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${codesLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {codesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                </div>
              ) : codes.length === 0 ? (
                <div className="py-12 text-center">
                  <Key className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No codes created yet. Generate your first code above.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {codes.map((code) => (
                    <div key={code.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <code className="font-mono text-sky-400 font-bold text-sm tracking-wider">
                            {code.code}
                          </code>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            !code.isActive || code.usedById
                              ? "bg-slate-500/20 text-slate-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {code.usedById ? "Used" : code.isActive ? "Active" : "Deactivated"}
                          </span>
                        </div>
                        <p className="text-white/50 text-xs">
                          Role: <span className="text-white/70 font-medium">{code.assignedRole}</span>
                          {code.description && <> · {code.description}</>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!code.usedById && code.isActive && (
                          <button
                            onClick={() => copyCode(code.code)}
                            className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            {copied === code.code ? (
                              <CheckCheck className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-300/80">
              <strong className="text-amber-300">How it works:</strong> Share the code with a staff member. They redeem it from their profile settings under "Activate Role Code". Their account will immediately gain access to the assigned role dashboard.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
