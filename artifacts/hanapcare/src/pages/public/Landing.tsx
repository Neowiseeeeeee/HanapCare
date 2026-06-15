import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight, Shield, Clock, FileText, CreditCard,
  Globe, Headphones, Star, ChevronRight,
  Stethoscope, FlaskConical, Pill, Zap, Baby, ScanLine,
  CheckCircle, Users, TrendingUp, Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const services = [
  {
    icon: Zap,
    title: "Emergency & Trauma Care",
    desc: "24/7 rapid triage, trauma management, and critical care for life-threatening conditions across our network.",
    gradient: "from-red-500 to-rose-600",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Stethoscope,
    title: "Outpatient Consultation",
    desc: "Book with 200+ specialists across 35 disciplines — in person or via teleconsultation, same day or scheduled.",
    gradient: "from-sky-500 to-blue-600",
    img: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & Diagnostics",
    desc: "Full blood panels, cultures, urinalysis, and specialized tests — results delivered directly to your digital record.",
    gradient: "from-violet-500 to-purple-600",
    img: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Pill,
    title: "Pharmacy Services",
    desc: "Integrated prescription management, medication counseling, and in-house dispensing with PhilHealth coverage.",
    gradient: "from-emerald-500 to-teal-600",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: ScanLine,
    title: "Radiology & Imaging",
    desc: "Digital X-ray, ultrasound, CT scan, and MRI with AI-assisted analysis and rapid radiologist reporting.",
    gradient: "from-amber-500 to-orange-600",
    img: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    desc: "Prenatal care, delivery services, postpartum support, and complete pediatric care from birth through adolescence.",
    gradient: "from-pink-500 to-rose-500",
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80",
  },
];

const features = [
  { icon: Shield, title: "PhilHealth Ready", desc: "Real-time PhilHealth benefit verification and seamless claims processing built in from day one." },
  { icon: Award, title: "DOH Compliant", desc: "Fully meets all Department of Health standards, regulations, and patient safety protocols." },
  { icon: FileText, title: "Digital Records", desc: "Your complete history — diagnoses, labs, prescriptions — secure and accessible anywhere, anytime." },
  { icon: CreditCard, title: "Transparent Billing", desc: "Know your costs upfront. Itemized, no hidden fees, no surprises — before and after treatment." },
  { icon: Globe, title: "Multilingual", desc: "Full support in Filipino, Cebuano, and English so every patient understands their own care." },
  { icon: Headphones, title: "24/7 Support", desc: "Care coordinators available by phone, chat, or email to help patients and providers at any hour." },
];

const testimonials = [
  {
    name: "Maria Santos",
    role: "Patient, Makati City",
    stars: 5,
    text: "I was able to get my mother's diagnosis and start treatment within 24 hours. The digital records system saved us from repeating expensive tests at a different hospital. Hindi ko malilimutan ang tulong ng HanapCare.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80",
  },
  {
    name: "Dr. Emmanuel Reyes",
    role: "Cardiologist, Quezon City",
    stars: 5,
    text: "HanapCare transformed how I manage my patients. Viewing history, approving prescriptions, sending referrals — all from one clean screen. My clinic's efficiency improved meaningfully in just a few weeks.",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
  },
  {
    name: "Ana Gonzales, RN",
    role: "Head Nurse, Davao Medical Center",
    stars: 5,
    text: "The ward management system eliminated paperwork that used to consume hours of my shift. Now I spend more time with patients — which is exactly why I became a nurse in the first place.",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=80&q=80",
  },
];

const stats = [
  { value: "50,000+", label: "Patients Served" },
  { value: "200+", label: "Medical Specialists" },
  { value: "35", label: "Specialties" },
  { value: "98%", label: "Satisfaction Rate" },
];

const blogPosts = [
  {
    slug: "philhealth-coverage-guide",
    title: "Understanding Your PhilHealth Coverage in 2024",
    excerpt: "A practical guide to navigating PhilHealth benefits — what is covered, how to file claims, and how to maximize your health fund for your family.",
    category: "PhilHealth",
    date: "January 15, 2024",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "emergency-warning-signs",
    title: "5 Signs You Should Visit the Emergency Room",
    excerpt: "Knowing when to go to the ER versus an urgent care clinic can save your life. Here are the definitive red flags every Filipino family should memorize.",
    category: "Emergency Care",
    date: "February 1, 2024",
    readTime: "4 min read",
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "health-screening-importance",
    title: "Why Regular Health Screening Saves Filipino Lives",
    excerpt: "The Philippines faces rising rates of hypertension, diabetes, and cancer — all largely preventable with early detection through routine screening.",
    category: "Preventive Care",
    date: "February 20, 2024",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Landing() {
  useEffect(() => {
    document.title = "HanapCare — Healthcare That Cares Beyond Walls";
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-[#060D1F] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#060D1F] via-[#0A1F4E] to-[#062040]" />
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-sky-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 0 L0 0 0 10' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Now serving patients nationwide
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                Healthcare That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                  Cares Beyond
                </span>{" "}
                Walls.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg"
              >
                HanapCare connects patients with compassionate, world-class healthcare across the Philippines — from booking your first appointment to receiving your final bill, all in one place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-400/40 hover:-translate-y-0.5"
                >
                  Create Patient Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  Healthcare Worker Portal
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400"
              >
                {["Free to sign up", "DOH Accredited", "PhilHealth Ready"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=700&q=80"
                  alt="Medical professionals team at HanapCare"
                  className="w-full h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-10 top-1/4 bg-white rounded-2xl p-4 shadow-2xl shadow-black/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Active Specialists</p>
                    <p className="text-xl font-extrabold text-slate-900">200+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="absolute -right-8 bottom-1/3 bg-white rounded-2xl p-4 shadow-2xl shadow-black/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Satisfaction Rate</p>
                    <p className="text-xl font-extrabold text-slate-900">98%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <p className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                  {s.value}
                </p>
                <p className="text-slate-500 mt-2 text-sm font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=700&q=80"
                  alt="Doctor consulting with a patient"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl p-6 shadow-2xl text-white max-w-[220px]">
                <p className="text-4xl font-extrabold">2023</p>
                <p className="text-sky-100 text-sm mt-1 leading-relaxed">Founded in Manila to solve a real Philippine healthcare problem</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 lg:pl-4"
            >
              <div>
                <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
                <h2 className="text-4xl font-extrabold text-slate-900 mt-2 leading-tight">
                  Born From a Real Need
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Every year, millions of Filipinos struggle to navigate a fragmented healthcare system — long queues at three different hospitals, records carried in crumpled plastic bags, and bills that only arrive after treatment.
              </p>
              <p className="text-slate-600 leading-relaxed">
                HanapCare was founded in 2023 by a team of Filipino doctors, nurses, and engineers who lived this reality firsthand. We built a platform that puts the patient first: transparent billing, unified digital records, and instant access to qualified healthcare providers — wherever you are in the archipelago.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Today, HanapCare serves tens of thousands of patients across Metro Manila, Cebu, and Davao. We're just getting started.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:gap-3 transition-all"
              >
                Read our full story <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Complete Care Under One Roof</h2>
            <p className="text-slate-500 mt-4 text-lg">
              From emergencies to routine checkups, HanapCare provides comprehensive medical services designed for the needs of Filipino families.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((s) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                className="group rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                  <div className="absolute bottom-3 left-4">
                    <div className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                      <s.icon className="w-5 h-5 text-slate-800" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1 text-sky-600 text-sm font-semibold mt-4 hover:gap-2 transition-all"
                  >
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-gradient-to-br from-sky-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Your Journey With HanapCare</h2>
            <p className="text-slate-500 mt-4 text-lg">Whether you are a patient or a healthcare worker, getting started is simple and takes under five minutes.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
                For Patients
              </div>
              <div className="space-y-7">
                {[
                  { step: "01", title: "Create Your Account", desc: "Sign up with your email or PhilHealth ID. No credit card required — free forever for patients." },
                  { step: "02", title: "Find & Book a Doctor", desc: "Browse specialists by discipline, location, or availability. Book in real-time without calling." },
                  { step: "03", title: "Receive Seamless Care", desc: "Attend your appointment, access digital records, and manage billing — all from your patient dashboard." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-sky-500/20">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-sky-500/20"
                >
                  Get Started as a Patient <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#060D1F] rounded-3xl p-8"
            >
              <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
                For Healthcare Workers
              </div>
              <div className="space-y-7">
                {[
                  { step: "01", title: "Get Your Account", desc: "Your hospital administrator provisions your profile and assigns the appropriate role with the correct access." },
                  { step: "02", title: "Manage Your Patients", desc: "Access records, update vitals, issue lab requests, write prescriptions, and manage ward assignments." },
                  { step: "03", title: "Track & Report", desc: "Generate real-time clinical reports, review audit logs, and monitor outcomes — from your role-specific dashboard." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-teal-500/20">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all"
                >
                  Access Worker Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY HANAPCARE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Why HanapCare</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Built for Filipino Healthcare</h2>
            <p className="text-slate-500 mt-4 text-lg">We did not copy a foreign healthcare platform. We built HanapCare from scratch for Philippine regulations, languages, and realities.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group p-6 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-sky-50 group-hover:bg-sky-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#060D1F] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-extrabold text-white mt-2">Trusted by Patients & Providers</h2>
            <p className="text-slate-400 mt-4 text-lg">Real stories from real Filipinos whose healthcare experience was transformed by HanapCare.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 transition-all"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30" />
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Health Blog</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Knowledge is Medicine</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sky-600 font-semibold hover:gap-3 transition-all text-sm"
              >
                View all articles <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {blogPosts.map((post) => (
              <motion.article
                key={post.slug}
                variants={fadeUp}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">{post.category}</span>
                    <span className="text-xs text-slate-400">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-snug mb-2 group-hover:text-sky-600 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
              Start Your Health Journey<br />Today
            </h2>
            <p className="text-sky-100 text-lg mb-10 max-w-2xl mx-auto">
              Whether you are a patient seeking quality care or a healthcare professional looking to streamline your practice — HanapCare is built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Create Free Patient Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl border border-white/40 transition-all"
              >
                Healthcare Worker Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
