import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Zap, Stethoscope, FlaskConical, Pill, ScanLine, Baby, CheckCircle, Clock, Phone } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const services = [
  {
    icon: Zap,
    title: "Emergency & Trauma Care",
    tagline: "When every second counts",
    desc: "Our emergency department operates 24 hours a day, 7 days a week, with board-certified emergency medicine physicians and trauma specialists. Patients are triaged using the Philippine Triage System (PTS) and receive immediate assessment regardless of ability to pay upfront.",
    highlights: [
      "Rapid triage with <15 minute target response for critical cases",
      "Advanced cardiac life support (ACLS) and trauma resuscitation",
      "On-call surgical and orthopedic specialists",
      "Direct admission pathway to ICU or operating room",
      "Full PhilHealth emergency benefit coverage processed in real-time",
    ],
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=700&q=80",
    color: "from-red-500 to-rose-600",
    availability: "24 / 7",
  },
  {
    icon: Stethoscope,
    title: "Outpatient Consultation",
    tagline: "Expert care on your schedule",
    desc: "Book consultations with over 200 specialists across 35 medical disciplines — from general medicine to highly specialized fields like neurosurgery and reproductive endocrinology. Available in person or via secure video teleconsultation.",
    highlights: [
      "Same-day and advance booking through the patient portal",
      "Video teleconsultation available for follow-ups and minor concerns",
      "Digital prescriptions and referrals issued instantly",
      "Electronic consultation notes shared with your chosen pharmacy",
      "Second opinion service with senior consultants",
    ],
    img: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=700&q=80",
    color: "from-sky-500 to-blue-600",
    availability: "Mon–Sat, 7AM–8PM",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & Diagnostics",
    tagline: "Precision results, delivered digitally",
    desc: "Our accredited laboratory performs over 400 types of tests — from routine complete blood count (CBC) to complex molecular diagnostics, microbial cultures, and tumor markers. Results are delivered to your HanapCare portal, never lost or forgotten.",
    highlights: [
      "DOH and ISO 15189-accredited laboratory facility",
      "Online result release — view your results before your follow-up",
      "Phlebotomy available at clinic or select home collection sites",
      "Stat (urgent) turnaround for emergency orders: 1–4 hours",
      "Automatic flagging of critical values with physician notification",
    ],
    img: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=700&q=80",
    color: "from-violet-500 to-purple-600",
    availability: "Mon–Sun, 6AM–9PM",
  },
  {
    icon: Pill,
    title: "Pharmacy Services",
    tagline: "The right medicine, at the right time",
    desc: "Our in-house pharmacy is integrated with the HanapCare prescription system. When your doctor writes an electronic prescription, our pharmacists receive it immediately, prepare your medication, and counsel you on proper use — reducing medication errors significantly.",
    highlights: [
      "Integrated electronic prescriptions — no paper required",
      "PhilHealth OPDAS benefit applied automatically at dispensing",
      "Generic medicine recommendations with full bioequivalence data",
      "Drug interaction checking against patient's active medication list",
      "Chronic disease medication refill program with delivery option",
    ],
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
    color: "from-emerald-500 to-teal-600",
    availability: "Mon–Sun, 7AM–10PM",
  },
  {
    icon: ScanLine,
    title: "Radiology & Imaging",
    tagline: "See what cannot be felt",
    desc: "Our radiology department provides a full spectrum of diagnostic imaging services using modern, calibrated equipment. Radiologist reports are generated within defined turnaround times and attached directly to the patient's digital record.",
    highlights: [
      "Conventional and digital X-ray (CR and DR)",
      "High-resolution ultrasound for obstetric, abdominal, and musculoskeletal use",
      "Computed Tomography (CT) scan — plain and with contrast",
      "Magnetic Resonance Imaging (MRI) — 1.5T unit with cardiac capability",
      "Radiologist report turnaround: routine 24h, urgent 4h, stat 1h",
    ],
    img: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=700&q=80",
    color: "from-amber-500 to-orange-600",
    availability: "Mon–Sat, 7AM–8PM (24h for emergencies)",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    tagline: "From the first heartbeat to every milestone",
    desc: "Our maternal and child health program provides comprehensive, evidence-based care for women from preconception through the postpartum period, and for children from newborn through adolescence. All services follow Department of Health and WHO clinical guidelines.",
    highlights: [
      "Prenatal consultations following the Focused Antenatal Care (FANC) protocol",
      "Normal spontaneous delivery, assisted delivery, and cesarean section",
      "Newborn care, hearing screening, and expanded newborn screening (ENBS)",
      "Well-child visits and full immunization program per EPI schedule",
      "Adolescent health services including reproductive health counseling",
    ],
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=700&q=80",
    color: "from-pink-500 to-rose-500",
    availability: "Mon–Sat, 8AM–5PM (OB emergencies 24h)",
  },
];

export default function Services() {
  useEffect(() => {
    document.title = "Our Services — HanapCare";
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 bg-[#060D1F] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-600/8 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Medical Services
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Complete Care,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                One Platform
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              From emergency trauma care to routine prenatal checkups — HanapCare provides the full spectrum of hospital services with digital convenience and transparent pricing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              {[
                { icon: CheckCircle, text: "DOH Accredited Facility" },
                { icon: Clock, text: "24/7 Emergency Services" },
                { icon: Phone, text: "Real-time PhilHealth Coverage" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-teal-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE DETAILS ── */}
      <div className="bg-white">
        {services.map((service, i) => (
          <section
            key={service.title}
            className={`py-20 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-14 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={i % 2 === 1 ? "lg:order-2" : ""}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img src={service.img} alt={service.title} className="w-full h-[400px] object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-30`} />
                    <div className="absolute top-4 left-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-semibold text-slate-700">{service.availability}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`space-y-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${service.color}`}>
                    <service.icon className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Service</span>
                  </div>
                  <div>
                    <p className="text-sky-600 font-medium text-sm italic">{service.tagline}</p>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{service.title}</h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                  <ul className="space-y-2.5">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <a className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:gap-3 transition-all mt-2">
                      Book this service <ArrowRight className="w-4 h-4" />
                    </a>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-sky-600 to-teal-600 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Experience Better Healthcare?</h2>
            <p className="text-sky-100 mb-8 text-lg">Create your free patient account and book your first consultation today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <a className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-lg">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
              <Link href="/contact">
                <a className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl border border-white/40 transition-all">
                  Contact Us
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
