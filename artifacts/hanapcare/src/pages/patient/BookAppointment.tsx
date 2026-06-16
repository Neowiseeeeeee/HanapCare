import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  CalendarDays, ChevronLeft, Stethoscope, Clock, CheckCircle2, Loader2,
  Search, User, Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentName: string | null;
  availability: string | null;
  contactNumber: string | null;
}

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

type Step = "doctor" | "datetime" | "reason" | "confirm" | "success";

export default function BookAppointment() {
  const { token } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>("doctor");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => setDoctors(data))
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }, []);

  const filteredDoctors = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.departmentName ?? "").toLowerCase().includes(q)
    );
  });

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate,
          timeSlot: selectedSlot,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Booking failed. Please try again.");
        return;
      }
      const appt = await res.json();
      setBookingId(appt.id);
      setStep("success");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16 space-y-5"
      >
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Appointment Requested!</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your appointment with <strong>Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</strong> on{" "}
          <strong>{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>{" "}
          at <strong>{selectedSlot}</strong> has been submitted.
        </p>
        <p className="text-muted-foreground text-sm">
          Booking reference: <span className="font-mono font-semibold text-foreground">#{String(bookingId).padStart(5, "0")}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Our team will confirm your appointment within 24 hours via your registered email.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => setLocation("/dashboard?tab=appointments")}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors text-sm"
          >
            View My Appointments
          </button>
          <button
            onClick={() => {
              setStep("doctor");
              setSelectedDoctor(null);
              setSelectedDate("");
              setSelectedSlot("");
              setReason("");
              setNotes("");
              setBookingId(null);
            }}
            className="px-5 py-2.5 border border-border hover:bg-muted text-foreground font-semibold rounded-xl transition-colors text-sm"
          >
            Book Another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (step === "doctor") setLocation("/dashboard");
            else if (step === "datetime") setStep("doctor");
            else if (step === "reason") setStep("datetime");
            else if (step === "confirm") setStep("reason");
          }}
          className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" /> Book Appointment
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {step === "doctor" && "Choose a doctor or specialist"}
            {step === "datetime" && "Pick your preferred date and time"}
            {step === "reason" && "Tell us the reason for your visit"}
            {step === "confirm" && "Review and confirm your booking"}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["doctor", "datetime", "reason", "confirm"] as Step[]).map((s, i) => {
          const steps: Step[] = ["doctor", "datetime", "reason", "confirm"];
          const idx = steps.indexOf(step);
          const sIdx = steps.indexOf(s);
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  sIdx < idx
                    ? "bg-primary text-primary-foreground"
                    : sIdx === idx
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {sIdx < idx ? "✓" : i + 1}
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 w-8 ${sIdx < idx ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Choose Doctor */}
      {step === "doctor" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or specialty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {loadingDoctors ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No doctors found.</div>
          ) : (
            <div className="grid gap-3">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setStep("datetime"); }}
                  className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-sky-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">
                        Dr. {doc.firstName} {doc.lastName}
                      </p>
                      <p className="text-sky-600 dark:text-sky-400 text-xs font-medium mt-0.5">{doc.specialization}</p>
                      {doc.departmentName && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground/60">{doc.departmentName}</span>
                        </div>
                      )}
                      {doc.availability && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{doc.availability}</p>
                      )}
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground/40 rotate-180 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Pick date & time */}
      {step === "datetime" && selectedDoctor && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
              <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Preferred Date</label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              max={maxDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Preferred Time Slot</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
                    selectedSlot === slot
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("reason")}
            disabled={!selectedDate || !selectedSlot}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors"
          >
            Continue
          </button>
        </motion.div>
      )}

      {/* Step 3: Reason */}
      {step === "reason" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{selectedSlot}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Reason for Visit <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or the purpose of this visit…"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, current medications, special requests…"
              rows={2}
              maxLength={1000}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <button
            onClick={() => setStep("confirm")}
            disabled={!reason.trim()}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors"
          >
            Review Booking
          </button>
        </motion.div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && selectedDoctor && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Appointment Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Doctor</span>
                  <span className="text-sm font-semibold text-foreground text-right">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Specialty</span>
                  <span className="text-sm font-semibold text-foreground text-right">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-semibold text-foreground text-right">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="text-sm font-semibold text-foreground text-right">{selectedSlot}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{reason}</span>
                </div>
                {notes && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <span className="text-sm text-foreground text-right max-w-[60%]">{notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By confirming, you agree that this is a booking request. Our team will confirm your appointment within 24 hours.
          </p>

          <button
            onClick={handleBook}
            disabled={submitting}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Confirm Appointment</>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
