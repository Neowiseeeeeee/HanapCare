import { Router } from "express";
import { db } from "@workspace/db";
import { vitalSignsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const RECORD_ROLES = ["Admin", "Doctor", "Nurse"];

router.get("/vital-signs", requireAuth, async (req, res) => {
  try {
    const { patientId } = req.query;
    let rows;
    if (patientId) {
      rows = await db
        .select()
        .from(vitalSignsTable)
        .where(eq(vitalSignsTable.patientId, Number(patientId)))
        .orderBy(desc(sql`recorded_at`))
        .limit(50);
    } else {
      rows = await db
        .select()
        .from(vitalSignsTable)
        .orderBy(desc(sql`recorded_at`))
        .limit(50);
    }
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/vital-signs", requireAuth, requireRole(...RECORD_ROLES), async (req, res) => {
  try {
    const {
      patientId, recordedAt, recordedBy,
      bloodPressureSystolic, bloodPressureDiastolic,
      heartRate, respiratoryRate, oxygenSaturation,
      temperature, weight, height,
    } = req.body;

    if (!patientId || !recordedAt) {
      return res.status(400).json({ error: "patientId and recordedAt are required" });
    }

    const [vital] = await db
      .insert(vitalSignsTable)
      .values({
        patientId: Number(patientId),
        recordedAt,
        recordedBy: recordedBy ?? req.jwtUser!.fullName,
        bloodPressureSystolic: bloodPressureSystolic ? Number(bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: bloodPressureDiastolic ? Number(bloodPressureDiastolic) : undefined,
        heartRate: heartRate ? Number(heartRate) : undefined,
        respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
        oxygenSaturation: oxygenSaturation ?? undefined,
        temperature: temperature ?? undefined,
        weight: weight ?? undefined,
        height: height ?? undefined,
      })
      .returning();

    return res.status(201).json(vital);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/vital-signs/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [vital] = await db.select().from(vitalSignsTable).where(eq(vitalSignsTable.id, id)).limit(1);
    if (!vital) return res.status(404).json({ error: "Vital sign record not found" });
    return res.json(vital);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
