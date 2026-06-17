import { useState } from "react";
import { Banknote, Play, Download, CheckCircle2, Clock, AlertCircle, Search } from "lucide-react";

const PAYROLL_RUNS = [
  { period: "June 2026", employees: 8, totalGross: "₱228,000.00", totalNet: "₱198,640.00", status: "In Progress", date: "Jun 30, 2026" },
  { period: "May 2026", employees: 8, totalGross: "₱228,000.00", totalNet: "₱198,640.00", status: "Completed", date: "May 31, 2026" },
  { period: "April 2026", employees: 8, totalGross: "₱224,600.00", totalNet: "₱195,780.00", status: "Completed", date: "Apr 30, 2026" },
  { period: "March 2026", employees: 7, totalGross: "₱196,600.00", totalNet: "₱171,340.00", status: "Completed", date: "Mar 31, 2026" },
];

const EMPLOYEES = [
  { name: "System Administrator", role: "Admin", gross: "₱32,000.00", deductions: "₱3,015.00", net: "₱28,985.00" },
  { name: "Dr. Jose Rizal", role: "Doctor", gross: "₱45,000.00", deductions: "₱4,215.00", net: "₱40,785.00" },
  { name: "Nurse Maria Santos", role: "Nurse", gross: "₱28,500.00", deductions: "₱3,015.00", net: "₱25,485.00" },
  { name: "Ana Reyes", role: "Receptionist", gross: "₱22,000.00", deductions: "₱2,615.00", net: "₱19,385.00" },
  { name: "Juan dela Cruz", role: "Pharmacist", gross: "₱30,000.00", deductions: "₱3,015.00", net: "₱26,985.00" },
  { name: "Lab Staff User", role: "Lab Staff", gross: "₱26,000.00", deductions: "₱2,815.00", net: "₱23,185.00" },
  { name: "Cashier User", role: "Cashier", gross: "₱24,000.00", deductions: "₱2,715.00", net: "₱21,285.00" },
  { name: "Support Agent", role: "Support", gross: "₱20,500.00", deductions: "₱2,615.00", net: "₱17,885.00" },
];

const STATUS_CONFIG = {
  Completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  "In Progress": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  Failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Payroll() {
  const [search, setSearch] = useState("");

  const filtered = EMPLOYEES.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage payroll runs and employee compensation records.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
            <Play className="w-4 h-4" /> Run Payroll
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total Employees", value: "8", icon: Banknote, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Total Gross (June)", value: "₱228,000", icon: Banknote, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Total Net (June)", value: "₱198,640", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Payroll Run History</h2>
        </div>
        <div className="divide-y divide-border">
          {PAYROLL_RUNS.map((run) => {
            const cfg = STATUS_CONFIG[run.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Completed;
            return (
              <div key={run.period} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{run.period}</p>
                  <p className="text-xs text-muted-foreground">{run.employees} employees · Due {run.date}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground">{run.totalNet}</p>
                  <p className="text-xs text-muted-foreground">Net · Gross {run.totalGross}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <cfg.icon className="w-3 h-3" /> {run.status}
                </span>
                <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0">View</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border gap-3">
          <h2 className="font-semibold text-foreground text-sm">Current Period — Employee Breakdown</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border border-input rounded-lg text-xs bg-background text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gross</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deductions</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr key={e.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {e.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground text-sm">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground text-sm">{e.role}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-sm text-foreground">{e.gross}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-sm text-destructive">-{e.deductions}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-sm font-semibold text-foreground">{e.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
