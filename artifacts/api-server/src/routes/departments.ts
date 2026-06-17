import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable, staffTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/departments", requireAuth, async (req, res) => {
  try {
    const depts = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
    const staffCounts = await db.select({
      departmentId: staffTable.departmentId,
      count: sql<number>`count(*)`,
      activeCount: sql<number>`count(*) filter (where ${staffTable.isActive} = true)`,
    }).from(staffTable).groupBy(staffTable.departmentId);

    const countMap = new Map(staffCounts.map(s => [s.departmentId, {
      total: Number(s.count),
      active: Number(s.activeCount),
    }]));

    return res.json(depts.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      headDoctorName: null,
      staffCount: countMap.get(d.id)?.total ?? 0,
      activeCount: countMap.get(d.id)?.active ?? 0,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/departments/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id));
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const members = await db.select({
      id: staffTable.id,
      firstName: staffTable.firstName,
      lastName: staffTable.lastName,
      role: staffTable.role,
      email: staffTable.email,
      contactNumber: staffTable.contactNumber,
      shift: staffTable.shift,
      isActive: staffTable.isActive,
      employeeId: staffTable.employeeId,
      joinedAt: staffTable.joinedAt,
    }).from(staffTable)
      .where(eq(staffTable.departmentId, id))
      .orderBy(staffTable.role, staffTable.lastName);

    const activeCount = members.filter(m => m.isActive).length;

    return res.json({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      staffCount: members.length,
      activeCount,
      inactiveCount: members.length - activeCount,
      members,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/departments", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const [dept] = await db.insert(departmentsTable).values(req.body).returning();
    return res.status(201).json({ ...dept, headDoctorName: null, staffCount: 0, activeCount: 0 });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/departments/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    const { name, description } = req.body;
    await db.update(departmentsTable).set({ name, description }).where(eq(departmentsTable.id, id));
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id));
    if (!dept) return res.status(404).json({ error: "Not found" });
    return res.json(dept);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
