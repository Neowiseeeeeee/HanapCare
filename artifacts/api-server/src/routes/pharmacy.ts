import { Router } from "express";
import { db } from "@workspace/db";
import { medicinesTable, dispensingRecordsTable, patientsTable, auditLogsTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const PHARMA_ROLES = ["Admin", "Pharmacist"];

router.get("/medicines", requireAuth, async (req, res) => {
  try {
    const conditions: any[] = [eq(medicinesTable.isActive, true)];
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(sql`(drug_name ILIKE ${s} OR generic_name ILIKE ${s})`);
    }
    if (req.query.lowStock === "true") {
      conditions.push(sql`quantity <= reorder_level`);
    }
    const rows = await db.select().from(medicinesTable)
      .where(and(...conditions))
      .orderBy(medicinesTable.drugName);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/medicines", requireAuth, requireRole(...PHARMA_ROLES), async (req, res) => {
  try {
    const [med] = await db.insert(medicinesTable).values(req.body).returning();

    await db.insert(auditLogsTable).values({
      action: "CREATE_MEDICINE",
      tableName: "medicines",
      recordId: med.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Medicine "${med.drugName}" added to inventory`,
    });

    return res.status(201).json(med);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/medicines/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [med] = await db.select().from(medicinesTable).where(eq(medicinesTable.id, id));
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    return res.json(med);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/medicines/:id", requireAuth, requireRole(...PHARMA_ROLES), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [med] = await db.update(medicinesTable).set(req.body).where(eq(medicinesTable.id, id)).returning();
    if (!med) return res.status(404).json({ error: "Medicine not found" });
    return res.json(med);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dispensing-records", requireAuth, async (req, res) => {
  try {
    let q = db.select({
      id: dispensingRecordsTable.id,
      patientId: dispensingRecordsTable.patientId,
      patientName: sql<string>`concat(p.first_name, ' ', p.last_name)`,
      medicineId: dispensingRecordsTable.medicineId,
      medicineName: medicinesTable.drugName,
      prescriptionId: dispensingRecordsTable.prescriptionId,
      quantityDispensed: dispensingRecordsTable.quantityDispensed,
      dispensedAt: dispensingRecordsTable.dispensedAt,
      dispensedBy: dispensingRecordsTable.dispensedBy,
    })
      .from(dispensingRecordsTable)
      .leftJoin(patientsTable, eq(dispensingRecordsTable.patientId, patientsTable.id))
      .leftJoin(medicinesTable, eq(dispensingRecordsTable.medicineId, medicinesTable.id));

    if (req.query.patientId) {
      q = q.where(eq(dispensingRecordsTable.patientId, Number(req.query.patientId))) as any;
    }
    const rows = await q.orderBy(sql`${dispensingRecordsTable.dispensedAt} desc`);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dispensing-records", requireAuth, requireRole(...PHARMA_ROLES), async (req, res) => {
  try {
    const { medicineId, quantityDispensed, patientId } = req.body;

    if (!medicineId || !quantityDispensed || !patientId) {
      return res.status(400).json({ error: "medicineId, quantityDispensed, and patientId are required" });
    }

    const [medicine] = await db.select().from(medicinesTable).where(eq(medicinesTable.id, Number(medicineId)));
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });
    if (medicine.quantity < Number(quantityDispensed)) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${medicine.quantity}` });
    }

    const today = new Date().toISOString();
    const dispensedBy = req.jwtUser!.fullName;

    const [record] = await db.insert(dispensingRecordsTable).values({
      ...req.body,
      dispensedAt: today,
      dispensedBy,
    }).returning();

    await db.execute(sql`UPDATE medicines SET quantity = quantity - ${quantityDispensed} WHERE id = ${medicineId}`);

    await db.insert(auditLogsTable).values({
      action: "DISPENSE_MEDICINE",
      tableName: "dispensing_records",
      recordId: record.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `${quantityDispensed}x "${medicine.drugName}" dispensed to patient #${patientId}`,
    });

    return res.status(201).json(record);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
