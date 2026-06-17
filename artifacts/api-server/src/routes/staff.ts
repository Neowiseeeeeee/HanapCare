import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable, departmentsTable } from "@workspace/db";
import { eq, sql, ilike, or, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const staffWithDept = (where?: any) => {
  let q = db.select({
    id: staffTable.id,
    firstName: staffTable.firstName,
    lastName: staffTable.lastName,
    role: staffTable.role,
    email: staffTable.email,
    contactNumber: staffTable.contactNumber,
    departmentId: staffTable.departmentId,
    departmentName: departmentsTable.name,
    employeeId: staffTable.employeeId,
    shift: staffTable.shift,
    isActive: staffTable.isActive,
    joinedAt: staffTable.joinedAt,
  })
    .from(staffTable)
    .leftJoin(departmentsTable, eq(staffTable.departmentId, departmentsTable.id));
  if (where) q = q.where(where) as any;
  return q.orderBy(staffTable.lastName);
};

router.get("/staff", requireAuth, async (req, res) => {
  try {
    const conditions: any[] = [];
    if (req.query.role) conditions.push(eq(staffTable.role, req.query.role as string));
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      conditions.push(or(ilike(staffTable.firstName, s), ilike(staffTable.lastName, s), ilike(staffTable.email, s)));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await staffWithDept(where);
    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/staff", requireAuth, requireRole("Admin", "HR Manager"), async (req, res) => {
  try {
    const [s] = await db.insert(staffTable).values(req.body).returning();
    const rows = await staffWithDept(eq(staffTable.id, s.id));
    return res.status(201).json(rows[0] ?? s);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/staff/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await staffWithDept(eq(staffTable.id, id));
    if (!rows.length) return res.status(404).json({ error: "Staff not found" });
    return res.json(rows[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/staff/:id", requireAuth, requireRole("Admin", "HR Manager"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(staffTable).set(req.body).where(eq(staffTable.id, id));
    const rows = await staffWithDept(eq(staffTable.id, id));
    if (!rows.length) return res.status(404).json({ error: "Staff not found" });
    return res.json(rows[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
