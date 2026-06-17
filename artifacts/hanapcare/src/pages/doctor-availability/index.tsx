import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Stethoscope, Search, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentName?: string;
  availability?: string;
  isActive: boolean;
}

const STATUS_CONFIG = {
  Available: { label: "Available", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", dot: "bg-emerald-500" },
  Busy: { label: "In Consultation", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950", dot: "bg-amber-500" },
  "Off Duty": { label: "Off Duty", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground/40" },
};

type StatusKey = keyof typeof STATUS_CONFIG;

function parseAvailability(availability?: string): StatusKey {
  if (!availability) return "Off Duty";
  const lower = availability.toLowerCase();
  if (lower.includes("available") || lower.includes("yes") || lower.includes("mon") || lower.includes("daily")) return "Available";
  if (lower.includes("busy") || lower.includes("consultation") || lower.includes("no")) return "Busy";
  return "Available";
}

export default function DoctorAvailability() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StatusKey>("All");

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ["doctors-availability"],
    queryFn: async () => {
      const res = await fetch("/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return res.json();
    },
    enabled: !!token,
  });

  const activeDoctors = doctors.filter(d => d.isActive);

  const filtered = activeDoctors.filter((d) => {
    const name = `${d.firstName} ${d.lastName}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (d.specialization ?? "").toLowerCase().includes(search.toLowerCase());
    const status = parseAvailability(d.availability);
    const matchStatus = statusFilter === "All" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts: Record<StatusKey, number> = {
    Available: activeDoctors.filter(d => parseAvailability(d.availability) === "Available").length,
    Busy: activeDoctors.filter(d => parseAvailability(d.availability) === "Busy").length,
    "Off Duty": activeDoctors.filter(d => parseAvailability(d.availability) === "Off Duty").length,
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Doctor Availability</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Check which doctors are available before scheduling patient appointments.
          </p>
        </div>
        <button
          onClick={() => setLocation("/appointments")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
        >
          <Calendar className="w-4 h-4" /> Schedule Appointment
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(["Available", "Busy", "Off Duty"] as StatusKey[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
              <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">
                  {isLoading ? "…" : counts[s]}
                </p>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", "Available", "Busy", "Off Duty"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No doctors found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {search ? "Try adjusting your search query." : "No doctors match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doctor) => {
            const status = parseAvailability(doctor.availability);
            const cfg = STATUS_CONFIG[status];
            const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
            const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;
            return (
              <div key={doctor.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{doctor.specialization}</p>
                    {doctor.departmentName && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{doctor.departmentName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <button
                    onClick={() => setLocation("/appointments")}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Book →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
