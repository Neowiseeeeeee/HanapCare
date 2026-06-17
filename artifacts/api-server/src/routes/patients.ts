import { Router } from "express";
import { db } from "@workspace/db";
import { patientsTable, appointmentsTable, consultationsTable, doctorsTable, auditLogsTable } from "@workspace/db";
import { eq, sql, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const STAFF_ROLES = ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager"];

router.get("/patients", requireAuth, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const offset = (page - 1) * limit;

    let query = db.select().from(patientsTable);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(patientsTable);

    if (search) {
      const likeSearch = `%${search}%`;
      const whereClause = or(
        ilike(patientsTable.firstName, likeSearch),
        ilike(patientsTable.lastName, likeSearch),
        ilike(patientsTable.patientCode, likeSearch),
        ilike(patientsTable.contactNumber, likeSearch)
      );
      query = query.where(whereClause) as any;
      countQuery = countQuery.where(whereClause) as any;
    }

    const [{ count }] = await countQuery;
    const data = await query.orderBy(sql`created_at desc`).limit(limit).offset(offset);

    return res.json({ data, total: Number(count), page, limit });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/patients", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const body = req.body;
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(patientsTable);
    const num = Number(countResult[0].count) + 1;
    const patientCode = `HC-${String(num).padStart(5, "0")}`;

    const [patient] = await db.insert(patientsTable).values({
      ...body,
      patientCode,
    }).returning();

    await db.insert(auditLogsTable).values({
      action: "CREATE_PATIENT",
      tableName: "patients",
      recordId: patient.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Patient ${patient.firstName} ${patient.lastName} (${patientCode}) created`,
    });

    return res.status(201).json(patient);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/patients/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    return res.json(patient);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/patients/:id", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [patient] = await db.update(patientsTable).set(req.body).where(eq(patientsTable.id, id)).returning();
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    await db.insert(auditLogsTable).values({
      action: "UPDATE_PATIENT",
      tableName: "patients",
      recordId: id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Patient record updated`,
    });

    return res.json(patient);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/patients/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [existing] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Patient not found" });

    await db.delete(patientsTable).where(eq(patientsTable.id, id));

    await db.insert(auditLogsTable).values({
      action: "DELETE_PATIENT",
      tableName: "patients",
      recordId: id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Patient ${existing.firstName} ${existing.lastName} (${existing.patientCode}) deleted`,
    });

    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/patients/:id/visits", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const visits = await db.select({
      id: consultationsTable.id,
      patientId: consultationsTable.patientId,
      visitDate: consultationsTable.consultationDate,
      reason: consultationsTable.subjective,
      doctorName: sql<string>`concat(d.first_name, ' ', d.last_name)`,
      diagnosis: consultationsTable.diagnosis,
      status: consultationsTable.status,
    })
      .from(consultationsTable)
      .leftJoin(doctorsTable, eq(consultationsTable.doctorId, doctorsTable.id))
      .where(eq(consultationsTable.patientId, id))
      .orderBy(sql`${consultationsTable.consultationDate} desc`);

    return res.json(visits.map(v => ({
      ...v,
      reason: v.reason ?? "General consultation",
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
