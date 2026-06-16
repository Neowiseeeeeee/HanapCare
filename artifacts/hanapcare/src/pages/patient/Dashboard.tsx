import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, FileText, CreditCard, ChevronRight, User,
  Heart, Stethoscope, FlaskConical, Pill, LayoutDashboard,
  UserCheck, ClipboardList, Key, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type Tab = "overview" | "appointments" | "records" | "prescriptions" | "lab-results" | "billing" | "profile";

const QUICK_ACTIONS = [
  {
    icon: CalendarDays,
    label: "Book Appointment",
    desc: "Schedule a visit with a specialist",
    href: "/contact",
    bg: "bg-sky-50 dark:bg-sky-950",
    iconColor: "text-sky-600",
  },
  {
    icon: FileText,
    label: "My Records",
    desc: "View your health history and results",
    tab: "records" as Tab,
    bg: "bg-violet-50 dark:bg-violet-950",
    iconColor: "text-violet-600",
  },
  {
    icon: Pill,
    label: "My Prescriptions",
    desc: "View active prescriptions",
    tab: "prescriptions" as Tab,
    bg: "bg-amber-50 dark:bg-amber-950",
    iconColor: "text-amber-600",
  },
  {
    icon: FlaskConical,
    label: "My Lab Results",
    desc: "View your test results",
    tab: "lab-results" as Tab,
    bg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600",
  },
];

const SERVICES = [
  { icon: Stethoscope, label: "Consultations", desc: "Outpatient & specialist visits" },
  { icon: FlaskConical, label: "Laboratory", desc: "Blood tests & diagnostics" },
  { icon: Heart, label: "Emergency", desc: "24/7 emergency care" },
  { icon: Pill, label: "Pharmacy", desc: "In-house dispensing" },
];

function EmptyState({
  icon: Icon, title, desc, action,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
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

export default function PatientDashboard() {
  const { user, token, logout } = useAuth();
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
  const initials = user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

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
      setTimeout(() => { setLocation("/dashboard"); }, 1500);
    } catch (err: unknown) {
      setRedeemStatus("error");
      setRedeemMsg(err instanceof Error ? err.message : "Redemption failed");
    }
  };

  const profilePct = (() => {
    if (!user) return 0;
    const fields = [user.phone, user.dateOfBirth, user.gender, user.address, user.emergencyContactName, user.emergencyContactPhone];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  })();

  const goToTab = (tab: Tab) => setLocation(`/dashboard?tab=${tab}`);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">
                {greeting}, {firstName}! 👋
              </h1>
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
                <Link
                  href="/profile-setup"
                  className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Complete
                </Link>
              </div>
            )}

            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.tab ? goToTab(action.tab) : setLocation(action.href ?? "#")}
                    className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
                  >
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
                <button
                  onClick={() => goToTab("appointments")}
                  className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <EmptyState
                icon={CalendarDays}
                title="No upcoming appointments"
                desc="Book your first appointment to get started with your care."
                action={
                  <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
                    Book Appointment <ChevronRight className="w-4 h-4" />
                  </Link>
                }
              />
            </div>

            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Our Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICES.map((s) => (
                  <Link
                    key={s.label}
                    href="/services"
                    className="bg-card rounded-xl border border-border px-4 py-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── APPOINTMENTS ── */}
        {activeTab === "appointments" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">My Appointments</h1>
                <p className="text-muted-foreground text-sm mt-1">Track and manage your upcoming visits.</p>
              </div>
              <Link href="/contact" className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
                <CalendarDays className="w-4 h-4" /> Book New
              </Link>
            </div>
            <div className="flex gap-2">
              {["Upcoming", "Past", "Cancelled"].map((f) => (
                <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f === "Upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {f}
                </button>
              ))}
            </div>
            <EmptyState
              icon={CalendarDays}
              title="No appointments found"
              desc="Your upcoming appointments will appear here once booked."
              action={
                <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm transition-all">
                  Book Appointment <ChevronRight className="w-4 h-4" />
                </Link>
              }
            />
          </>
        )}

        {/* ── RECORDS ── */}
        {activeTab === "records" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Health Records</h1>
              <p className="text-muted-foreground text-sm mt-1">Your medical history and consultation notes in one place.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <EmptyState
                icon={ClipboardList}
                title="No consultations yet"
                desc="Notes and summaries from your doctor visits will appear here."
              />
              <EmptyState
                icon={FileText}
                title="No medical documents yet"
                desc="Your discharge summaries and medical certificates will appear here."
              />
            </div>
          </>
        )}

        {/* ── MY PRESCRIPTIONS ── */}
        {activeTab === "prescriptions" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Prescriptions</h1>
              <p className="text-muted-foreground text-sm mt-1">Active and past prescriptions issued by your doctors.</p>
            </div>
            <div className="flex gap-2">
              {["Active", "Completed", "All"].map((f) => (
                <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f === "Active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {f}
                </button>
              ))}
            </div>
            <EmptyState
              icon={Pill}
              title="No prescriptions found"
              desc="Prescriptions issued by your doctor after a consultation will appear here."
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Never take prescription medications without doctor supervision. Always follow dosage instructions carefully.</span>
            </div>
          </>
        )}

        {/* ── MY LAB RESULTS ── */}
        {activeTab === "lab-results" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Lab Results</h1>
              <p className="text-muted-foreground text-sm mt-1">Laboratory test results from your visits to our facility.</p>
            </div>
            <div className="flex gap-2">
              {["All Results", "Blood Tests", "Imaging", "Other"].map((f) => (
                <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f === "All Results" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {f}
                </button>
              ))}
            </div>
            <EmptyState
              icon={FlaskConical}
              title="No lab results yet"
              desc="Your laboratory test results will appear here after processing."
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-sky-600" />
              <span className="text-sky-700 dark:text-sky-300">
                Results are typically available within 24–48 hours. Please consult your doctor for interpretation.
              </span>
            </div>
          </>
        )}

        {/* ── BILLING ── */}
        {activeTab === "billing" && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Billing</h1>
              <p className="text-muted-foreground text-sm mt-1">View and manage your invoices and payment history.</p>
            </div>
            <EmptyState
              icon={CreditCard}
              title="No bills found"
              desc="Your invoices and payment history will appear here once you've had a visit."
            />
          </>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>
                <p className="text-muted-foreground text-sm mt-1">Your personal and health information.</p>
              </div>
              <Link
                href="/profile-setup"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors"
              >
                <UserCheck className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                  ) : initials}
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
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{field.label}</p>
                    <p className={`text-sm font-medium ${field.value ? "text-foreground" : "text-muted-foreground italic"}`}>
                      {field.value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>

              {user?.bio && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes / Bio</p>
                  <p className="text-sm text-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Activate a Role Code</h3>
                  <p className="text-xs text-muted-foreground">Have a code from your administrator? Enter it here to unlock staff access.</p>
                </div>
              </div>
              <form onSubmit={handleRedeemCode} className="flex gap-2">
                <input
                  type="text"
                  value={roleCode}
                  onChange={(e) => { setRoleCode(e.target.value); setRedeemStatus("idle"); }}
                  placeholder="e.g., DOC-ABC12345"
                  className="flex-1 px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 uppercase tracking-wider"
                  maxLength={20}
                />
                <button
                  type="submit"
                  disabled={!roleCode.trim() || redeemStatus === "loading"}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-1.5"
                >
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
