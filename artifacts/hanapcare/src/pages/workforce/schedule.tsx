import { CalendarDays, Clock, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFTS = [
  { label: "Morning", time: "06:00 – 14:00", icon: Sun, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-800" },
  { label: "Afternoon", time: "14:00 – 22:00", icon: Clock, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950", border: "border-sky-200 dark:border-sky-800" },
  { label: "Night", time: "22:00 – 06:00", icon: Moon, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950", border: "border-violet-200 dark:border-violet-800" },
];

const WEEK_SCHEDULE: Record<string, number | null> = {
  Mon: 0, Tue: 1, Wed: null, Thu: 0, Fri: 1, Sat: null, Sun: null,
};

const now = new Date();
const weekStart = new Date(now);
weekStart.setDate(now.getDate() - now.getDay() + 1);

function getWeekLabel(offset: number) {
  const start = new Date(weekStart);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function MySchedule() {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your upcoming shifts and on-call assignments.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Shifts This Week", value: "3", icon: CalendarDays, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-950" },
          { label: "Hours Scheduled", value: "24h", icon: Clock, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
          { label: "Days Off", value: "3", icon: Sun, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : ""}</p>
            <p className="text-xs text-muted-foreground">{getWeekLabel(weekOffset)}</p>
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="divide-y divide-border">
          {DAYS.map((day, i) => {
            const shiftIdx = weekOffset === 0 ? WEEK_SCHEDULE[day] : null;
            const shift = shiftIdx !== null && shiftIdx !== undefined ? SHIFTS[shiftIdx] : null;
            const today = i === ((now.getDay() + 6) % 7);

            return (
              <div key={day} className={`flex items-center gap-4 px-6 py-4 ${today && weekOffset === 0 ? "bg-primary/5" : ""}`}>
                <div className={`w-12 text-center flex-shrink-0`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${today && weekOffset === 0 ? "text-primary" : "text-muted-foreground"}`}>{day}</p>
                  {today && weekOffset === 0 && (
                    <span className="text-[10px] font-bold text-primary">Today</span>
                  )}
                </div>
                {shift ? (
                  <div className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl border ${shift.bg} ${shift.border}`}>
                    <shift.icon className={`w-4 h-4 ${shift.color} flex-shrink-0`} />
                    <div>
                      <p className={`text-sm font-semibold ${shift.color}`}>{shift.label} Shift</p>
                      <p className="text-xs text-muted-foreground">{shift.time}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 text-muted-foreground/60">
                    <span className="text-sm">Day Off</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Schedule changes must be approved by your department head. Contact HR to request a shift swap.</span>
      </div>
    </div>
  );
}
