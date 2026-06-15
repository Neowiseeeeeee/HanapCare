import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Phone, Calendar, MapPin, Heart, AlertTriangle, UserCheck, ChevronRight, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function ProfileSetup() {
  const { user, updateProfile, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bio: "",
    bloodType: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await updateProfile({ ...form, profileComplete: true });
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateProfile({ profileComplete: true });
    } catch {
      // ignore
    }
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-none sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <HanapCareLogoIcon size={32} />
          <span className="font-bold text-slate-900">
            Hanap<span className="text-sky-500">Care</span>
          </span>
        </div>
        <button onClick={() => { logout(); setLocation("/"); }} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          Sign out
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-sky-500/25">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {firstName}! 🎉
            </h1>
            <p className="text-slate-500 mt-2 text-base max-w-md mx-auto">
              Let's set up your health profile. This helps your care team give you the best experience. All fields except the basics are optional.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Personal */}
              <Card icon={<User className="w-5 h-5 text-sky-600" />} title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone Number" hint="Optional">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Date of Birth" hint="Optional">
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Gender" hint="Optional">
                    <select
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select gender</option>
                      {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="City / Address" hint="Optional">
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="e.g., New York, NY"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="About You / Medical Notes" hint="Optional" className="mt-4">
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Any pre-existing conditions, notes for your doctor, or anything useful to know…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </Card>

              {/* Medical */}
              <Card icon={<Heart className="w-5 h-5 text-rose-500" />} title="Medical Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Blood Type" hint="Optional">
                    <select
                      value={form.bloodType}
                      onChange={(e) => handleChange("bloodType", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select blood type</option>
                      {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </Field>
                  <Field label="Known Allergies" hint="Optional">
                    <input
                      type="text"
                      value={form.allergies}
                      onChange={(e) => handleChange("allergies", e.target.value)}
                      placeholder="e.g., Penicillin, Peanuts"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} title="Emergency Contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Contact Name" hint="Optional">
                    <input
                      type="text"
                      value={form.emergencyContactName}
                      onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Contact Phone" hint="Optional">
                    <input
                      type="tel"
                      value={form.emergencyContactPhone}
                      onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </Card>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25 text-sm"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Complete Setup</>
                )}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-3.5 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 font-medium rounded-xl transition-colors text-sm"
              >
                Skip for now
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              You can always update this information later from your profile settings.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all";

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {hint && <span className="text-slate-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
