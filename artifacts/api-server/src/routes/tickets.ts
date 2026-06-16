import { Router } from "express";
import { db } from "@workspace/db";
import { supportTicketsTable, ticketRepliesTable, usersTable } from "@workspace/db";
import { eq, desc, and, count, ne } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SUPPORT_ROLES = ["Support", "Admin"];

router.get("/tickets/unread-count", requireAuth, async (req, res) => {
  try {
    const role = req.jwtUser!.role;
    const userId = req.jwtUser!.sub;

    if (SUPPORT_ROLES.includes(role)) {
      const [row] = await db
        .select({ count: count() })
        .from(supportTicketsTable)
        .where(ne(supportTicketsTable.status, "closed"));
      return res.json({ count: Number(row?.count ?? 0) });
    }

    if (role === "Patient") {
      const [row] = await db
        .select({ count: count() })
        .from(supportTicketsTable)
        .where(
          and(
            eq(supportTicketsTable.patientId, userId),
            ne(supportTicketsTable.status, "closed"),
          ),
        );
      return res.json({ count: Number(row?.count ?? 0) });
    }

    return res.json({ count: 0 });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets", requireAuth, async (req, res) => {
  try {
    const role = req.jwtUser!.role;
    const userId = req.jwtUser!.sub;

    if (SUPPORT_ROLES.includes(role)) {
      const tickets = await db
        .select({
          id: supportTicketsTable.id,
          subject: supportTicketsTable.subject,
          description: supportTicketsTable.description,
          priority: supportTicketsTable.priority,
          status: supportTicketsTable.status,
          assignedToId: supportTicketsTable.assignedToId,
          createdAt: supportTicketsTable.createdAt,
          updatedAt: supportTicketsTable.updatedAt,
          patientId: supportTicketsTable.patientId,
          patientName: usersTable.fullName,
        })
        .from(supportTicketsTable)
        .leftJoin(usersTable, eq(supportTicketsTable.patientId, usersTable.id))
        .orderBy(desc(supportTicketsTable.updatedAt));
      return res.json(tickets);
    }

    if (role === "Patient") {
      const tickets = await db
        .select()
        .from(supportTicketsTable)
        .where(eq(supportTicketsTable.patientId, userId))
        .orderBy(desc(supportTicketsTable.updatedAt));
      return res.json(tickets);
    }

    return res.status(403).json({ error: "Forbidden" });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", requireAuth, async (req, res) => {
  try {
    const userId = req.jwtUser!.sub;
    const role = req.jwtUser!.role;

    if (role !== "Patient" && !SUPPORT_ROLES.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { subject, description, priority = "medium" } = req.body;
    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Subject and description are required" });
    }

    const patientId = role === "Patient" ? userId : req.body.patientId;
    if (!patientId) return res.status(400).json({ error: "patientId required" });

    const [ticket] = await db
      .insert(supportTicketsTable)
      .values({ patientId, subject: subject.trim(), description: description.trim(), priority, status: "open" })
      .returning();

    return res.status(201).json(ticket);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets/:id", requireAuth, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.jwtUser!.sub;
    const role = req.jwtUser!.role;

    const [ticket] = await db
      .select({
        id: supportTicketsTable.id,
        subject: supportTicketsTable.subject,
        description: supportTicketsTable.description,
        priority: supportTicketsTable.priority,
        status: supportTicketsTable.status,
        assignedToId: supportTicketsTable.assignedToId,
        createdAt: supportTicketsTable.createdAt,
        updatedAt: supportTicketsTable.updatedAt,
        patientId: supportTicketsTable.patientId,
        patientName: usersTable.fullName,
      })
      .from(supportTicketsTable)
      .leftJoin(usersTable, eq(supportTicketsTable.patientId, usersTable.id))
      .where(eq(supportTicketsTable.id, ticketId));

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (role === "Patient" && ticket.patientId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const replies = await db
      .select({
        id: ticketRepliesTable.id,
        ticketId: ticketRepliesTable.ticketId,
        senderId: ticketRepliesTable.senderId,
        content: ticketRepliesTable.content,
        isStaff: ticketRepliesTable.isStaff,
        createdAt: ticketRepliesTable.createdAt,
        senderName: usersTable.fullName,
      })
      .from(ticketRepliesTable)
      .leftJoin(usersTable, eq(ticketRepliesTable.senderId, usersTable.id))
      .where(eq(ticketRepliesTable.ticketId, ticketId))
      .orderBy(ticketRepliesTable.createdAt);

    return res.json({ ...ticket, replies });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets/:id/replies", requireAuth, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.jwtUser!.sub;
    const role = req.jwtUser!.role;

    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.id, ticketId));

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (role === "Patient" && ticket.patientId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content required" });

    const isStaff = SUPPORT_ROLES.includes(role) ? 1 : 0;

    const [reply] = await db
      .insert(ticketRepliesTable)
      .values({ ticketId, senderId: userId, content: content.trim(), isStaff })
      .returning();

    await db
      .update(supportTicketsTable)
      .set({ updatedAt: new Date(), status: isStaff ? "in_progress" : ticket.status })
      .where(eq(supportTicketsTable.id, ticketId));

    return res.status(201).json(reply);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id/status", requireAuth, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const role = req.jwtUser!.role;
    if (!SUPPORT_ROLES.includes(role)) return res.status(403).json({ error: "Forbidden" });

    const { status, assignedToId } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (assignedToId !== undefined) updates.assignedToId = assignedToId;

    await db.update(supportTicketsTable).set(updates).where(eq(supportTicketsTable.id, ticketId));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
