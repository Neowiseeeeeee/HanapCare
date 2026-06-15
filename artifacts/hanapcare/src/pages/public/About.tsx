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
    desc: "We partner only with licensed and accredited facilities and qualified professionals. Every feature we ship is validated by practicing clinicians.",
  },
];

const team = [
  {
    name: "Dr. Ricardo Santos, MD",
    role: "Co-Founder & Chief Medical Officer",
    bio: "Board-certified internist with years of clinical practice. Drove HanapCare's clinical protocols and physician adoption strategy.",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Melissa Aguilar",
    role: "Co-Founder & Chief Executive Officer",
    bio: "Former health technology lead with a Master's in Public Health. Melissa's vision is a Philippines where healthcare follows the patient, not the other way around.",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "James Delos Reyes",
    role: "Co-Founder & Chief Technology Officer",
    bio: "Full-stack engineer with experience building healthcare systems in Southeast Asia. Architected HanapCare's privacy-first, cloud-native platform.",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
];

const milestones = [
  { year: "2022", event: "Research & discovery phase — interviews with Filipino patients and clinicians to understand real pain points" },
  { year: "Q1 2023", event: "HanapCare Technologies, Inc. incorporated in Makati City" },
  { year: "Q2 2023", event: "Pilot launch with partner hospitals in Metro Manila — initial patients onboarded" },
  { year: "Q3 2023", event: "Platform improvements based on feedback; expanded healthcare partnerships" },
  { year: "Q4 2023", event: "Expanded to additional cities and regions across the Philippines" },
  { year: "2024", event: "Growing community of patients and healthcare professionals — and we're just getting started" },
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Building Healthcare{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                for Every Filipino
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              HanapCare was built by Filipinos, for Filipinos — with the mission of making quality healthcare accessible, affordable, and understandable for every patient in the archipelago.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-10 text-white"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-4">Our Mission</h2>
              <p className="text-sky-100 leading-relaxed text-lg">
                To eliminate the barriers between Filipinos and quality healthcare — making every part of the patient journey digital, transparent, and human.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#060D1F] rounded-3xl p-10 text-white border border-white/5"
            >
              <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-teal-400" />
              </div>
              <h2 className="text-2xl font-extrabold mb-4">Our Vision</h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                A Philippines where every citizen has access to complete, coordinated healthcare — where your records follow you, not the other way around.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div>
                <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">The Problem We Solved</span>
                <h2 className="text-4xl font-extrabold text-slate-900 mt-2 leading-tight">
                  Healthcare Shouldn't Be This Hard
                </h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                Our founders experienced firsthand the challenges of the Philippine healthcare system — long queues, records carried in crumpled plastic bags, bills that surprise you after treatment.
              </p>
              <p className="text-slate-600 leading-relaxed">
                In 2023, a team of Filipino doctors, nurses, and engineers came together with one goal: build a platform that actually serves the patient. Not the hospital's administrative system. Not the insurance company. The patient.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The name "HanapCare" comes from the Filipino word "hanap" — meaning "to find." We help patients find the right care, the right doctor, and the right information — without the usual friction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=700&q=80"
                  alt="HanapCare team"
                  className="w-full h-[480px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">What Drives Every Decision</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="flex gap-6 p-7 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-7 h-7 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">The People Behind HanapCare</h2>
            <p className="text-slate-500 mt-4 text-lg">Doctors, engineers, and public health advocates — united by the belief that every Filipino deserves better care.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                  <p className="text-sky-600 text-sm font-semibold mt-1">{member.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mt-3">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">How We Got Here</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                    <span className="text-sky-600 font-bold text-lg">{m.year}</span>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{m.event}</p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 bg-sky-500 rounded-full border-4 border-white shadow-md relative z-10 ml-6 md:ml-0" />
                  </div>
                  <div className="md:hidden flex-1">
                    <span className="text-sky-600 font-bold">{m.year}</span>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{m.event}</p>
                  </div>
                  <div className={`hidden md:block w-1/2 ${i % 2 === 1 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                    <span className="text-sky-600 font-bold text-lg">{m.year}</span>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
              Ready to Find Better Care?
            </h2>
            <p className="text-sky-100 text-lg mb-10">
              Join patients and healthcare workers who are managing healthcare the modern way.
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
                Contact Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
