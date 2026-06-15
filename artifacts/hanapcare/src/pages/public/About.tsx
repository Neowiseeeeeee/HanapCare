import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Target, Eye, Heart, Shield, Users, Award, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const values = [
  {
    icon: Heart,
    title: "Patient First",
    desc: "Every decision we make is filtered through one question: does this make the patient's experience better? Technology serves people — not the other way around.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    desc: "Medical data is among the most sensitive information a person can share. We handle it with the highest standards of privacy, security, and ethical care.",
  },
  {
    icon: Globe,
    title: "Access for All",
    desc: "Healthcare is not a privilege. We work to make HanapCare accessible to every Filipino — from Batanes to Tawi-Tawi — regardless of income or location.",
  },
  {
    icon: Award,
    title: "Clinical Excellence",
    desc: "We partner only with DOH-accredited facilities and licensed professionals. Every feature we ship is validated by practicing clinicians.",
  },
];

const team = [
  {
    name: "Dr. Ricardo Santos, MD",
    role: "Co-Founder & Chief Medical Officer",
    bio: "Board-certified internist with 18 years of clinical practice at Philippine General Hospital. Drove HanapCare's clinical protocols and physician adoption strategy.",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Melissa Aguilar",
    role: "Co-Founder & Chief Executive Officer",
    bio: "Former health technology lead at DOST-ASTI with a Master's in Public Health from UP Manila. Melissa's vision is a Philippines where healthcare follows the patient, not the other way around.",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "James Delos Reyes",
    role: "Co-Founder & Chief Technology Officer",
    bio: "Full-stack engineer with a decade of experience building healthcare systems in Southeast Asia. Architected HanapCare's HIPAA-aligned, cloud-native platform.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
];

const milestones = [
  { year: "2022", event: "Research & discovery phase — 300+ interviews with Filipino patients and clinicians" },
  { year: "Q1 2023", event: "HanapCare Technologies, Inc. incorporated in Makati City" },
  { year: "Q2 2023", event: "Pilot launch with three hospitals in Metro Manila — 500 patients onboarded" },
  { year: "Q3 2023", event: "DOH accreditation granted; PhilHealth API integration completed" },
  { year: "Q4 2023", event: "Expansion to Cebu and Davao; crossed 10,000 patient accounts" },
  { year: "2024", event: "50,000+ patients served; 200+ active healthcare professionals on the platform" },
];

export default function About() {
  useEffect(() => {
    document.title = "About HanapCare — Our Story, Mission & Team";
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
              About HanapCare
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Reimagining Healthcare<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                for Every Filipino
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              We are a team of doctors, nurses, engineers, and advocates who believe that quality healthcare is a right — not a privilege. HanapCare exists to make that belief a reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-10 text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-4">Our Mission</h2>
              <p className="text-sky-100 leading-relaxed text-lg">
                To make quality healthcare accessible, transparent, and connected for every Filipino — by building the digital infrastructure that links patients, providers, and payers in one seamless system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-10 text-white"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-4">Our Vision</h2>
              <p className="text-teal-100 leading-relaxed text-lg">
                A Philippines where no family loses a loved one due to delayed diagnosis, fragmented records, or an unaffordable bill — where every person can access, understand, and manage their own health.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-6">Why We Built HanapCare</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  The idea for HanapCare came from a personal crisis. In 2022, our co-founder Dr. Ricardo Santos watched his own mother spend three days traveling between four hospitals — carrying physical X-rays and lab reports in a plastic bag — before receiving a definitive cancer diagnosis.
                </p>
                <p>
                  The technology to prevent that ordeal already existed. What was missing was a platform built specifically for the Philippine healthcare context — one that understood PhilHealth, spoke Filipino, and connected the dots between primary care, specialists, labs, and pharmacies.
                </p>
                <p>
                  In 2023, Ricardo partnered with Melissa Aguilar and James Delos Reyes to build exactly that. Within nine months, HanapCare launched with three partner hospitals and 500 patients. Today, we serve 50,000+ patients across three major cities and continue to grow.
                </p>
                <p>
                  We are not just a software company. We are a healthcare company that happens to build software — and every line of code we write is in service of better patient outcomes.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80"
                  alt="Hospital facility"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Milestones</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div key={i} variants={fadeUp} className="flex gap-6 pl-16 relative">
                  <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center text-center leading-tight shadow-md shadow-sky-500/20">
                    {m.year}
                  </div>
                  <div className="bg-slate-50 rounded-2xl px-6 py-4 flex-1 border border-slate-100">
                    <p className="text-slate-700 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">What We Stand For</h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Leadership</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Meet the Founders</h2>
            <p className="text-slate-500 mt-4">A multidisciplinary team with deep roots in Philippine healthcare, technology, and public policy.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeUp} className="text-center group">
                <div className="relative w-32 h-32 mx-auto mb-5">
                  <img src={member.img} alt={member.name} className="w-full h-full rounded-2xl object-cover shadow-xl group-hover:shadow-2xl transition-shadow" />
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-sky-500/0 group-hover:ring-sky-500/30 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                <p className="text-sky-600 text-sm font-medium mt-1 mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-gradient-to-br from-sky-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "50,000+", label: "Patients Served" },
              { icon: Award, value: "200+", label: "Medical Specialists" },
              { icon: Shield, value: "3 Cities", label: "Currently Operating" },
              { icon: Heart, value: "98%", label: "Satisfaction Rate" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sky-100 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Join the HanapCare Family</h2>
            <p className="text-slate-500 mb-8">Experience the difference that patient-centered digital healthcare makes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all"
              >
                Create Patient Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-sky-400 hover:text-sky-600 transition-all"
              >
                Contact Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
