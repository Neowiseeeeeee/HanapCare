import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, auditLogsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/notifications", async (req, res) => {
  try {
    const rows = await db.select().from(notificationsTable).orderBy(sql`created_at desc`).limit(20);
    return res.json(rows.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      createdAt: n.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [n] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
    if (!n) return res.status(404).json({ error: "Notification not found" });
    return res.json({ ...n, createdAt: n.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    let q = db.select().from(auditLogsTable).orderBy(sql`created_at desc`);
    if (req.query.action) {
      q = q.where(eq(auditLogsTable.action, req.query.action as string)) as any;
    }
    const rows = await q.limit(limit).offset(offset);
    return res.json(rows.map(l => ({
      id: l.id,
      action: l.action,
      userId: l.userId,
      userName: l.userName,
      tableName: l.tableName,
      recordId: l.recordId,
      ipAddress: l.ipAddress,
      timestamp: l.timestamp,
      details: l.details,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
