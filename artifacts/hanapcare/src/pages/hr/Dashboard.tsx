import { useLocation } from "wouter";
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

const STATS = [
  { label: "Total Staff", value: "9", sub: "Active employees", icon: Users2, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
  { label: "Present Today", value: "7", sub: "77% attendance rate", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { label: "On Leave", value: "2", sub: "Approved leaves", icon: CalendarOff, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  { label: "Pending Requests", value: "3", sub: "Needs your review", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950" },
];

const RECENT_LEAVE = [
  { name: "Dr. Jose Rizal", type: "Sick Leave", dates: "Jun 18–19, 2026", days: 2, status: "Pending" },
  { name: "Juan dela Cruz", type: "Annual Leave", dates: "Jun 20–25, 2026", days: 6, status: "Pending" },
  { name: "Lab Staff User", type: "Maternity/Paternity", dates: "Jul 10 – Aug 10, 2026", days: 30, status: "Pending" },
  { name: "Nurse Maria Santos", type: "Annual Leave", dates: "Jul 1–5, 2026", days: 5, status: "Approved" },
];

const ATTENDANCE_TODAY = [
  { name: "Dr. Jose Rizal", role: "Doctor", clockIn: "07:52 AM", status: "Present" },
  { name: "Nurse Maria Santos", role: "Nurse", clockIn: "05:58 AM", status: "Present" },
  { name: "Ana Reyes", role: "Receptionist", clockIn: "08:05 AM", status: "Late" },
  { name: "Juan dela Cruz", role: "Pharmacist", clockIn: "—", status: "Absent" },
  { name: "Lab Staff User", role: "Lab Staff", clockIn: "07:48 AM", status: "Present" },
];

const STATUS_CONFIG = {
  Pending:  { icon: AlertCircle, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950" },
  Approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Denied:   { icon: XCircle,     color: "text-destructive", bg: "bg-destructive/10" },
  Present:  { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  Late:     { icon: AlertCircle, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950" },
  Absent:   { icon: XCircle,     color: "text-destructive", bg: "bg-destructive/10" },
};

export default function HRDashboard() {
  const [, setLocation] = useLocation();
  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
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

      {/* Quick Links */}
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
        {/* Pending Leave Requests */}
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
            {RECENT_LEAVE.map((r) => {
              const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={`${r.name}-${r.dates}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.type} · {r.days}d · {r.dates}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />{r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Attendance Snapshot */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground text-sm">Today's Attendance</h2>
            </div>
            <button
              onClick={() => setLocation("/workforce/attendance")}
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {ATTENDANCE_TODAY.map((r) => {
              const cfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={r.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role} · Clock-in: {r.clockIn}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />{r.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Payroll — June 2026</h2>
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
            { label: "Total Employees", value: "9", sub: "On payroll this period" },
            { label: "Total Gross", value: "₱228,000", sub: "Before deductions" },
            { label: "Total Net Pay", value: "₱198,640", sub: "After SSS/PhilHealth/Pag-IBIG" },
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
