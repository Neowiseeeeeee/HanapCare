import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Zap, Stethoscope, FlaskConical, Pill, ScanLine, Baby, CheckCircle, Clock, Phone } from "lucide-react";

const services = [
  {
    icon: Zap,
    title: "Emergency & Trauma Care",
    tagline: "When every second counts",
    desc: "Our emergency department operates 24 hours a day, 7 days a week, with board-certified emergency medicine physicians and trauma specialists. Patients are triaged using the Philippine Triage System (PTS) and receive immediate assessment.",
    highlights: [
      "Rapid triage targeting fast response for critical cases",
      "Advanced cardiac life support (ACLS) and trauma resuscitation",
      "On-call surgical and orthopedic specialists",
      "Direct admission pathway to ICU or operating room",
      "Health insurance benefit verification processed in real-time",
    ],
    img: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=700&q=80",
    color: "from-red-500 to-rose-600",
    availability: "24 / 7",
  },
  {
    icon: Stethoscope,
    title: "Outpatient Consultation",
    tagline: "Expert care on your schedule",
    desc: "Book consultations with specialists across multiple medical disciplines — from general medicine to highly specialized fields like neurosurgery and reproductive endocrinology. Available in person or via secure video teleconsultation.",
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
    desc: "Our accredited laboratory performs a wide range of tests — from routine complete blood count (CBC) to complex molecular diagnostics, microbial cultures, and tumor markers. Results are delivered to your HanapCare portal.",
    highlights: [
      "Accredited laboratory facility meeting quality standards",
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
    desc: "Our in-house pharmacy is integrated with the HanapCare prescription system. When your doctor writes an electronic prescription, our pharmacists receive it immediately, prepare your medication, and counsel you on proper use.",
    highlights: [
      "Integrated with HanapCare's digital prescription system",
      "Real-time health insurance benefit verification at point of dispensing",
      "Medication counseling and interaction checking",
      "Generic medicine alternatives explained and offered",
      "Home delivery available for maintenance medications",
    ],
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
    color: "from-emerald-500 to-teal-600",
    availability: "Mon–Sat, 8AM–8PM",
  },
  {
    icon: ScanLine,
    title: "Radiology & Imaging",
    tagline: "See what others miss",
    desc: "Our digital imaging center provides a comprehensive suite of diagnostic services. All images and reports are stored digitally in your HanapCare record — accessible by any authorized physician on your care team.",
    highlights: [
      "Digital X-ray with immediate image availability",
      "2D and 3D ultrasound including Doppler studies",
      "Multi-slice CT scanning for rapid diagnostic imaging",
      "MRI for soft tissue, neurological, and musculoskeletal evaluation",
      "Radiologist reports delivered within agreed turnaround times",
    ],
    img: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=700&q=80",
    color: "from-amber-500 to-orange-600",
    availability: "Mon–Sat, 7AM–7PM",
  },
  {
    icon: Baby,
    title: "Maternal & Child Health",
    tagline: "Care from the very beginning",
    desc: "Our maternal and child health program covers every stage — from pre-conception counseling through postpartum recovery and pediatric care. We partner with obstetricians, pediatricians, and neonatologists to deliver coordinated family-centered care.",
    highlights: [
      "Prenatal consultations with obstetric ultrasound monitoring",
      "Labor and delivery with 24/7 obstetric and neonatal support",
      "Postpartum care including mental health screening",
      "Well-baby clinics and immunization from birth",
      "Pediatric specialist referrals integrated into the care plan",
    ],
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=700&q=80",
    color: "from-pink-500 to-rose-500",
    availability: "24 / 7 for deliveries",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Services() {
  useEffect(() => {
    document.title = "HanapCare — Our Medical Services";
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Our Services
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Complete Care,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                Under One Roof
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              From emergency stabilization to routine wellness checkups, HanapCare's partner network provides comprehensive medical services for Filipino families.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICE LIST ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={service.img} alt={service.title} className="w-full h-[380px] object-cover" />
                </div>
              </div>

              <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${service.color} text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4`}>
                  <service.icon className="w-4 h-4" />
                  {service.tagline}
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{service.title}</h2>
                <p className="text-slate-600 leading-relaxed mb-6">{service.desc}</p>

                <div className="space-y-3 mb-6">
                  {service.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{h}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 border-t border-slate-100 pt-4">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Available: <strong className="text-slate-700">{service.availability}</strong></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-sky-600 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-white mb-5">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-sky-100 text-lg mb-10">
              Create your free HanapCare account and start your care journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-lg"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/25 transition-all"
              >
                <Phone className="w-4 h-4" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
