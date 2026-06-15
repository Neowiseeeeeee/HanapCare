import { Router } from "express";
import { db } from "@workspace/db";
import { chatSessionsTable, chatMessagesTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const BOT_ANSWERS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["appointment", "book", "schedule", "visit"],
    answer: "To book an appointment, log in to your dashboard and click 'Book Appointment'. You can choose a specialist, pick your preferred date, and confirm your visit in just a few steps.",
  },
  {
    keywords: ["result", "lab", "test", "blood"],
    answer: "Your lab and test results are available in your dashboard under 'My Records'. Results typically appear within 24-48 hours of your test.",
  },
  {
    keywords: ["bill", "billing", "payment", "pay", "invoice"],
    answer: "You can view and pay your bills from your dashboard under 'Billing & Payments'. We accept major credit cards and online bank transfers.",
  },
  {
    keywords: ["prescription", "medicine", "medication"],
    answer: "Active prescriptions are listed in your dashboard under 'Prescriptions'. Bring your digital prescription ID to any of our in-house pharmacies to collect your medication.",
  },
  {
    keywords: ["account", "sign up", "register", "create"],
    answer: "Creating an account is free! Click 'Get Started' at the top of the page, fill in your details, and complete your health profile. It takes less than 5 minutes.",
  },
  {
    keywords: ["emergency", "urgent"],
    answer: "For medical emergencies, please call emergency services (911) immediately. Our emergency department is open 24/7. Once you're stable, you can register your visit in the app.",
  },
  {
    keywords: ["doctor", "specialist", "find"],
    answer: "You can browse our network of specialists from the 'Book Appointment' section. Filter by specialty, availability, or location to find the right doctor for you.",
  },
  {
    keywords: ["privacy", "data", "security", "safe"],
    answer: "Your health data is fully encrypted and stored securely. We never share your information without your explicit consent. Read our Privacy Policy for full details.",
  },
  {
    keywords: ["password", "forgot", "reset", "login"],
    answer: "If you forgot your password, click 'Forgot password?' on the Sign In page to receive a reset link by email.",
  },
];

function getBotReply(message: string): string | null {
  const lower = message.toLowerCase();
  for (const item of BOT_ANSWERS) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.answer;
    }
  }
  return null;
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
      content: "Hello! I'm here to help. Ask me anything about HanapCare services, or choose a topic below.",
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
