import { Router } from "express";
import { db } from "@workspace/db";
import { medicinesTable, dispensingRecordsTable, patientsTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";

const router = Router();

router.get("/medicines", async (req, res) => {
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

router.post("/medicines", async (req, res) => {
  try {
    const [med] = await db.insert(medicinesTable).values(req.body).returning();
    return res.status(201).json(med);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/medicines/:id", async (req, res) => {
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

router.patch("/medicines/:id", async (req, res) => {
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

router.get("/dispensing-records", async (req, res) => {
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

router.post("/dispensing-records", async (req, res) => {
  try {
    const { medicineId, quantityDispensed } = req.body;
    const today = new Date().toISOString();
    const [record] = await db.insert(dispensingRecordsTable).values({
      ...req.body,
      dispensedAt: today,
    }).returning();

    // Decrease stock
    await db.execute(sql`UPDATE medicines SET quantity = quantity - ${quantityDispensed} WHERE id = ${medicineId}`);

    return res.status(201).json(record);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
