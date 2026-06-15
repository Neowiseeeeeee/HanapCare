import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, FileText, CreditCard, Bell, LogOut,
  ChevronRight, Clock, User, Menu, X, Heart,
  Stethoscope, FlaskConical, Pill, LayoutDashboard,
  UserCheck, ClipboardList, Key, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

type Tab = "overview" | "appointments" | "records" | "billing" | "profile";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "records", label: "My Records", icon: FileText },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
];

const QUICK_ACTIONS = [
  {
    icon: CalendarDays,
    label: "Book Appointment",
    desc: "Schedule a visit with a specialist",
    href: "/contact",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: FileText,
    label: "My Records",
    desc: "View your health history and results",
    href: "#",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    tab: "records" as Tab,
  },
  {
    icon: CreditCard,
    label: "Billing",
    desc: "Review and pay outstanding bills",
    href: "#",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tab: "billing" as Tab,
  },
  {
    icon: Pill,
    label: "Prescriptions",
    desc: "View active prescriptions",
    href: "#",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const SERVICES = [
  { icon: Stethoscope, label: "Consultations", desc: "Outpatient & specialist visits" },
  { icon: FlaskConical, label: "Laboratory", desc: "Blood tests & diagnostics" },
  { icon: Heart, label: "Emergency", desc: "24/7 emergency care" },
  { icon: Pill, label: "Pharmacy", desc: "In-house dispensing" },
];

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">{desc}</p>
      {action}
    </div>
  );
}

export default function PatientDashboard() {
  const { user, token, updateProfile, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleCode, setRoleCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [redeemMsg, setRedeemMsg] = useState("");

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HanapCareLogoIcon size={34} />
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              Hanap<span className="text-sky-500">Care</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : initials}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-slate-900 leading-none">{user?.fullName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Patient</p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-slate-100 px-4 py-3 space-y-2 bg-white">
            <div className="flex items-center gap-2.5 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{user?.fullName}</p>
                <p className="text-xs text-slate-400">Patient</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 py-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all -mb-px ${
                activeTab === tab.id
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    {greeting}, {firstName}! 👋
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm">Here's an overview of your health activity.</p>
                </div>

                {/* Profile completion banner */}
                {profilePct < 100 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-amber-800 text-sm">Your profile is {profilePct}% complete</p>
                      <p className="text-amber-600 text-xs mt-0.5">Add your health details so your care team is always prepared.</p>
                    </div>
                    <Link
                      href="/profile-setup"
                      className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Complete
                    </Link>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => action.tab ? setActiveTab(action.tab) : setLocation(action.href)}
                        className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left group"
                      >
                        <div className={`w-11 h-11 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                          <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                        </div>
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{action.label}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Appointments</h2>
                    <button onClick={() => setActiveTab("appointments")} className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <EmptyState
                    icon={CalendarDays}
                    title="No upcoming appointments"
                    desc="Book your first appointment to get started with your care."
                    action={
                      <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-sm transition-all">
                        Book Appointment <ChevronRight className="w-4 h-4" />
                      </Link>
                    }
                  />
                </div>

                {/* Services */}
                <div>
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Our Services</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.label}
                        href="/services"
                        className="bg-white rounded-xl border border-slate-100 px-4 py-4 flex items-center gap-3 hover:shadow-md hover:border-sky-200 transition-all group"
                      >
                        <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <s.icon className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                          <p className="text-xs text-slate-400">{s.desc}</p>
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
                  <h1 className="text-xl font-extrabold text-slate-900">My Appointments</h1>
                  <Link href="/contact" className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors">
                    <CalendarDays className="w-4 h-4" /> Book New
                  </Link>
                </div>
                <div className="flex gap-2">
                  {["Upcoming", "Past", "Cancelled"].map((f) => (
                    <button key={f} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${f === "Upcoming" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <EmptyState
                  icon={CalendarDays}
                  title="No appointments found"
                  desc="Your upcoming appointments will appear here once booked."
                  action={
                    <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-sm transition-all">
                      Book Appointment <ChevronRight className="w-4 h-4" />
                    </Link>
                  }
                />
              </>
            )}

            {/* ── RECORDS ── */}
            {activeTab === "records" && (
              <>
                <h1 className="text-xl font-extrabold text-slate-900">My Health Records</h1>
                <div className="grid sm:grid-cols-2 gap-5">
                  <EmptyState
                    icon={FlaskConical}
                    title="No lab results yet"
                    desc="Your laboratory test results will appear here after your first visit."
                  />
                  <EmptyState
                    icon={ClipboardList}
                    title="No consultations yet"
                    desc="Notes and summaries from your doctor visits will appear here."
                  />
                </div>
              </>
            )}

            {/* ── BILLING ── */}
            {activeTab === "billing" && (
              <>
                <h1 className="text-xl font-extrabold text-slate-900">Billing & Payments</h1>
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
                  <h1 className="text-xl font-extrabold text-slate-900">My Profile</h1>
                  <Link
                    href="/profile-setup"
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <UserCheck className="w-4 h-4" /> Edit Profile
                  </Link>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold flex-shrink-0">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                      ) : initials}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-lg">{user?.fullName}</h2>
                      <p className="text-slate-400 text-sm">{user?.email}</p>
                      <span className="inline-block mt-1 text-xs font-semibold bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full">Patient</span>
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
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{field.label}</p>
                        <p className={`text-sm font-medium ${field.value ? "text-slate-900" : "text-slate-300 italic"}`}>
                          {field.value || "Not provided"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {user?.bio && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Notes / Bio</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>

                {/* Role Code redemption */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                      <Key className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Activate a Role Code</h3>
                      <p className="text-xs text-slate-400">Have a code from your administrator? Enter it here to unlock staff access.</p>
                    </div>
                  </div>
                  <form onSubmit={handleRedeemCode} className="flex gap-2">
                    <input
                      type="text"
                      value={roleCode}
                      onChange={(e) => { setRoleCode(e.target.value); setRedeemStatus("idle"); }}
                      placeholder="e.g., DOC-ABC12345"
                      className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 uppercase tracking-wider"
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
                    <div className={`mt-2 flex items-center gap-2 text-sm ${redeemStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                      {redeemStatus === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {redeemMsg}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
