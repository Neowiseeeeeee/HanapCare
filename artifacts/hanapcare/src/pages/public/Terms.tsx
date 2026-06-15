import { useEffect } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the HanapCare platform — including the website at hanapcare.ph, the patient portal, and the Hospital Management System (HMS) — you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you must not use our services.

HanapCare Technologies, Inc. ("HanapCare," "we," "us," or "our") reserves the right to update these Terms at any time. Continued use of the platform after any changes constitutes acceptance of the new terms. We will notify registered users of material changes via email or in-app notification.`,
  },
  {
    title: "2. Description of Services",
    content: `HanapCare provides a digital health platform that:

(a) Connects patients with DOH-accredited healthcare providers for appointment booking, teleconsultation, and care management;
(b) Provides a Hospital Management System (HMS) for healthcare workers and administrators to manage clinical operations, patient records, billing, and pharmacy functions;
(c) Stores and transmits patient health records in compliance with applicable Philippine laws;
(d) Facilitates claims processing and verification with the Philippine Health Insurance Corporation (PhilHealth) and other payers.

HanapCare is a technology intermediary. We are not a healthcare provider, and we do not provide medical advice, diagnosis, or treatment. All clinical decisions are made by the licensed healthcare professionals on the platform.`,
  },
  {
    title: "3. Patient Account Registration",
    content: `To access patient services, you must create an account by providing accurate, current, and complete information including your full legal name, a valid email address, date of birth, and contact number. You may optionally link your PhilHealth Identification Number (PIN).

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify HanapCare at support@hanapcare.ph if you suspect any unauthorized use of your account.

You must be at least 18 years of age to create an account independently. Minors may be registered as dependents under a parent or legal guardian's account with appropriate consent.`,
  },
  {
    title: "4. Healthcare Worker Accounts",
    content: `Access to the HanapCare HMS is provisioned exclusively through a registered healthcare institution. Healthcare workers receive their access credentials from their institution's HanapCare administrator.

Healthcare workers who use the HMS represent and warrant that:
(a) They hold valid, current professional licenses issued by the Professional Regulation Commission (PRC) or the relevant Philippine regulatory body;
(b) Their access and use is authorized by their employing institution;
(c) They will use the platform only for lawful purposes and in accordance with their professional obligations under Philippine law and the code of ethics of their profession.

HanapCare reserves the right to suspend or terminate healthcare worker access immediately upon notification from an employing institution or evidence of professional misconduct.`,
  },
  {
    title: "5. Patient Health Records & Data Ownership",
    content: `You retain ownership of your personal health data stored on HanapCare. By using our platform, you grant HanapCare a limited, non-exclusive, revocable license to store, process, and transmit your health data for the purpose of providing the services described in these Terms.

You may request a full export of your health records in PDF or HL7 FHIR format at any time through your patient portal settings at no charge.

HanapCare processes health data as a "personal information controller" under the Philippine Data Privacy Act (Republic Act 10173) and its Implementing Rules and Regulations. Your health data is never sold to third parties. It is shared only with:
(a) Healthcare providers directly involved in your care;
(b) PhilHealth and designated payers for claims processing, with your explicit authorization;
(c) HanapCare's technical service providers under strict data processing agreements.`,
  },
  {
    title: "6. Fees, Billing & Refunds",
    content: `Patient account registration is free of charge. Fees for medical services (consultations, laboratory tests, procedures, and medicines) are charged by the healthcare provider or facility, not by HanapCare, except where HanapCare is the direct service provider.

HanapCare provides a transparent billing feature that displays itemized costs before and after services are rendered. PhilHealth deductions are applied automatically at the point of billing for accredited services.

Refund requests for medical services must be directed to the relevant healthcare provider or institution. HanapCare will assist in mediating billing disputes at no charge. For platform fees charged directly by HanapCare (e.g., premium subscription features), refund requests must be submitted within 14 days of the charge to support@hanapcare.ph.`,
  },
  {
    title: "7. Prohibited Uses",
    content: `You agree not to:

(a) Use HanapCare for any unlawful purpose or in violation of any Philippine or international law;
(b) Attempt to gain unauthorized access to any part of the platform, other user accounts, or HanapCare's servers;
(c) Upload or transmit any viruses, malware, or other harmful code;
(d) Impersonate any person, healthcare professional, or entity;
(e) Use automated tools (bots, scrapers) to access platform data without written authorization;
(f) Reproduce, distribute, or commercially exploit platform content without HanapCare's written permission;
(g) Provide false information during registration or when booking medical services.

Violation of these prohibitions may result in immediate account termination and, where applicable, referral to the appropriate Philippine law enforcement or regulatory authorities.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by Philippine law, HanapCare and its directors, employees, and partners shall not be liable for:

(a) Any clinical outcome resulting from decisions made by healthcare professionals on the platform;
(b) Indirect, incidental, or consequential damages arising from your use of or inability to use the platform;
(c) Loss of data due to events beyond our reasonable control (force majeure), including natural disasters, cyberattacks, or infrastructure failures beyond our contracted service providers.

HanapCare's total cumulative liability for direct damages shall not exceed the amount paid by you to HanapCare in the three months preceding the claim.

Nothing in these Terms limits liability for fraud, gross negligence, death, or personal injury caused by HanapCare's direct actions.`,
  },
  {
    title: "9. Governing Law & Dispute Resolution",
    content: `These Terms are governed by the laws of the Republic of the Philippines. Any dispute arising from or in connection with these Terms shall first be submitted to good-faith mediation between the parties. If mediation fails within 30 days, disputes shall be resolved by the appropriate courts in Makati City, Metro Manila, Philippines, with both parties irrevocably submitting to that jurisdiction.

For consumer protection concerns, you may also file a complaint with the Department of Trade and Industry (DTI) Consumer Protection Group or the National Privacy Commission (NPC) for data-related concerns.`,
  },
  {
    title: "10. Contact",
    content: `For questions about these Terms, contact:

HanapCare Technologies, Inc.
Legal Department
123 Makati Medical Center Drive, Ayala, Makati City 1226
Email: legal@hanapcare.ph
Phone: +63 (2) 8888-0000

Effective Date: January 1, 2024
Last Updated: January 1, 2024`,
  },
];

export default function Terms() {
  useEffect(() => {
    document.title = "Terms & Conditions — HanapCare";
  }, []);

  return (
    <div className="overflow-x-hidden">
      <section className="relative pt-32 pb-16 bg-[#060D1F] overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-600/8 blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-sm font-medium mb-6">
              Legal
            </span>
            <h1 className="text-4xl font-extrabold text-white">Terms & Conditions</h1>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Please read these terms carefully before using HanapCare. They govern your use of our platform and services.
            </p>
            <p className="mt-3 text-slate-500 text-sm">Effective: January 1, 2024 · Last updated: January 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <h2 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">{section.title}</h2>
                <div className="text-slate-600 leading-relaxed text-sm space-y-3">
                  {section.content.split("\n\n").map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-500">
            <p>
              If you have questions about these Terms and Conditions, please contact our legal team at{" "}
              <a href="mailto:legal@hanapcare.ph" className="text-sky-600 hover:underline">legal@hanapcare.ph</a>{" "}
              or call +63 (2) 8888-0000.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
