import { Banknote, Calendar, TrendingUp, Download, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";

const PAY_HISTORY = [
  { period: "May 2026", amount: "₱28,500.00", status: "Paid", date: "May 31, 2026" },
  { period: "April 2026", amount: "₱28,500.00", status: "Paid", date: "Apr 30, 2026" },
  { period: "March 2026", amount: "₱27,800.00", status: "Paid", date: "Mar 31, 2026" },
  { period: "February 2026", amount: "₱27,800.00", status: "Paid", date: "Feb 28, 2026" },
];

const DEDUCTIONS = [
  { label: "SSS Contribution", amount: "₱1,125.00" },
  { label: "PhilHealth", amount: "₱450.00" },
  { label: "Pag-IBIG", amount: "₱200.00" },
  { label: "Withholding Tax", amount: "₱1,240.00" },
];

export default function MyCompensation() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Compensation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your salary details, deductions, and pay history.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> Download Payslip
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Basic Monthly Salary", value: "₱28,500.00", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Next Payday", value: "Jun 30, 2026", icon: Calendar, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "YTD Earnings", value: "₱170,600.00", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
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

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Current Period Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Basic Pay</span>
              <span className="font-semibold text-foreground">₱28,500.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overtime (8h)</span>
              <span className="font-semibold text-emerald-600">+₱1,200.00</span>
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              {DEDUCTIONS.map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold text-destructive">-{d.amount}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground text-sm">Net Pay</span>
              <span className="font-extrabold text-foreground text-base">₱26,685.00</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Pay History</h2>
          <div className="space-y-3">
            {PAY_HISTORY.map((p) => (
              <div key={p.period} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.period}</p>
                  <p className="text-xs text-muted-foreground">Paid on {p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{p.amount}</p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Salary information is confidential. For concerns about your compensation, contact HR directly.</span>
      </div>
    </div>
  );
}
