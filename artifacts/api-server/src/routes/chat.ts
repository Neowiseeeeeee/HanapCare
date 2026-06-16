import { Router } from "express";
import { db } from "@workspace/db";
import { chatSessionsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, desc, and, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

interface BotEntry {
  keywords: string[];
  answer: string;
  followUps: string[];
}

const BOT_ANSWERS: BotEntry[] = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "help", "start"],
    answer: "Hello! Welcome to HanapCare Support 👋 I'm your virtual assistant. I can help with appointments, billing, lab results, prescriptions, and more. What can I help you with today?",
    followUps: [
      "How do I book an appointment?",
      "How do I view my lab results?",
      "Do you accept PhilHealth?",
    ],
  },
  {
    keywords: ["appointment", "book", "schedule", "visit", "consult"],
    answer: "To book an appointment, log in to your dashboard and click 'Book Appointment'. Choose a specialist, pick your preferred date and time slot, then confirm. Our team will verify your booking within 24 hours and send a confirmation.",
    followUps: [
      "How do I cancel or reschedule an appointment?",
      "What documents should I bring?",
      "Can I book a telehealth/online consultation?",
    ],
  },
  {
    keywords: ["cancel", "reschedule", "change appointment", "move appointment"],
    answer: "You can cancel or reschedule from your dashboard under 'My Appointments'. Please do so at least 24 hours in advance. Late cancellations (under 2 hours before the visit) may incur a ₱200 rebooking fee. Your doctor will be notified automatically.",
    followUps: [
      "How do I book a new appointment after cancelling?",
      "Will I be charged a cancellation fee?",
      "How do I contact the clinic directly?",
    ],
  },
  {
    keywords: ["bring", "document", "requirement", "id", "card", "what to bring"],
    answer: "Please bring: (1) Valid government-issued ID, (2) PhilHealth card or HMO card (if applicable), (3) Previous medical records or referral letter (if any), (4) List of current medications. For follow-up visits, bring your last prescription and test results.",
    followUps: [
      "Do you accept walk-in patients?",
      "What is your consultation fee?",
      "Can I use my HMO card for the visit?",
    ],
  },
  {
    keywords: ["result", "lab", "test", "blood", "laboratory", "diagnostic", "urinalysis", "xray", "x-ray"],
    answer: "Your lab and test results are available in your dashboard under 'My Records → Lab Results'. Results typically appear within 24–48 hours. For urgent results, call our laboratory hotline. Critical values are flagged and your doctor is automatically notified.",
    followUps: [
      "What lab tests do you offer?",
      "How much do lab tests cost?",
      "Can I request a copy of my results?",
    ],
  },
  {
    keywords: ["lab tests", "available tests", "what tests", "offered tests"],
    answer: "HanapCare offers a full range of diagnostic tests including: Complete Blood Count (CBC), Urinalysis, Lipid Panel, Blood Glucose (FBS/RBS/HbA1c), Liver Function Tests, Kidney Function Tests, Thyroid Panel, COVID-19 PCR/Antigen, X-Ray, Ultrasound, ECG, and more. Ask your doctor for a referral or walk in for basic tests.",
    followUps: [
      "How do I get a referral for lab tests?",
      "How do I view my lab results?",
      "Are lab tests covered by PhilHealth?",
    ],
  },
  {
    keywords: ["bill", "billing", "payment", "pay", "invoice", "fee", "cost", "price", "charge", "how much"],
    answer: "You can view and pay your bills from your dashboard under 'Billing & Payments'. We accept GCash, Maya, credit/debit cards, and online bank transfers (BPI, BDO, UnionBank). Cash payments are accepted at the cashier. Installment plans are available for bills above ₱10,000.",
    followUps: [
      "How does PhilHealth coverage work?",
      "Can I get an installment plan?",
      "How do I request an official receipt?",
    ],
  },
  {
    keywords: ["installment", "payment plan", "bayad", "partial"],
    answer: "Installment plans are available for bills above ₱10,000. Visit the Billing & Finance office with a valid ID to apply. We offer 3, 6, and 12-month plans with 0% interest for PhilHealth members. A post-dated check or auto-debit arrangement is required.",
    followUps: [
      "What documents are needed for installment?",
      "How do I pay my current balance?",
      "Can I use my HMO to reduce the bill?",
    ],
  },
  {
    keywords: ["prescription", "medicine", "medication", "drug", "pharma", "refill", "drug store"],
    answer: "Active prescriptions are listed in your dashboard under 'Prescriptions'. Bring your digital prescription ID or printed copy to any HanapCare in-house pharmacy. For refills, your doctor must approve a new prescription — allow 1–2 business days. Generics are available at lower cost.",
    followUps: [
      "Can I fill my prescription at an outside pharmacy?",
      "What medicines are available in your pharmacy?",
      "How do I request a prescription refill?",
    ],
  },
  {
    keywords: ["refill", "request prescription", "renew prescription"],
    answer: "To request a prescription refill: (1) Log in and go to 'My Prescriptions', (2) Click 'Request Refill' on the medication, (3) Your doctor will review and approve within 1–2 business days. You'll receive a notification when it's ready. For urgent needs, call your doctor's clinic directly.",
    followUps: [
      "How do I pick up my prescription?",
      "Can I get a telehealth consult for a refill?",
      "What if my doctor is unavailable?",
    ],
  },
  {
    keywords: ["insurance", "hmo", "philhealth", "coverage", "benefit", "maxicare", "medicard", "intellicare"],
    answer: "HanapCare accepts PhilHealth, Maxicare, Medicard, Intellicare, Pacific Cross, and most major HMO providers. Bring your HMO card and member ID to your visit. PhilHealth deductions are applied automatically for eligible consultations, admissions, and procedures.",
    followUps: [
      "How much does PhilHealth cover?",
      "What if my HMO is not listed?",
      "Can I use PhilHealth for lab tests?",
    ],
  },
  {
    keywords: ["philhealth cover", "how much philhealth", "philhealth benefit", "philhealth deduction"],
    answer: "PhilHealth covers: Outpatient consultation (₱400–₱700 per visit), Inpatient room & board (based on classification), Laboratory and diagnostic tests (50–80% of fees), Medicines (for admitted patients). Coverage depends on your membership type and contribution status. Verify yours at the PhilHealth member portal (www.philhealth.gov.ph).",
    followUps: [
      "How do I know if I'm an active PhilHealth member?",
      "Can I pay the balance after PhilHealth?",
      "What conditions are covered by PhilHealth?",
    ],
  },
  {
    keywords: ["telehealth", "online consult", "video", "virtual", "remote", "telemedicine", "online doctor"],
    answer: "Telehealth consultations are available for follow-ups, prescription renewals, and non-emergency conditions. Book from your dashboard — select 'Telehealth' as appointment type. Rates start at ₱350 per session (30 minutes). Same-day slots are often available. Payment is processed before the session.",
    followUps: [
      "What conditions qualify for telehealth?",
      "How do I join the video call?",
      "Is telehealth covered by PhilHealth?",
    ],
  },
  {
    keywords: ["password", "forgot", "reset", "login", "can't log in", "locked out", "access"],
    answer: "If you forgot your password, click 'Forgot password?' on the Sign In page. We'll send a reset link to your registered email within 2 minutes. The link expires in 1 hour. Check your spam folder if you don't see it. If you're still locked out, contact support@hanapcare.ph.",
    followUps: [
      "How do I update my email address?",
      "How do I change my password?",
      "What if I can't access my registered email?",
    ],
  },
  {
    keywords: ["hours", "open", "operating hours", "when open", "schedule", "weekend", "sunday", "saturday"],
    answer: "HanapCare facilities: Mon–Fri 7AM–8PM, Sat 8AM–5PM, Sun 9AM–3PM. Emergency Department: Open 24/7 every day. Telehealth: 7AM–10PM daily. Laboratory walk-in: Mon–Sat 7AM–6PM. Pharmacy: Mon–Sat 8AM–8PM, Sun 10AM–4PM.",
    followUps: [
      "Where are your branch locations?",
      "Can I book an appointment on weekends?",
      "Is the emergency room open at night?",
    ],
  },
  {
    keywords: ["location", "address", "where", "branch", "clinic", "hospital", "find"],
    answer: "Our facilities: 🏥 Main — HanapCare Medical Center, Manila | 🏥 Quezon City Branch — Eastwood Ave, QC | 🏥 Makati Branch — Ayala Ave, Makati | 🏥 Cebu Branch — IT Park, Cebu City | 🏥 Davao Branch — Quimpo Blvd, Davao. Use Google Maps or our website to get directions.",
    followUps: [
      "What are your operating hours?",
      "Is there parking available?",
      "Which branch handles emergency cases?",
    ],
  },
  {
    keywords: ["emergency", "urgent", "911", "critical", "ambulance", "life threatening"],
    answer: "🚨 For life-threatening emergencies, call 911 immediately. Philippine Red Cross: (02) 790-2300. Our 24/7 Emergency Department is at the main HanapCare Medical Center, Manila. Do NOT drive yourself — call an ambulance. Once stabilized, register your visit in the app for records.",
    followUps: [
      "Where is the nearest HanapCare branch?",
      "What does the ER handle?",
      "Does PhilHealth cover emergency visits?",
    ],
  },
  {
    keywords: ["doctor", "specialist", "find doctor", "physician", "surgeon", "cardiologist", "dermatologist", "pediatrician", "ob-gyn", "obgyn"],
    answer: "Browse our specialists from 'Book Appointment → Choose Doctor'. Filter by specialty (Cardiology, Dermatology, Pediatrics, OB-GYN, Orthopedics, Internal Medicine, etc.), location, and availability. All doctors are PRC-licensed and accredited by PhilHealth. View their profiles and patient ratings before booking.",
    followUps: [
      "How do I book with a specific doctor?",
      "What is the consultation fee?",
      "Can I see a specialist without a referral?",
    ],
  },
  {
    keywords: ["ward", "admission", "inpatient", "room", "bed", "confined", "admitted"],
    answer: "For inpatient admissions, visit the Admissions Office with a doctor's referral. Room types: Private (₱3,500–₱6,000/day), Semi-private (₱1,800–₱2,500/day), Ward beds (₱800–₱1,200/day). PhilHealth coverage applies for eligible patients. Admissions are processed 24/7.",
    followUps: [
      "What documents are needed for admission?",
      "Does PhilHealth cover room fees?",
      "Can I request a specific room type?",
    ],
  },
  {
    keywords: ["vaccine", "vaccination", "immunization", "shot", "covid", "flu", "booster"],
    answer: "Vaccination services are available at all HanapCare branches without an appointment (walk-in). We offer: Flu vaccine (seasonal), COVID-19 boosters, Hepatitis A & B, Pneumococcal, Typhoid, Varicella, HPV, and travel vaccines. Bring your vaccination booklet. PhilHealth covers some vaccines for eligible members.",
    followUps: [
      "How much do vaccines cost?",
      "What vaccines do you recommend for adults?",
      "Is there a vaccination schedule for children?",
    ],
  },
  {
    keywords: ["privacy", "data", "security", "safe", "hipaa", "confidential", "information"],
    answer: "Your health data is encrypted using AES-256 and stored on secure servers compliant with RA 10173 (Data Privacy Act of the Philippines). We never share your information without explicit consent. Access is restricted to your care team only. Read our full Privacy Policy at hanapcare.ph/privacy.",
    followUps: [
      "Who can access my health records?",
      "Can I download my own records?",
      "How do I report a data concern?",
    ],
  },
  {
    keywords: ["thank", "thanks", "thank you", "salamat", "maraming salamat", "ok thank"],
    answer: "You're very welcome! 😊 Is there anything else I can help you with? Our human support agents are also standing by if you need more personalized assistance. Take care and stay healthy!",
    followUps: [
      "How do I book an appointment?",
      "How do I contact a doctor?",
      "What are your operating hours?",
    ],
  },
];

const SUPPORT_ROLES = ["Support", "Admin"];

function getBotResponse(message: string): { answer: string; followUps: string[] } {
  const lower = message.toLowerCase();
  for (const item of BOT_ANSWERS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return { answer: item.answer, followUps: item.followUps };
    }
  }
  return {
    answer: "I'm not sure about that specific question, but a HanapCare support agent will be with you shortly to help! In the meantime, you can also reach us at support@hanapcare.ph or call our hotline at (02) 8-HANAP-CARE.",
    followUps: [
      "How do I book an appointment?",
      "How do I view my billing?",
      "What are your operating hours?",
    ],
  };
}

// ── Public / anonymous chat (no auth required) ─────────────────────────────

router.post("/chat/public/sessions", async (req, res) => {
  try {
    const { anonymousId, subject } = req.body;
    if (!anonymousId) return res.status(400).json({ error: "anonymousId required" });

    const existing = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.anonymousId, anonymousId))
      .limit(1);

    if (existing.length > 0) return res.json(existing[0]);

    const [session] = await db
      .insert(chatSessionsTable)
      .values({ anonymousId, subject: subject || "Guest Inquiry", status: "open" })
      .returning();

    await db.insert(chatMessagesTable).values({
      sessionId: session.id,
      senderId: null as unknown as number,
      content: "Hi there! 👋 I'm here to help. Ask me anything about HanapCare, or choose a topic below.",
      isBot: true,
      isRead: true,
    });

    return res.status(201).json(session);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/public/sessions/:anonymousId/messages", async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const sessions = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.anonymousId, anonymousId))
      .limit(1);

    if (!sessions.length) return res.json([]);

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessions[0].id))
      .orderBy(chatMessagesTable.createdAt);

    return res.json(messages);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat/public/sessions/:anonymousId/messages", async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Message content required" });

    const sessions = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.anonymousId, anonymousId))
      .limit(1);

    if (!sessions.length) return res.status(404).json({ error: "Session not found" });

    const sessionId = sessions[0].id;

    const [message] = await db
      .insert(chatMessagesTable)
      .values({
        sessionId,
        senderId: null as unknown as number,
        content: content.trim(),
        isBot: false,
        isRead: false,
      })
      .returning();

    const { answer, followUps } = getBotResponse(content);
    const [bot] = await db
      .insert(chatMessagesTable)
      .values({
        sessionId,
        senderId: null as unknown as number,
        content: answer,
        isBot: true,
        isRead: false,
      })
      .returning();

    await db
      .update(chatSessionsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessionsTable.id, sessionId));

    return res.status(201).json({ messages: [message, bot], followUpSuggestions: followUps });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Authenticated chat ──────────────────────────────────────────────────────

router.post("/chat/sessions", requireAuth, async (req, res) => {
  try {
    const { subject } = req.body;
    const [session] = await db
      .insert(chatSessionsTable)
      .values({ patientId: req.jwtUser!.sub, subject: subject || "General Inquiry", status: "open" })
      .returning();

    await db.insert(chatMessagesTable).values({
      sessionId: session.id,
      senderId: null as unknown as number,
      content: "Hello! Welcome to HanapCare Support 👋 I'm your virtual assistant. Ask me anything about appointments, billing, lab results, or any other HanapCare service. A human agent is also standing by if you need more help.",
      isBot: true,
      isRead: true,
    });

    return res.status(201).json(session);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/sessions", requireAuth, async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(chatSessionsTable)
      .where(eq(chatSessionsTable.patientId, req.jwtUser!.sub))
      .orderBy(desc(chatSessionsTable.updatedAt));
    return res.json(sessions);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/sessions/support", requireAuth, async (req, res) => {
  try {
    const sessions = await db
      .select({
        id: chatSessionsTable.id,
        patientId: chatSessionsTable.patientId,
        assignedToId: chatSessionsTable.assignedToId,
        status: chatSessionsTable.status,
        subject: chatSessionsTable.subject,
        createdAt: chatSessionsTable.createdAt,
        updatedAt: chatSessionsTable.updatedAt,
        patientName: usersTable.fullName,
      })
      .from(chatSessionsTable)
      .leftJoin(usersTable, eq(chatSessionsTable.patientId, usersTable.id))
      .orderBy(desc(chatSessionsTable.updatedAt));
    return res.json(sessions);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/sessions/:id/messages", requireAuth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.sessionId, sessionId))
      .orderBy(chatMessagesTable.createdAt);

    await db
      .update(chatMessagesTable)
      .set({ isRead: true })
      .where(eq(chatMessagesTable.sessionId, sessionId));

    return res.json(messages);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat/sessions/:id/messages", requireAuth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Message content required" });

    const senderRole = req.jwtUser!.role;
    const isAgentSender = SUPPORT_ROLES.includes(senderRole);

    const [message] = await db
      .insert(chatMessagesTable)
      .values({
        sessionId,
        senderId: req.jwtUser!.sub,
        content: content.trim(),
        isBot: false,
        isRead: isAgentSender,
      })
      .returning();

    await db
      .update(chatSessionsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessionsTable.id, sessionId));

    const result: { messages: typeof message[]; followUpSuggestions?: string[] } = {
      messages: [message],
    };

    if (!isAgentSender) {
      const { answer, followUps } = getBotResponse(content);
      const [bot] = await db
        .insert(chatMessagesTable)
        .values({ sessionId, senderId: null as unknown as number, content: answer, isBot: true, isRead: false })
        .returning();
      result.messages.push(bot);
      result.followUpSuggestions = followUps;
    }

    return res.status(201).json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/chat/sessions/:id/status", requireAuth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const { status } = req.body;
    await db.update(chatSessionsTable).set({ status, updatedAt: new Date() }).where(eq(chatSessionsTable.id, sessionId));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/chat/unread-count", requireAuth, async (req, res) => {
  try {
    const rows = await db
      .select({
        sessionId: chatMessagesTable.sessionId,
        unread: count(),
      })
      .from(chatMessagesTable)
      .innerJoin(chatSessionsTable, eq(chatMessagesTable.sessionId, chatSessionsTable.id))
      .where(
        and(
          eq(chatMessagesTable.isRead, false),
          eq(chatMessagesTable.isBot, false),
          eq(chatSessionsTable.status, "open"),
        ),
      )
      .groupBy(chatMessagesTable.sessionId);

    const sessions: Record<number, number> = {};
    let total = 0;
    for (const row of rows) {
      sessions[row.sessionId] = Number(row.unread);
      total += Number(row.unread);
    }

    return res.json({ total, sessions });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/chat/sessions/:id/assign", requireAuth, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    await db
      .update(chatSessionsTable)
      .set({ assignedToId: req.jwtUser!.sub, updatedAt: new Date() })
      .where(eq(chatSessionsTable.id, sessionId));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
