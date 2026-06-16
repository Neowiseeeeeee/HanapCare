import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageSquare, ChevronDown } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FAQS = [
  {
    q: "How do I book an appointment as a patient?",
    a: "Create a free patient account at hanapcare.ph/signup, then browse our list of doctors and available appointment slots. You can book instantly without calling, and your confirmation will arrive by email and SMS.",
  },
  {
    q: "Is HanapCare free for patients?",
    a: "Creating a patient account and managing your records on HanapCare is completely free. You pay for the medical services you receive, which are billed transparently through the platform with PhilHealth benefits applied automatically.",
  },
  {
    q: "How do healthcare workers get access to the HMS dashboard?",
    a: "Access for healthcare workers is provisioned by your hospital or clinic administrator. If your institution is interested in adopting HanapCare for your facility, contact us at partnerships@hanapcare.ph or use the form on this page.",
  },
  {
    q: "Is my medical data safe and private?",
    a: "Yes. HanapCare stores all patient data in encrypted, access-controlled cloud infrastructure compliant with the Philippine Data Privacy Act (RA 10173). Only you and your authorized care team can access your records.",
  },
  {
    q: "Which hospitals and clinics are on HanapCare?",
    a: "HanapCare currently operates in Cavite and the Metro Manila area with multiple partner facilities. We are expanding throughout 2024. Contact us to inquire about specific hospitals or to nominate one.",
  },
  {
    q: "Does HanapCare accept PhilHealth?",
    a: "Yes. All HanapCare partner facilities are PhilHealth-accredited. Your benefits are verified and applied automatically at the time of service, with no paperwork on your part.",
  },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  useEffect(() => {
    document.title = "Contact Us — HanapCare";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactCards = [
    {
      icon: Phone,
      title: "Phone",
      value: "+63 9360658121",
      sub: "Mon–Fri 8AM–6PM, Sat 8AM–12PM",
      color: "bg-sky-50 text-sky-600",
    },
    {
      icon: Mail,
      title: "Email",
      value: "support@hanapcare.ph",
      sub: "We respond within 1 business day",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: MapPin,
      title: "Address",
      value: "General Trias, Cavite",
      sub: "Philippines",
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: Clock,
      title: "Hours",
      value: "Mon–Fri: 8:00 AM – 6:00 PM",
      sub: "Saturday: 8:00 AM – 12:00 PM",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-[#060D1F] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Contact Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              We're Here{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
                When You Need Us
              </span>
            </h1>
            <p className="mt-5 text-slate-300 leading-relaxed max-w-xl mx-auto">
              Whether you have a question about your care, need help with your account, or want to bring HanapCare to your facility, our team is ready to listen and respond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.color} bg-opacity-20`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{card.title}</h3>
                <p className="text-slate-700 text-sm font-medium">{card.value}</p>
                <p className="text-slate-400 text-xs mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Send Us a Message</h2>
                    <p className="text-slate-400 text-sm">We will respond within 1 business day</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-500">Thank you for reaching out. Our team will get back to you within 1 business day.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                      className="mt-6 text-sky-600 font-medium text-sm hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Juan dela Cruz"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="juan@example.com"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
                        <select
                          required
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all bg-white"
                        >
                          <option value="">Select a topic</option>
                          <option>Patient Account Help</option>
                          <option>Booking an Appointment</option>
                          <option>PhilHealth Coverage</option>
                          <option>Partnership / Hospital Onboarding</option>
                          <option>Technical Support</option>
                          <option>Media Inquiry</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us how we can help you..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-sky-500/20"
                    >
                      Send Message <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Reach the Right Team</h3>
                <p className="text-slate-500 text-sm leading-relaxed">For faster resolution, contact the team that handles your specific need.</p>
              </div>

              {[
                { label: "Patient Support", email: "support@hanapcare.ph", desc: "Account, booking, billing, and medical record inquiries" },
                { label: "Hospital Partnerships", email: "partnerships@hanapcare.ph", desc: "Onboarding clinics, hospitals, and healthcare groups" },
                { label: "Media and Press", email: "press@hanapcare.ph", desc: "Interviews, press releases, and media access" },
                { label: "Careers", email: "careers@hanapcare.ph", desc: "Join our engineering, clinical, or operations team" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="font-bold text-slate-900 text-sm mb-0.5">{item.label}</p>
                  <a href={`mailto:${item.email}`} className="text-sky-600 text-sm font-medium hover:underline">{item.email}</a>
                  <p className="text-slate-400 text-xs mt-1">{item.desc}</p>
                </div>
              ))}

              <div className="bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl p-6 text-white">
                <h4 className="font-bold mb-2">Emergency and Urgent Care</h4>
                <p className="text-sky-100 text-sm mb-3">For medical emergencies, do not contact us. Call the emergency hotline of your nearest HanapCare partner hospital, or dial 911.</p>
                <p className="text-2xl font-extrabold">+63 9360658121</p>
                <p className="text-sky-200 text-xs mt-1">24/7 Emergency Coordination Line</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-sky-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h2>
            <p className="text-slate-500 mt-3 text-base">Can't find what you're looking for? Send us a message above.</p>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-slate-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
