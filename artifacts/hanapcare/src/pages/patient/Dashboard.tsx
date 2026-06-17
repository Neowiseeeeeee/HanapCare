import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, FileText, CreditCard, ChevronRight,
  Heart, Stethoscope, FlaskConical, Pill,
  UserCheck, ClipboardList, Key, Loader2, CheckCircle2, AlertCircle,
  Clock, Building2, Search, ChevronLeft, X, User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type Tab = "overview" | "appointments" | "records" | "prescriptions" | "lab-results" | "billing" | "profile";
type AppFilter = "upcoming" | "past" | "cancelled";
type BookStep = "list" | "doctor" | "datetime" | "reason" | "confirm" | "success";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentName: string | null;
  availability: string | null;
}

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  departmentName: string | null;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  queueNumber: number;
  reason: string | null;
}

const ALL_SLOTS = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "01:00 PM","01:30 PM","02:00 PM","02:30 PM",
  "03:00 PM","03:30 PM","04:00 PM","04:30 PM",
];

const STATUS_STYLE: Record<string, string> = {
  Pending:   "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  Confirmed: "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300",
  CheckedIn: "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
  Ongoing:   "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  Completed: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
  Cancelled: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
};

const QUICK_ACTIONS = [
  { icon: CalendarDays, label: "Book Appointment", desc: "Schedule a visit with a specialist", tab: "appointments" as Tab, bg: "bg-sky-50 dark:bg-sky-950", iconColor: "text-sky-600" },
  { icon: FileText,     label: "My Records",       desc: "View your health history",          tab: "records"       as Tab, bg: "bg-violet-50 dark:bg-violet-950", iconColor: "text-violet-600" },
  { icon: Pill,         label: "My Prescriptions", desc: "View active prescriptions",         tab: "prescriptions" as Tab, bg: "bg-amber-50 dark:bg-amber-950",   iconColor: "text-amber-600" },
  { icon: FlaskConical, label: "My Lab Results",   desc: "View your test results",            tab: "lab-results"   as Tab, bg: "bg-emerald-50 dark:bg-emerald-950", iconColor: "text-emerald-600" },
];
const SERVICES = [
  { icon: Stethoscope, label: "Consultations", desc: "Outpatient & specialist visits" },
  { icon: FlaskConical, label: "Laboratory", desc: "Blood tests & diagnostics" },
  { icon: Heart, label: "Emergency", desc: "24/7 emergency care" },
  { icon: Pill, label: "Pharmacy", desc: "In-house dispensing" },
];

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center">
      <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-muted-foreground/40" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">{desc}</p>
      {action}
    </div>
  );
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const dateStr = new Date(appt.appointmentDate + "T00:00:00").toLocaleDateString("en-PH", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Dr. {appt.doctorName}</p>
            <p className="text-xs text-sky-600 dark:text-sky-400">{appt.doctorSpecialization}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[appt.status] ?? "bg-muted text-muted-foreground"}`}>
          {appt.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /><span>{dateStr}</span></div>
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{appt.timeSlot}</span></div>
        {appt.departmentName && <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /><span>{appt.departmentName}</span></div>}
      </div>
      {appt.reason && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 line-clamp-2">{appt.reason}</p>
      )}
    </div>
  );
}

// ─── Inline Booking Wizard ────────────────────────────────────────────────────
function BookingWizard({ token, onDone, onCancel }: { token: string | null; onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<Exclude<BookStep, "list">>("doctor");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/doctors")
      .then(r => r.json())
      .then(d => setDoctors(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) { setTakenSlots([]); return; }
    setLoadingSlots(true);
    setSelectedSlot("");
    fetch(`/api/appointments/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`)
      .then(r => r.json())
      .then(d => setTakenSlots(Array.isArray(d) ? d : []))
      .catch(() => setTakenSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor?.id, selectedDate]);

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    return `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.departmentName ?? "").toLowerCase().includes(q);
  });

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim() || !token) return;
    setSubmitting(true);
    setBookingError("");
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ doctorId: selectedDoctor.id, appointmentDate: selectedDate, timeSlot: selectedSlot, reason: reason.trim(), notes: notes.trim() || undefined }),
      });
      if (!res.ok) { const e = await res.json(); setBookingError(e.error ?? "Booking failed."); return; }
      const appt = await res.json();
      setBookingId(appt.id);
      setStep("success");
    } catch { setBookingError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const goBack = () => {
    if (step === "doctor") onCancel();
    else if (step === "datetime") setStep("doctor");
    else if (step === "reason") setStep("datetime");
    else if (step === "confirm") setStep("reason");
  };

  const STEPS: Exclude<BookStep, "list" | "success">[] = ["doctor", "datetime", "reason", "confirm"];
  const stepIdx = STEPS.indexOf(step as any);

  // ── Success ──
  if (step === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-foreground">Appointment Requested!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          Your appointment with <strong>Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</strong> on{" "}
          <strong>{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong>{" "}
          at <strong>{selectedSlot}</strong> has been submitted.
        </p>
        {bookingId && (
          <p className="text-sm text-muted-foreground">
            Reference: <span className="font-mono font-bold text-foreground">#{String(bookingId).padStart(5, "0")}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">Our team will confirm within 24 hours via your email.</p>
        <div className="flex gap-3 justify-center pt-1">
          <button onClick={onDone} className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-colors">
            View My Appointments
          </button>
          <button
            onClick={() => { setStep("doctor"); setSelectedDoctor(null); setSelectedDate(""); setSelectedSlot(""); setReason(""); setNotes(""); setBookingId(null); setBookingError(""); }}
            className="px-5 py-2.5 border border-border hover:bg-muted text-foreground font-semibold rounded-xl text-sm transition-colors"
          >
            Book Another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={goBack} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {step === "doctor" && "Choose a Doctor"}
            {step === "datetime" && "Pick Date & Time"}
            {step === "reason" && "Reason for Visit"}
            {step === "confirm" && "Confirm Booking"}
          </h2>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < stepIdx ? "bg-primary text-primary-foreground" : i === stepIdx ? "bg-primary/20 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
            }`}>
              {i < stepIdx ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < stepIdx ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Doctor ── */}
      {step === "doctor" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by name or specialty…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          {loadingDoctors ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">No doctors found.</p>
          ) : (
            <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
              {filtered.map(doc => (
                <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep("datetime"); }}
                  className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-primary/40 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">Dr. {doc.firstName} {doc.lastName}</p>
                      <p className="text-sky-600 dark:text-sky-400 text-xs">{doc.specialization}</p>
                      {doc.departmentName && <p className="text-xs text-muted-foreground/60 truncate">{doc.departmentName}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Step 2: Date & Time ── */}
      {step === "datetime" && selectedDoctor && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
              <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Preferred Date</label>
            <input type="date" value={selectedDate} min={today} max={maxDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-foreground">Time Slot</label>
              {loadingSlots && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Checking…</span>}
            </div>
            {!selectedDate ? (
              <p className="text-xs text-muted-foreground italic">Select a date to see available slots.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {ALL_SLOTS.map(slot => {
                    const taken = takenSlots.includes(slot);
                    return (
                      <button key={slot} type="button" disabled={taken || loadingSlots} onClick={() => !taken && setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
                          taken ? "bg-muted/60 text-muted-foreground/40 border-border/40 cursor-not-allowed line-through"
                          : selectedSlot === slot ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
                        }`}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {takenSlots.length > 0 && <p className="text-xs text-muted-foreground mt-1.5"><span className="line-through">Crossed</span> = already booked</p>}
              </>
            )}
          </div>
          <button onClick={() => setStep("reason")} disabled={!selectedDate || !selectedSlot}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors">
            Continue
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Reason ── */}
      {step === "reason" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />
              {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedSlot}</span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Reason for Visit <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your symptoms or purpose of visit…" rows={3} maxLength={500}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, current medications…" rows={2} maxLength={500}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <button onClick={() => setStep("confirm")} disabled={!reason.trim()}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors">
            Review Booking
          </button>
        </motion.div>
      )}

      {/* ── Step 4: Confirm ── */}
      {step === "confirm" && selectedDoctor && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Summary</p>
              <div className="space-y-2.5">
                {[
                  { label: "Doctor", value: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` },
                  { label: "Specialty", value: selectedDoctor.specialization },
                  { label: "Date", value: new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Time", value: selectedSlot },
                  { label: "Reason", value: reason },
                  ...(notes ? [{ label: "Notes", value: notes }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
                    <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {bookingError && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{bookingError}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">This is a booking request. Our team will confirm within 24 hours.</p>
          <button onClick={handleBook} disabled={submitting}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><CheckCircle2 className="w-4 h-4" />Confirm Appointment</>}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Appointments Tab ─────────────────────────────────────────────────────────
function AppointmentsTab({ token }: { token: string | null }) {
  const [bookStep, setBookStep] = useState<BookStep>("list");
  const [filter, setFilter] = useState<AppFilter>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/appointments/my?filter=${filter}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAppointments(Array.isArray(d) ? d : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [filter, token, refreshKey]);

  if (bookStep !== "list") {
    return (
      <BookingWizard
        token={token}
        onDone={() => { setBookStep("list"); setFilter("upcoming"); setRefreshKey(k => k + 1); }}
        onCancel={() => setBookStep("list")}
      />
    );
  }

  const filters: { key: AppFilter; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your upcoming visits.</p>
        </div>
        <button onClick={() => setBookStep("doctor")}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <CalendarDays className="w-4 h-4" /> Book New
        </button>
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" /></div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filter === "upcoming" ? "No upcoming appointments" : filter === "past" ? "No past appointments" : "No cancelled appointments"}
          desc={filter === "upcoming" ? "Book your first appointment to get started with your care." : "Your appointment history will appear here."}
          action={filter === "upcoming" ? (
            <button onClick={() => setBookStep("doctor")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
              Book Appointment <ChevronRight className="w-4 h-4" />
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-3">
          {appointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
        </div>
      )}
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [roleCode, setRoleCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [redeemMsg, setRedeemMsg] = useState("");

  const params = new URLSearchParams(search);
  const activeTab = (params.get("tab") as Tab) ?? "overview";

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleCode.trim() || !token) return;
    setRedeemStatus("loading");
    try {
      const res = await fetch("/api/role-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: roleCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setRedeemStatus("success");
      setRedeemMsg(`Role updated to ${data.newRole}! Redirecting…`);
      setTimeout(() => setLocation("/dashboard"), 1500);
    } catch (err: unknown) {
      setRedeemStatus("error");
      setRedeemMsg(err instanceof Error ? err.message : "Redemption failed");
    }
  };

  const profilePct = (() => {
    if (!user) return 0;
    const fields = [user.phone, user.dateOfBirth, user.gender, user.address, user.emergencyContactName, user.emergencyContactPhone];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  const goToTab = (tab: Tab) => setLocation(`/dashboard?tab=${tab}`);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{greeting}, {firstName}! 👋</h1>
              <p className="text-muted-foreground mt-1 text-sm">Here's an overview of your health activity.</p>
            </div>
            {profilePct < 100 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Your profile is {profilePct}% complete</p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">Add your health details so your care team is always prepared.</p>
                </div>
                <Link href="/profile-setup" className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors">Complete</Link>
              </div>
            )}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map(action => (
                  <button key={action.label} onClick={() => goToTab(action.tab)}
                    className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left">
                    <div className={`w-11 h-11 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Appointments</h2>
                <button onClick={() => goToTab("appointments")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <EmptyState icon={CalendarDays} title="No upcoming appointments" desc="Book your first appointment to get started with your care."
                action={
                  <button onClick={() => goToTab("appointments")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
                    Book Appointment <ChevronRight className="w-4 h-4" />
                  </button>
                }
              />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Our Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICES.map(s => (
                  <Link key={s.label} href="/services" className="bg-card rounded-xl border border-border px-4 py-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><s.icon className="w-5 h-5 text-primary" /></div>
                    <div><p className="font-semibold text-foreground text-sm">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── APPOINTMENTS (inline booking) ── */}
        {activeTab === "appointments" && <AppointmentsTab token={token} />}

        {/* ── RECORDS ── */}
        {activeTab === "records" && (
          <>
            <div><h1 className="text-2xl font-extrabold text-foreground">My Health Records</h1><p className="text-muted-foreground text-sm mt-1">Your medical history and consultation notes in one place.</p></div>
            <div className="grid sm:grid-cols-2 gap-5">
              <EmptyState icon={ClipboardList} title="No consultations yet" desc="Notes and summaries from your doctor visits will appear here." />
              <EmptyState icon={FileText} title="No medical documents yet" desc="Your discharge summaries and medical certificates will appear here." />
            </div>
          </>
        )}

        {/* ── PRESCRIPTIONS ── */}
        {activeTab === "prescriptions" && (
          <>
            <div><h1 className="text-2xl font-extrabold text-foreground">My Prescriptions</h1><p className="text-muted-foreground text-sm mt-1">Active and past prescriptions issued by your doctors.</p></div>
            <div className="flex gap-2">
              {["Active","Completed","All"].map(f => <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f==="Active"?"bg-primary/10 text-primary":"bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>)}
            </div>
            <EmptyState icon={Pill} title="No prescriptions found" desc="Prescriptions issued by your doctor after a consultation will appear here." />
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Never take prescription medications without doctor supervision.</span>
            </div>
          </>
        )}

        {/* ── LAB RESULTS ── */}
        {activeTab === "lab-results" && (
          <>
            <div><h1 className="text-2xl font-extrabold text-foreground">My Lab Results</h1><p className="text-muted-foreground text-sm mt-1">Laboratory test results from your visits.</p></div>
            <div className="flex gap-2">
              {["All Results","Blood Tests","Imaging","Other"].map(f => <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f==="All Results"?"bg-primary/10 text-primary":"bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>)}
            </div>
            <EmptyState icon={FlaskConical} title="No lab results yet" desc="Your laboratory test results will appear here after processing." />
          </>
        )}

        {/* ── BILLING ── */}
        {activeTab === "billing" && (
          <>
            <div><h1 className="text-2xl font-extrabold text-foreground">My Billing</h1><p className="text-muted-foreground text-sm mt-1">View and manage your invoices and payment history.</p></div>
            <EmptyState icon={CreditCard} title="No bills found" desc="Your invoices and payment history will appear here once you've had a visit." />
          </>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <>
            <div className="flex items-center justify-between">
              <div><h1 className="text-2xl font-extrabold text-foreground">My Profile</h1><p className="text-muted-foreground text-sm mt-1">Your personal and health information.</p></div>
              <Link href="/profile-setup" className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
                <UserCheck className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" /> : initials}
                </div>
                <div>
                  <h2 className="font-extrabold text-foreground text-lg">{user?.fullName}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">Patient</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Phone", value: user?.phone },
                  { label: "Date of Birth", value: user?.dateOfBirth },
                  { label: "Gender", value: user?.gender },
                  { label: "Address", value: user?.address },
                  { label: "Blood Type", value: user?.bloodType },
                  { label: "Known Allergies", value: user?.allergies },
                  { label: "Emergency Contact", value: user?.emergencyContactName },
                  { label: "Emergency Phone", value: user?.emergencyContactPhone },
                ].map(field => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{field.label}</p>
                    <p className={`text-sm font-medium ${field.value ? "text-foreground" : "text-muted-foreground italic"}`}>{field.value || "Not provided"}</p>
                  </div>
                ))}
              </div>
              {user?.bio && <div className="mt-4 pt-4 border-t border-border"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes / Bio</p><p className="text-sm text-foreground leading-relaxed">{user.bio}</p></div>}
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center"><Key className="w-5 h-5 text-violet-600" /></div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Activate a Role Code</h3>
                  <p className="text-xs text-muted-foreground">Have a code from your administrator? Enter it to unlock staff access.</p>
                </div>
              </div>
              <form onSubmit={handleRedeemCode} className="flex gap-2">
                <input type="text" value={roleCode} onChange={e => { setRoleCode(e.target.value); setRedeemStatus("idle"); }} placeholder="e.g., DOC-ABC12345"
                  className="flex-1 px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase tracking-wider" maxLength={20} />
                <button type="submit" disabled={!roleCode.trim() || redeemStatus === "loading"}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-1.5">
                  {redeemStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                </button>
              </form>
              {redeemStatus !== "idle" && redeemMsg && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${redeemStatus === "success" ? "text-green-600" : "text-destructive"}`}>
                  {redeemStatus === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {redeemMsg}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
