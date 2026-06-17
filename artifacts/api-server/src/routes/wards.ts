import { Router } from "express";
import { db } from "@workspace/db";
import { wardsTable, bedsTable, patientsTable, auditLogsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const WARD_MGMT_ROLES = ["Admin", "Nurse", "Receptionist"];

router.get("/wards", requireAuth, async (req, res) => {
  try {
    const wards = await db.select().from(wardsTable).orderBy(wardsTable.name);
    const bedCounts = await db.select({
      wardId: bedsTable.wardId,
      available: sql<number>`COUNT(CASE WHEN status = 'Available' THEN 1 END)`,
    }).from(bedsTable).groupBy(bedsTable.wardId);
    const countMap = new Map(bedCounts.map(b => [b.wardId, Number(b.available)]));

    return res.json(wards.map(w => ({
      id: w.id,
      name: w.name,
      wardType: w.wardType,
      floor: w.floor,
      totalBeds: w.totalBeds,
      availableBeds: countMap.get(w.id) ?? w.totalBeds,
      description: w.description,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/wards", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const [ward] = await db.insert(wardsTable).values(req.body).returning();
    return res.status(201).json({ ...ward, availableBeds: ward.totalBeds });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/beds", requireAuth, async (req, res) => {
  try {
    const conditions: any[] = [];
    if (req.query.wardId) conditions.push(eq(bedsTable.wardId, Number(req.query.wardId)));
    if (req.query.status) conditions.push(eq(bedsTable.status, req.query.status as string));

    let q = db.select({
      id: bedsTable.id,
      wardId: bedsTable.wardId,
      wardName: wardsTable.name,
      bedNumber: bedsTable.bedNumber,
      status: bedsTable.status,
      patientId: bedsTable.patientId,
      patientName: sql<string>`CASE WHEN p.first_name IS NOT NULL THEN concat(p.first_name, ' ', p.last_name) ELSE NULL END`,
      admittedAt: bedsTable.admittedAt,
      notes: bedsTable.notes,
    })
      .from(bedsTable)
      .leftJoin(wardsTable, eq(bedsTable.wardId, wardsTable.id))
      .leftJoin(patientsTable, eq(bedsTable.patientId, patientsTable.id));

    if (conditions.length > 0) q = q.where(and(...conditions)) as any;
    const rows = await q.orderBy(wardsTable.name, bedsTable.bedNumber);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/beds", requireAuth, requireRole("Admin", "Nurse"), async (req, res) => {
  try {
    const [bed] = await db.insert(bedsTable).values({ ...req.body, status: "Available" }).returning();
    return res.status(201).json({ ...bed, wardName: null, patientName: null });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/beds/:id", requireAuth, requireRole(...WARD_MGMT_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(bedsTable).set(req.body).where(eq(bedsTable.id, id));

    if (req.body.status) {
      await db.insert(auditLogsTable).values({
        action: "UPDATE_BED",
        tableName: "beds",
        recordId: id,
        userId: req.jwtUser!.sub,
        userName: req.jwtUser!.fullName,
        details: `Bed #${id} status changed to "${req.body.status}"`,
      });
    }

    const [bed] = await db.select({
      id: bedsTable.id,
      wardId: bedsTable.wardId,
      wardName: wardsTable.name,
      bedNumber: bedsTable.bedNumber,
      status: bedsTable.status,
      patientId: bedsTable.patientId,
      patientName: sql<string>`CASE WHEN p.first_name IS NOT NULL THEN concat(p.first_name, ' ', p.last_name) ELSE NULL END`,
      admittedAt: bedsTable.admittedAt,
      notes: bedsTable.notes,
    })
      .from(bedsTable)
      .leftJoin(wardsTable, eq(bedsTable.wardId, wardsTable.id))
      .leftJoin(patientsTable, eq(bedsTable.patientId, patientsTable.id))
      .where(eq(bedsTable.id, id));
    if (!bed) return res.status(404).json({ error: "Bed not found" });
    return res.json(bed);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
