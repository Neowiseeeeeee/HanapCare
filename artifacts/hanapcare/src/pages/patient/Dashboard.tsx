import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  CalendarDays, FileText, CreditCard, Bell, LogOut,
  ChevronRight, Clock, User, Menu, X, Heart,
  Stethoscope, FlaskConical, Pill
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

const quickActions = [
  {
    icon: CalendarDays,
    label: "Book Appointment",
    desc: "Schedule a visit with a specialist",
    href: "/contact",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    icon: FileText,
    label: "My Records",
    desc: "View your health history and results",
    href: "#",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: CreditCard,
    label: "Billing & Payments",
    desc: "Review and pay outstanding bills",
    href: "#",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Pill,
    label: "Prescriptions",
    desc: "View active prescriptions",
    href: "#",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const services = [
  { icon: Stethoscope, label: "Consultations", desc: "Outpatient & specialist visits" },
  { icon: FlaskConical, label: "Laboratory", desc: "Blood tests & diagnostics" },
  { icon: Heart, label: "Emergency", desc: "24/7 emergency care" },
  { icon: Pill, label: "Pharmacy", desc: "In-house dispensing" },
];

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Nav ── */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HanapCareLogoIcon size={34} />
            <span className="font-bold text-lg text-slate-900 hidden sm:block">
              Hanap<span className="text-sky-500">Care</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
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
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-slate-100 px-4 py-3 space-y-2 bg-white">
            <div className="flex items-center gap-2.5 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{user?.fullName}</p>
                <p className="text-xs text-slate-400">Patient</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-600 py-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Here's an overview of your health activity.</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-11 h-11 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <p className="font-semibold text-slate-900 text-sm leading-tight">{action.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{action.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Appointments section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming Appointments</h2>
            <Link href="/contact" className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Book <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No upcoming appointments</h3>
            <p className="text-slate-400 text-sm mb-5">Book your first appointment to get started with your care.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Book Appointment <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Lab Results */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Lab Results</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No lab results yet</h3>
            <p className="text-slate-400 text-sm">Your laboratory results will appear here after your visit.</p>
          </div>
        </motion.div>

        {/* Services we offer */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {services.map((s) => (
              <Link
                key={s.label}
                href="/services"
                className="bg-white rounded-xl border border-slate-100 px-4 py-4 flex items-center gap-3 hover:shadow-md hover:border-sky-200 transition-all group"
              >
                <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4.5 h-4.5 text-sky-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Profile / Account */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">My Account</h2>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {user?.fullName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-sm text-slate-400 truncate">{user?.email}</p>
              </div>
              <span className="text-xs font-semibold bg-sky-100 text-sky-700 px-3 py-1 rounded-full">Patient</span>
            </div>
            {[
              { icon: User, label: "Edit Profile", desc: "Update your personal information" },
              { icon: Clock, label: "Visit History", desc: "View past appointments and consultations" },
              { icon: CreditCard, label: "Billing History", desc: "Past invoices and payment records" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-5 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            ))}
            <div className="p-5">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
