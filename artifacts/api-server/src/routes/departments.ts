import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable, staffTable, doctorsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/departments", async (req, res) => {
  try {
    const depts = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
    const staffCounts = await db.select({
      departmentId: staffTable.departmentId,
      count: sql<number>`count(*)`,
    }).from(staffTable).groupBy(staffTable.departmentId);

    const countMap = new Map(staffCounts.map(s => [s.departmentId, Number(s.count)]));

    return res.json(depts.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      headDoctorName: null,
      staffCount: countMap.get(d.id) ?? 0,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/departments", async (req, res) => {
  try {
    const [dept] = await db.insert(departmentsTable).values(req.body).returning();
    return res.status(201).json({ ...dept, headDoctorName: null, staffCount: 0 });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
