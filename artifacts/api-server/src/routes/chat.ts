import { Router } from "express";
import { db } from "@workspace/db";
import { chatSessionsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const BOT_ANSWERS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["appointment", "book", "schedule", "visit", "consult"],
    answer: "To book an appointment, log in to your dashboard and click 'Book Appointment'. You can choose a specialist, pick your preferred date, and confirm your visit in just a few steps. Our team will confirm within 24 hours.",
  },
  {
    keywords: ["result", "lab", "test", "blood", "laboratory", "diagnostic"],
    answer: "Your lab and test results are available in your dashboard under 'My Records → Lab Results'. Results typically appear within 24–48 hours of your test. If you need urgent results, please call our lab directly.",
  },
  {
    keywords: ["bill", "billing", "payment", "pay", "invoice", "fee", "cost", "price", "charge"],
    answer: "You can view and pay your bills from your dashboard under 'Billing & Payments'. We accept major credit cards, GCash, Maya, and online bank transfers (BPI, BDO, UnionBank). Installment plans are available for bills above ₱10,000.",
  },
  {
    keywords: ["prescription", "medicine", "medication", "drug", "pharma", "refill"],
    answer: "Active prescriptions are listed in your dashboard under 'Prescriptions'. Bring your digital prescription ID to any of our in-house pharmacies. For refills, your doctor must approve a new prescription. Allow 1–2 business days for refill processing.",
  },
  {
    keywords: ["account", "sign up", "register", "create", "profile", "new patient"],
    answer: "Creating an account is completely free! Click 'Get Started' at the top of the page, fill in your details, and complete your health profile. It takes less than 5 minutes. Once done, you can immediately book appointments.",
  },
  {
    keywords: ["emergency", "urgent", "911", "critical", "ambulance"],
    answer: "🚨 For medical emergencies, call 911 or the Philippine Red Cross at (02) 790-2300 immediately. Our emergency department at HanapCare is open 24/7. Once you're stable, register your visit in the app so your health records are updated.",
  },
  {
    keywords: ["doctor", "specialist", "find", "physician", "surgeon", "cardiologist", "dermatologist"],
    answer: "Browse our network of specialists from the 'Book Appointment' section. Filter by specialty (Cardiology, Dermatology, Pediatrics, OB-GYN, Orthopedics, etc.), availability, and location. All our doctors are licensed by the Philippine Medical Association.",
  },
  {
    keywords: ["privacy", "data", "security", "safe", "HIPAA", "confidential"],
    answer: "Your health data is fully encrypted using AES-256 and stored on secure servers compliant with RA 10173 (Data Privacy Act of the Philippines). We never share your information without your explicit consent. Read our Privacy Policy at hanapcare.ph/privacy.",
  },
  {
    keywords: ["password", "forgot", "reset", "login", "can't log in", "locked out"],
    answer: "If you forgot your password, click 'Forgot password?' on the Sign In page. We'll send a reset link to your registered email. The link expires in 1 hour. If you're still having trouble, contact us at support@hanapcare.ph.",
  },
  {
    keywords: ["hours", "open", "time", "schedule", "when", "operating"],
    answer: "HanapCare facilities are open Monday–Friday 7AM–8PM, Saturday 8AM–5PM, Sunday 9AM–3PM. The Emergency Department is open 24/7 every day. Telehealth consultations are available 7AM–10PM daily.",
  },
  {
    keywords: ["location", "address", "where", "branch", "clinic", "hospital"],
    answer: "Our main facility is at HanapCare Medical Center, Manila, Philippines. We have branches in Quezon City, Makati, Cebu, and Davao. Use the 'Find a Branch' feature on our website for directions and contact numbers.",
  },
  {
    keywords: ["insurance", "HMO", "PhilHealth", "coverage", "benefit"],
    answer: "HanapCare accepts PhilHealth, Maxicare, Medicard, Intellicare, Pacific Cross, and most major HMO providers. Bring your HMO card and member ID to your visit. For PhilHealth, you can use your member portal to verify coverage before your appointment.",
  },
  {
    keywords: ["telehealth", "online", "video", "virtual", "remote", "telemedicine"],
    answer: "Telehealth consultations are available for follow-ups, prescription renewals, and non-emergency conditions. Book a video consultation from your dashboard. Rates start at ₱300 per session. Same-day slots are often available.",
  },
  {
    keywords: ["cancel", "reschedule", "change appointment"],
    answer: "You can cancel or reschedule appointments from your dashboard under 'My Appointments'. Please do so at least 24 hours in advance. Late cancellations (under 2 hours) may incur a ₱200 rebooking fee. We'll notify your doctor automatically.",
  },
  {
    keywords: ["ward", "admission", "inpatient", "room", "bed", "confined"],
    answer: "For inpatient admissions, please visit the Admissions Office with a doctor's referral. Room types include private (₱3,500–₱6,000/day), semi-private (₱1,800–₱2,500/day), and ward beds (₱800–₱1,200/day). PhilHealth coverage applies to eligible patients.",
  },
  {
    keywords: ["vaccine", "vaccination", "immunization", "shot", "COVID", "flu"],
    answer: "Vaccination services are available at all HanapCare branches without an appointment. We offer flu vaccines, COVID-19 boosters, Hepatitis B, Pneumococcal, and travel vaccines. Bring your vaccination booklet for records update.",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "help"],
    answer: "Hello! Welcome to HanapCare Support 👋 I'm here to help with any questions about appointments, billing, lab results, prescriptions, or account issues. What can I help you with today?",
  },
  {
    keywords: ["thank", "thanks", "thank you", "salamat"],
    answer: "You're very welcome! 😊 Is there anything else I can help you with? If your question is more complex, one of our human support agents will be with you shortly. Take care and stay healthy!",
  },
];

function getBotReply(message: string): string | null {
  const lower = message.toLowerCase();
  for (const item of BOT_ANSWERS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  return "I'm not sure about that specific question, but a HanapCare support agent will be with you shortly to help! In the meantime, you can also reach us at support@hanapcare.ph or call our hotline at (02) 8-HANAP-CARE.";
}

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

    const [message] = await db
      .insert(chatMessagesTable)
      .values({ sessionId, senderId: req.jwtUser!.sub, content: content.trim(), isBot: false })
      .returning();

    await db
      .update(chatSessionsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessionsTable.id, sessionId));

    const botReply = getBotReply(content);
    const messages: typeof message[] = [message];

    if (botReply) {
      const [bot] = await db
        .insert(chatMessagesTable)
        .values({ sessionId, senderId: null as unknown as number, content: botReply, isBot: true })
        .returning();
      messages.push(bot);
    }

    return res.status(201).json(messages);
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

export default router;
