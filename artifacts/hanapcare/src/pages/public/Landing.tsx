import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Star, Shield, Clock, Users,
  Heart, Zap, Lock, Activity, Stethoscope, FlaskConical,
  Pill, Baby, ScanLine, ChevronRight,
} from "lucide-react";

const UNS = "https://images.unsplash.com";

const SERVICES = [
  {
    title: "Emergency Care",
    description: "24/7 rapid-response emergency services with expert triage teams standing by.",
    img: `${UNS}/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=600&q=75`,
    icon: Activity,
    color: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    title: "Specialist Consultations",
    description: "Connect with certified doctors for outpatient visits, second opinions, and follow-ups.",
    img: `${UNS}/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&q=75`,
    icon: Stethoscope,
    color: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    title: "Laboratory & Diagnostics",
    description: "Comprehensive blood work, imaging, and diagnostics with fast digital results.",
    img: `${UNS}/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=75`,
    icon: FlaskConical,
    color: "bg-violet-50",
    iconColor: "text-violet-500",
  },
  {
    title: "In-House Pharmacy",
    description: "Prescriptions filled on-site with licensed pharmacists and transparent pricing.",
    img: `${UNS}/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&q=75`,
    icon: Pill,
    color: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    title: "Radiology & Imaging",
    description: "State-of-the-art X-ray, MRI, and CT scans with expert interpretations.",
    img: `${UNS}/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=600&q=75`,
    icon: ScanLine,
    color: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    title: "Maternal & Child Health",
    description: "Dedicated care for mothers and children at every stage — prenatal to pediatric.",
    img: `${UNS}/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=600&q=75`,
    icon: Baby,
    color: "bg-pink-50",
    iconColor: "text-pink-500",
  },
];

const STEPS = [
  { n: "01", title: "Create Your Account", desc: "Sign up free in under 2 minutes — no credit card required." },
  { n: "02", title: "Complete Your Profile", desc: "Tell us about your health needs so your care team is always prepared." },
  { n: "03", title: "Book Your First Visit", desc: "Browse specialists, pick a time that works, and confirm with a tap." },
  { n: "04", title: "We Handle the Rest", desc: "Digital records follow you. Bills are clear. Your care team stays connected." },
];

const FEATURES = [
  { icon: Shield, title: "Private & Secure", desc: "All health data is encrypted end-to-end. Your records belong only to you." },
  { icon: Clock, title: "Always Available", desc: "Access your dashboard, records, and support around the clock, any day." },
  { icon: Users, title: "One Record, Every Doctor", desc: "Your health history travels with you across every visit and specialist." },
  { icon: Zap, title: "Transparent Billing", desc: "No surprise bills — see exactly what you owe and pay in one place." },
  { icon: Heart, title: "Built Around People", desc: "Every feature was shaped by listening to real patients and families." },
  { icon: Lock, title: "You Control Your Data", desc: "You choose who sees your information. We never sell or share without consent." },
];

const TESTIMONIALS = [
  {
    name: "James Reeves",
    role: "Patient since 2023",
    avatar: `${UNS}/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80`,
    text: "I was terrified of managing my father's post-surgery care. HanapCare made everything organized and clear — appointments, prescriptions, billing, all in one place. It gave our whole family peace of mind.",
    stars: 5,
  },
  {
    name: "Sophie Miller",
    role: "Patient since 2024",
    avatar: `${UNS}/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80`,
    text: "Finding a specialist used to take weeks of phone calls. With HanapCare I booked a consultation in 4 minutes. The whole process felt human and thoughtful — like someone actually cared about my time.",
    stars: 5,
  },
  {
    name: "Dr. Nathan Lim",
    role: "Specialist, Cardiology",
    avatar: `${UNS}/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=80&h=80&q=80`,
    text: "Having patients arrive with organized histories and pre-filled records changes everything. I spend less time on paperwork and more time actually caring for them. HanapCare made that possible.",
    stars: 5,
  },
];

const STATS = [
  { value: "50,000+", label: "Patients Served" },
  { value: "200+", label: "Certified Specialists" },
  { value: "99.8%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support Available" },
];

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`${UNS}/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1920&q=80`}
            alt="Happy healthy children"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03111f]/92 via-[#03111f]/65 to-[#03111f]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03111f]/70 via-transparent to-transparent" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Trusted by families everywhere
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold text-white leading-[1.08] tracking-tight"
            >
              Every family deserves
              <br />
              care{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                they can trust.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl"
            >
              When someone you love is unwell, the last thing you need is confusion. HanapCare connects you with the right care — simply, securely, and with compassion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl transition-all shadow-2xl shadow-sky-500/30 hover:shadow-sky-400/40 hover:-translate-y-0.5 text-base group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/25 hover:border-white/50 transition-all text-base backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {["Free to create an account", "Your data is encrypted", "No credit card needed"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-white/50">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-sky-600 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-sky-200 text-sm mt-1 font-medium">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <img
                  src={`${UNS}/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80`}
                  alt="Doctor speaking with a patient's family"
                  className="w-full rounded-3xl object-cover shadow-2xl aspect-[4/3]"
                  loading="lazy"
                />
                <div className="absolute -bottom-6 -right-6 bg-sky-500 rounded-2xl px-5 py-4 shadow-xl hidden sm:block">
                  <p className="text-white font-bold text-xl">10+ years</p>
                  <p className="text-sky-100 text-xs mt-0.5">of trusted care</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <span className="text-sky-600 font-semibold text-sm tracking-wider uppercase">Our Story</span>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mt-3 mb-6">
                It started with a simple question.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-[15px]">
                <p>
                  Most people don't think about healthcare until they urgently need it. And when that moment comes — they find themselves lost. Complicated paperwork. Long queues. Bills that arrive weeks later with no explanation.
                </p>
                <p>
                  We asked: <em className="text-slate-800 font-medium not-italic">what if healthcare was actually built for the people who need it?</em> What if your records traveled with you, your bills were always transparent, and someone was always there to guide you?
                </p>
                <p>
                  HanapCare was built to answer that question. To give every person a clear, compassionate path to the care they deserve — wherever they are.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-sky-600 font-semibold hover:gap-2.5 transition-all text-sm group"
                >
                  Read our full story <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sky-600 font-semibold text-sm tracking-wider uppercase">What We Offer</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 leading-tight">
              When you need us, we're ready.
            </h2>
            <p className="text-slate-500 mt-4 text-base leading-relaxed">
              From first consultation to follow-up care, our services are seamless, compassionate, and available when it matters most.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => (
              <FadeIn key={svc.title} delay={i * 0.07}>
                <Link
                  href="/services"
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={svc.img}
                      alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className={`w-10 h-10 ${svc.color} rounded-xl flex items-center justify-center mb-3`}>
                      <svc.icon className={`w-5 h-5 ${svc.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1.5">{svc.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1">{svc.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sky-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      Learn more <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-xl mx-auto mb-16">
            <span className="text-sky-600 font-semibold text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              Getting care has never been this simple.
            </h2>
            <p className="text-slate-500 mt-4">Four steps from sign-up to seamless care — no complicated forms, no confusion.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.1}>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full">
                  <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/25">
                    <span className="text-white font-bold text-sm">{step.n}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-base">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-sky-500/25 hover:-translate-y-0.5 group"
            >
              Start Your Journey{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-[#030f1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-xl mx-auto mb-14">
            <span className="text-sky-400 font-semibold text-sm tracking-wider uppercase">Why HanapCare</span>
            <h2 className="text-4xl font-extrabold text-white mt-3">
              Everything we believe care should be.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
                  <div className="w-11 h-11 bg-sky-500/15 rounded-xl flex items-center justify-center mb-4">
                    <feat.icon className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center max-w-xl mx-auto mb-14">
            <span className="text-sky-600 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              Stories from people like you.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to find the care
              <br />
              you deserve?
            </h2>
            <p className="mt-5 text-sky-100 text-lg max-w-xl mx-auto leading-relaxed">
              Join thousands of families who have already discovered a better way to manage their health. It's free to get started.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-2xl hover:bg-sky-50 transition-all shadow-xl hover:-translate-y-0.5 group"
              >
                Get Started — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-2xl border border-white/30 hover:border-white/60 transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
