import { Router } from "express";
import { db } from "@workspace/db";
import { labRequestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const BASE_QUERY = `
  SELECT
    lr.id, lr.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    lr.doctor_id as "doctorId",
    concat(d.first_name, ' ', d.last_name) as "doctorName",
    lr.test_type as "testType", lr.status,
    lr.requested_at as "requestedAt",
    lr.completed_at as "completedAt",
    lr.result_summary as "resultSummary",
    lr.result_file_url as "resultFileUrl",
    lr.notes
  FROM lab_requests lr
  LEFT JOIN patients p ON p.id = lr.patient_id
  LEFT JOIN doctors d ON d.id = lr.doctor_id
`;

router.get("/lab-requests", async (req, res) => {
  try {
    let rows: any[];
    if (req.query.status && req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.status = ${req.query.status as string} AND lr.patient_id = ${Number(req.query.patientId)} ORDER BY lr.requested_at DESC`);
      rows = r.rows as any[];
    } else if (req.query.status) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.status = ${req.query.status as string} ORDER BY lr.requested_at DESC`);
      rows = r.rows as any[];
    } else if (req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.patient_id = ${Number(req.query.patientId)} ORDER BY lr.requested_at DESC`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY lr.requested_at DESC`);
      rows = r.rows as any[];
    }
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/lab-requests", async (req, res) => {
  try {
    const today = new Date().toISOString();
    const [lab] = await db.insert(labRequestsTable).values({
      ...req.body,
      requestedAt: today,
      status: "Pending",
    }).returning();
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.id = ${lab.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? lab);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/lab-requests/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Lab request not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/lab-requests/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(labRequestsTable).set(req.body).where(eq(labRequestsTable.id, id));
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE lr.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Lab request not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
