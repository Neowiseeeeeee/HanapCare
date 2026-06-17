import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  Users2, Clock, CalendarOff, Banknote, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, TrendingUp, UserPlus,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Staff Directory", href: "/staff", icon: Users2, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  { label: "Attendance", href: "/workforce/attendance", icon: Clock, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  { label: "Leave Requests", href: "/workforce/leave", icon: CalendarOff, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  { label: "Payroll", href: "/workforce/payroll", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
];

const STATUS_CONFIG = {
  Pending:  { icon: AlertCircle, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950" },
  Approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Denied:   { icon: XCircle,     color: "text-destructive", bg: "bg-destructive/10" },
};

interface HRStats {
  totalStaff: number;
  pendingLeaveRequests: number;
  staffOnLeaveToday: number;
  recentLeave: Array<{
    id: number;
    staffFirstName: string;
    staffLastName: string;
    staffRole: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    status: string;
  }>;
  staffList: Array<{
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    shift?: string | null;
  }>;
}

export default function HRDashboard() {
  const [, setLocation] = useLocation();
  const { token } = useAuth();
  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const { data: stats, isLoading } = useQuery<HRStats>({
    queryKey: ["hr-stats"],
    queryFn: async () => {
      const res = await fetch("/api/hr/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch HR stats");
      return res.json();
    },
    enabled: !!token,
  });

  const presentCount = (stats?.totalStaff ?? 0) - (stats?.staffOnLeaveToday ?? 0);
  const attendanceRate = stats?.totalStaff
    ? Math.round((presentCount / stats.totalStaff) * 100)
    : 0;

  const statCards = [
    { label: "Total Staff", value: stats?.totalStaff ?? "…", sub: "Active employees", icon: Users2, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
    { label: "Present Today", value: isLoading ? "…" : presentCount, sub: `${attendanceRate}% attendance rate`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
    { label: "On Leave", value: stats?.staffOnLeaveToday ?? "…", sub: "Approved leaves", icon: CalendarOff, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
    { label: "Pending Requests", value: stats?.pendingLeaveRequests ?? "…", sub: "Needs your review", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">{today}</p>
        </div>
        <button
          onClick={() => setLocation("/hr/onboard")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Onboard Employee
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-foreground leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/60 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => setLocation(link.href)}
              className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-muted/30 transition-all group text-center"
            >
              <div className={`w-12 h-12 ${link.bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <link.icon className={`w-6 h-6 ${link.color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Leave Requests — live data */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Leave Requests</h2>
            </div>
            <button
              onClick={() => setLocation("/workforce/leave")}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              [1,2,3].map(i => <div key={i} className="px-5 py-3.5 animate-pulse h-14 bg-muted/30" />)
            ) : !stats?.recentLeave?.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No leave requests yet.</div>
            ) : stats.recentLeave.map((r) => {
              const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Pending;
              const name = `${r.staffFirstName} ${r.staffLastName}`;
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.leaveType} · {r.days}d · {r.fromDate} – {r.toDate}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />{r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Directory Snapshot — live data */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Active Staff</h2>
            </div>
            <button
              onClick={() => setLocation("/staff")}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              [1,2,3].map(i => <div key={i} className="px-5 py-3.5 animate-pulse h-14 bg-muted/30" />)
            ) : !stats?.staffList?.length ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No staff records yet.</div>
            ) : stats.staffList.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {s.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted-foreground">{s.role}{s.shift ? ` · ${s.shift} shift` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Payroll Overview</h2>
          </div>
          <button
            onClick={() => setLocation("/workforce/payroll")}
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Manage payroll <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { label: "Total Employees", value: isLoading ? "…" : String(stats?.totalStaff ?? 0), sub: "On payroll this period" },
            { label: "Pending Leave", value: isLoading ? "…" : String(stats?.pendingLeaveRequests ?? 0), sub: "Requests awaiting approval" },
            { label: "On Leave Today", value: isLoading ? "…" : String(stats?.staffOnLeaveToday ?? 0), sub: "Staff currently on leave" },
          ].map((item) => (
            <div key={item.label} className="px-6 py-5">
              <p className="text-xl font-extrabold text-foreground">{item.value}</p>
              <p className="text-xs font-semibold text-foreground/70 mt-0.5">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
