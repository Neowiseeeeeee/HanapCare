import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Introduction",
    content: `HanapCare Technologies, Inc. ("HanapCare") is committed to protecting the privacy and security of your personal and health information. This Privacy Policy explains how we collect, use, store, and share information when you use our platform.

This Policy complies with Republic Act 10173, the Philippine Data Privacy Act of 2012 (DPA), and its Implementing Rules and Regulations. HanapCare is registered as a personal information controller with the National Privacy Commission (NPC).

By using HanapCare, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect the following categories of information:

Identity & Contact Information: Full legal name, date of birth, gender, email address, mobile number, and home address — collected during account registration.

Health Information: Medical history, diagnoses, prescriptions, laboratory results, vital signs, imaging reports, and clinical notes — generated during your care and stored in your Electronic Health Record (EHR).

Insurance & Government ID Information: PhilHealth Identification Number (PIN), HMO membership numbers, and other insurance identifiers — used to process claims and verify benefits.

Usage Data: Pages visited, features used, login timestamps, and device information — collected automatically for security monitoring and platform improvement.

Communications: Messages sent through our support channels and any feedback you provide.

We collect only the minimum information necessary for providing our services. We do not collect sensitive personal information (such as race, political opinion, or religious affiliation) unless medically relevant and explicitly consented to.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `Your information is used exclusively for the following purposes:

Delivering healthcare services: Sharing your health records with the healthcare providers involved in your care, processing prescriptions, and coordinating referrals.

Claims processing: Transmitting insurance claims to PhilHealth and other authorized payers on your behalf, with your explicit authorization at point of service.

Platform operation and improvement: Monitoring system performance, diagnosing technical issues, and improving the user experience of the platform.

Safety and compliance: Detecting fraudulent activity, complying with subpoenas or court orders, and meeting reporting obligations to the DOH or NPC.

Communication: Sending appointment reminders, medication refill alerts, lab result notifications, and service updates.

We do not use your health data for advertising purposes. We do not sell, rent, or barter your personal information to any third party under any circumstances.`,
  },
  {
    title: "4. Data Sharing & Third Parties",
    content: `HanapCare shares personal and health data only in the following circumstances:

With your care team: Physicians, nurses, pharmacists, laboratory staff, and other healthcare providers directly involved in your treatment — limited to information necessary for your care.

With PhilHealth and authorized payers: For claims verification and benefit processing — only with your signed authorization at point of service.

With technical service providers: Cloud infrastructure partners and software vendors who process data on our behalf under strict data processing agreements requiring compliance with the DPA and equivalent international standards.

With legal authorities: When required by a valid Philippine court order, subpoena, or lawful request from a government regulatory agency.

We require all third-party processors to implement appropriate technical and organizational security measures consistent with our own standards.`,
  },
  {
    title: "5. Data Security",
    content: `HanapCare implements industry-standard technical and organizational security measures to protect your information, including:

Encryption: All data is encrypted in transit using TLS 1.2 or higher, and at rest using AES-256 encryption.

Access Control: Role-based access control (RBAC) ensures that healthcare workers can only access information relevant to their professional role and their assigned patients.

Audit Logs: All access to patient records is logged and available for review. Any anomalous access is flagged for security review.

Penetration Testing: We conduct annual third-party security assessments of our infrastructure and application code.

Despite these measures, no digital system is completely immune to breaches. In the event of a personal data breach that poses a real risk to affected individuals, HanapCare will notify the NPC within 72 hours and affected individuals without undue delay.`,
  },
  {
    title: "6. Your Rights as a Data Subject",
    content: `Under the Philippine Data Privacy Act, you have the following rights with respect to your personal information held by HanapCare:

Right to be Informed: You have the right to know how your data is being collected, processed, and used.

Right to Access: You may request a copy of all personal and health information we hold about you at any time through your patient portal or by emailing privacy@hanapcare.ph.

Right to Rectification: If any information we hold is inaccurate, incomplete, or outdated, you may request a correction.

Right to Erasure or Blocking: You may request deletion of your personal data when it is no longer necessary for its original purpose, subject to legal and medical record retention obligations.

Right to Data Portability: You may request your complete health records in PDF or HL7 FHIR format for transfer to another provider.

Right to Object: You may object to specific processing activities, particularly marketing communications, at any time.

To exercise any of these rights, email our Data Protection Officer at: dpo@hanapcare.ph or call +63 (2) 8888-0000.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain personal and health information for the following periods:

Patient health records: Minimum of 10 years from the last clinical entry, in compliance with DOH guidelines for medical record retention.

Account information: Retained for the duration of your account and for 3 years after account closure.

Security and audit logs: Retained for 2 years.

You may request early deletion of non-health personal information (such as contact details) by contacting our Data Protection Officer. Health records cannot be deleted before the mandated retention period expires.`,
  },
  {
    title: "8. Contact Our Data Protection Officer",
    content: `If you have any questions, concerns, or complaints about this Privacy Policy or how HanapCare handles your personal information, please contact:

Data Protection Officer
HanapCare Technologies, Inc.
123 Makati Medical Center Drive, Ayala, Makati City 1226
Email: dpo@hanapcare.ph
Phone: +63 (2) 8888-0000

You also have the right to lodge a complaint directly with the National Privacy Commission (NPC) at www.privacy.gov.ph.

Effective Date: January 1, 2024
Last Updated: January 1, 2024`,
  },
];

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — HanapCare";
  }, []);

  return (
    <div className="overflow-x-hidden">
      <section className="relative pt-32 pb-16 bg-[#060D1F] overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-600/8 blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-500/20 border border-sky-500/30 rounded-2xl mb-6">
              <Shield className="w-7 h-7 text-sky-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              How HanapCare collects, uses, and protects your personal and health information — in full compliance with the Philippine Data Privacy Act.
            </p>
            <p className="mt-3 text-slate-500 text-sm">Effective: January 1, 2024 · Last updated: January 1, 2024</p>
          </motion.div>
        </div>
      </section>

      <section className="py-6 bg-sky-50 border-b border-sky-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-sky-800">
              <span className="font-semibold">Your data is never sold.</span> HanapCare does not sell, rent, or barter personal health information to any third party — ever. This is a core commitment, not just a legal obligation.
            </p>
          </div>
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

          <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">
              Questions about this Privacy Policy? Contact our Data Protection Officer at{" "}
              <a href="mailto:dpo@hanapcare.ph" className="text-sky-600 hover:underline">dpo@hanapcare.ph</a>{" "}
              or file a complaint with the{" "}
              <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">National Privacy Commission</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
