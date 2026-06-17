import { Router } from "express";
import { db } from "@workspace/db";
import { doctorsTable, departmentsTable, auditLogsTable } from "@workspace/db";
import { eq, sql, ilike, or, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const doctorWithDept = (where?: any) => {
  let q = db.select({
    id: doctorsTable.id,
    firstName: doctorsTable.firstName,
    lastName: doctorsTable.lastName,
    licenseNumber: doctorsTable.licenseNumber,
    specialization: doctorsTable.specialization,
    departmentId: doctorsTable.departmentId,
    departmentName: departmentsTable.name,
    contactNumber: doctorsTable.contactNumber,
    email: doctorsTable.email,
    availability: doctorsTable.availability,
    isActive: doctorsTable.isActive,
  })
    .from(doctorsTable)
    .leftJoin(departmentsTable, eq(doctorsTable.departmentId, departmentsTable.id));
  if (where) q = q.where(where) as any;
  return q.orderBy(doctorsTable.lastName);
};

router.get("/doctors", requireAuth, async (req, res) => {
  try {
    const conditions = [];
    if (req.query.departmentId) conditions.push(eq(doctorsTable.departmentId, Number(req.query.departmentId)));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(doctorsTable.firstName, s), ilike(doctorsTable.lastName, s), ilike(doctorsTable.specialization, s)));
    }
    const where = conditions.length > 0 ? and(...conditions as any) : undefined;
    const data = await doctorWithDept(where);
    return res.json(data);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/doctors", requireAuth, requireRole("Admin", "HR Manager"), async (req, res) => {
  try {
    const [doc] = await db.insert(doctorsTable).values(req.body).returning();
    const rows = await doctorWithDept(eq(doctorsTable.id, doc.id));

    await db.insert(auditLogsTable).values({
      action: "CREATE_DOCTOR",
      tableName: "doctors",
      recordId: doc.id,
      userId: req.jwtUser!.sub,
      userName: req.jwtUser!.fullName,
      details: `Doctor ${doc.firstName} ${doc.lastName} added`,
    });

    return res.status(201).json(rows[0] ?? doc);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/doctors/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await doctorWithDept(eq(doctorsTable.id, id));
    if (!rows.length) return res.status(404).json({ error: "Doctor not found" });
    return res.json(rows[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/doctors/:id", requireAuth, requireRole("Admin", "HR Manager", "Doctor"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(doctorsTable).set(req.body).where(eq(doctorsTable.id, id));
    const rows = await doctorWithDept(eq(doctorsTable.id, id));
    if (!rows.length) return res.status(404).json({ error: "Doctor not found" });
    return res.json(rows[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
