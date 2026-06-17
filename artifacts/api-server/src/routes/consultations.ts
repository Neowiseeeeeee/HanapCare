import { Router } from "express";
import { db } from "@workspace/db";
import { consultationsTable, vitalSignsTable, prescriptionsTable, auditLogsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const CLINICAL_ROLES = ["Admin", "Doctor", "Nurse"];

const BASE_QUERY = `
  SELECT
    c.id, c.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    c.doctor_id as "doctorId",
    concat(d.first_name, ' ', d.last_name) as "doctorName",
    c.consultation_date as "consultationDate",
    c.subjective, c.objective, c.assessment, c.plan,
    c.diagnosis, c.icd_code as "icdCode", c.status
  FROM consultations c
  LEFT JOIN patients p ON p.id = c.patient_id
  LEFT JOIN doctors d ON d.id = c.doctor_id
`;

router.get("/consultations", requireAuth, async (req, res) => {
  try {
    let rows: any[];
    if (req.query.patientId && req.query.doctorId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.patient_id = ${Number(req.query.patientId)} AND c.doctor_id = ${Number(req.query.doctorId)} ORDER BY c.consultation_date DESC`);
      rows = r.rows as any[];
    } else if (req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.patient_id = ${Number(req.query.patientId)} ORDER BY c.consultation_date DESC`);
      rows = r.rows as any[];
    } else if (req.query.doctorId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.doctor_id = ${Number(req.query.doctorId)} ORDER BY c.consultation_date DESC`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY c.consultation_date DESC`);
      rows = r.rows as any[];
    }
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/consultations", requireAuth, requireRole(...CLINICAL_ROLES), async (req, res) => {
  try {
    const [c] = await db.insert(consultationsTable).values(req.body).returning();

    await db.insert(auditLogsTable).values({
      action: "CREATE_CONSULTATION",
      tableName: "consultations",
      recordId: c.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Consultation created for patient #${req.body.patientId}`,
    });

    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.id = ${c.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? c);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/consultations/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Consultation not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/consultations/:id", requireAuth, requireRole(...CLINICAL_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(consultationsTable).set(req.body).where(eq(consultationsTable.id, id));
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE c.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Consultation not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Vital signs
router.get("/vital-signs", requireAuth, async (req, res) => {
  try {
    let q = db.select().from(vitalSignsTable);
    if (req.query.patientId) {
      q = q.where(eq(vitalSignsTable.patientId, Number(req.query.patientId))) as any;
    }
    const rows = await q.orderBy(sql`${vitalSignsTable.recordedAt} desc`);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/vital-signs", requireAuth, requireRole(...CLINICAL_ROLES), async (req, res) => {
  try {
    const [vs] = await db.insert(vitalSignsTable).values(req.body).returning();
    return res.status(201).json(vs);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Prescriptions
const PRESC_BASE = `
  SELECT
    pr.id, pr.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    pr.doctor_id as "doctorId",
    concat(d.first_name, ' ', d.last_name) as "doctorName",
    pr.medicine_id as "medicineId",
    m.drug_name as "medicineName",
    pr.dosage, pr.frequency, pr.duration, pr.instructions,
    pr.prescribed_at as "prescribedAt", pr.status
  FROM prescriptions pr
  LEFT JOIN patients p ON p.id = pr.patient_id
  LEFT JOIN doctors d ON d.id = pr.doctor_id
  LEFT JOIN medicines m ON m.id = pr.medicine_id
`;

router.get("/prescriptions", requireAuth, async (req, res) => {
  try {
    let rows: any[];
    if (req.query.patientId) {
      const r = await db.execute(sql`${sql.raw(PRESC_BASE)} WHERE pr.patient_id = ${Number(req.query.patientId)} ORDER BY pr.prescribed_at DESC`);
      rows = r.rows as any[];
    } else if (req.query.doctorId) {
      const r = await db.execute(sql`${sql.raw(PRESC_BASE)} WHERE pr.doctor_id = ${Number(req.query.doctorId)} ORDER BY pr.prescribed_at DESC`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(PRESC_BASE)} ORDER BY pr.prescribed_at DESC`);
      rows = r.rows as any[];
    }
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/prescriptions", requireAuth, requireRole("Admin", "Doctor"), async (req, res) => {
  try {
    const [p] = await db.insert(prescriptionsTable).values(req.body).returning();

    await db.insert(auditLogsTable).values({
      action: "CREATE_PRESCRIPTION",
      tableName: "prescriptions",
      recordId: p.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Prescription created for patient #${req.body.patientId}`,
    });

    return res.status(201).json(p);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/prescriptions/:id", requireAuth, requireRole("Admin", "Doctor", "Pharmacist"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [p] = await db.update(prescriptionsTable).set(req.body).where(eq(prescriptionsTable.id, id)).returning();
    if (!p) return res.status(404).json({ error: "Prescription not found" });
    return res.json(p);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
