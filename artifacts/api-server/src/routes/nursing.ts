import { Router } from "express";
import { db } from "@workspace/db";
import { nursingNotesTable, patientsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const NURSING_ROLES = ["Admin", "Doctor", "Nurse"];

const BASE_QUERY = `
  SELECT
    nn.id, nn.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    nn.author_id as "authorId",
    nn.author_name as "authorName",
    nn.note_type as "noteType",
    nn.content, nn.shift,
    nn.is_handover as "isHandover",
    nn.created_at as "createdAt"
  FROM nursing_notes nn
  LEFT JOIN patients p ON p.id = nn.patient_id
`;

router.get("/nursing-notes", requireAuth, async (req, res) => {
  try {
    let rows: any[];
    if (req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE nn.patient_id = ${Number(req.query.patientId)} ORDER BY nn.created_at DESC`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY nn.created_at DESC LIMIT 100`);
      rows = r.rows as any[];
    }
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/nursing-notes", requireAuth, requireRole(...NURSING_ROLES), async (req, res) => {
  try {
    const { patientId, noteType, content, shift, isHandover } = req.body;

    if (!patientId || !content) {
      return res.status(400).json({ error: "patientId and content are required" });
    }

    const [note] = await db.insert(nursingNotesTable).values({
      patientId: Number(patientId),
      authorId: req.jwtUser!.sub,
      authorName: req.jwtUser!.fullName,
      noteType: noteType ?? "General",
      content: content.trim(),
      shift: shift ?? null,
      isHandover: isHandover ?? 0,
    }).returning();

    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE nn.id = ${note.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? note);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/nursing-notes/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE nn.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Note not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/nursing-notes/:id", requireAuth, requireRole(...NURSING_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(nursingNotesTable).set(req.body).where(eq(nursingNotesTable.id, id));
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE nn.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Note not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
