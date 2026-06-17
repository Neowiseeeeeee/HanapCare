import { Router } from "express";
import { db } from "@workspace/db";
import {
  patientsTable, staffTable, doctorsTable, appointmentsTable,
  billingsTable, bedsTable, medicinesTable, labRequestsTable,
  auditLogsTable, consultationsTable, paymentsTable,
} from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const [totalPatients] = await db.select({ count: sql<number>`count(*)` }).from(patientsTable);
    const [totalStaff] = await db.select({ count: sql<number>`count(*)` }).from(staffTable);
    const [totalDoctors] = await db.select({ count: sql<number>`count(*)` }).from(doctorsTable);

    const today = new Date().toISOString().split("T")[0];
    const [appointmentsToday] = await db.select({ count: sql<number>`count(*)` }).from(appointmentsTable)
      .where(eq(appointmentsTable.appointmentDate, today));

    const [pendingBills] = await db.select({ count: sql<number>`count(*)` }).from(billingsTable)
      .where(eq(billingsTable.status, "Unpaid"));

    const allBeds = await db.select({ status: bedsTable.status }).from(bedsTable);
    const availableBeds = allBeds.filter(b => b.status === "Available").length;
    const occupiedBeds = allBeds.filter(b => b.status === "Occupied").length;

    const [revenueResult] = await db.select({ total: sql<number>`coalesce(sum(paid_amount),0)` }).from(billingsTable);

    const [lowStockResult] = await db.select({ count: sql<number>`count(*)` }).from(medicinesTable)
      .where(sql`quantity <= reorder_level`);

    const [pendingLabResult] = await db.select({ count: sql<number>`count(*)` }).from(labRequestsTable)
      .where(eq(labRequestsTable.status, "Pending"));

    return res.json({
      totalPatients: Number(totalPatients.count),
      totalStaff: Number(totalStaff.count),
      totalDoctors: Number(totalDoctors.count),
      appointmentsToday: Number(appointmentsToday.count),
      pendingBills: Number(pendingBills.count),
      availableBeds,
      occupiedBeds,
      totalRevenue: Number(revenueResult.total),
      lowStockCount: Number(lowStockResult.count),
      pendingLabRequests: Number(pendingLabResult.count),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res) => {
  try {
    const logs = await db.select().from(auditLogsTable).orderBy(sql`created_at desc`).limit(10);
    return res.json(logs.map(l => ({
      id: l.id,
      action: l.action,
      user: l.userName,
      timestamp: l.timestamp,
      category: l.tableName ?? "system",
      details: l.details,
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/bed-occupancy", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT w.name as ward_name, w.total_beds,
        COUNT(CASE WHEN b.status = 'Occupied' THEN 1 END) as occupied,
        COUNT(CASE WHEN b.status = 'Available' THEN 1 END) as available
      FROM wards w
      LEFT JOIN beds b ON b.ward_id = w.id
      GROUP BY w.id, w.name, w.total_beds
    `);
    return res.json((result.rows as any[]).map(r => ({
      wardName: r.ward_name,
      totalBeds: Number(r.total_beds),
      occupied: Number(r.occupied),
      available: Number(r.available),
    })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/revenue-trend", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', issued_at::date), 'Mon') as month,
        EXTRACT(MONTH FROM issued_at::date) as month_num,
        EXTRACT(YEAR FROM issued_at::date) as year,
        COALESCE(SUM(paid_amount::numeric), 0) as revenue
      FROM billings
      WHERE issued_at IS NOT NULL
        AND issued_at::date >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY DATE_TRUNC('month', issued_at::date), month_num, year
      ORDER BY year ASC, month_num ASC
    `);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dbMap = new Map<string, number>();
    for (const row of result.rows as any[]) {
      dbMap.set(row.month, Number(row.revenue));
    }

    const trend = months.map(month => ({
      month,
      revenue: dbMap.get(month) ?? 0,
    }));

    return res.json(trend);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/appointment-stats", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT status, COUNT(*) as count FROM appointments GROUP BY status
    `);
    const stats: Record<string, number> = { pending: 0, confirmed: 0, checkedIn: 0, ongoing: 0, completed: 0, cancelled: 0 };
    for (const row of result.rows as any[]) {
      const key = row.status?.toLowerCase().replace(" ", "") ?? "";
      if (key === "pending") stats.pending = Number(row.count);
      else if (key === "confirmed") stats.confirmed = Number(row.count);
      else if (key === "checkedin") stats.checkedIn = Number(row.count);
      else if (key === "ongoing") stats.ongoing = Number(row.count);
      else if (key === "completed") stats.completed = Number(row.count);
      else if (key === "cancelled") stats.cancelled = Number(row.count);
    }
    return res.json(stats);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-diagnoses", requireAuth, async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT diagnosis, COUNT(*) as count FROM consultations
      WHERE diagnosis IS NOT NULL AND diagnosis != ''
      GROUP BY diagnosis ORDER BY count DESC LIMIT 8
    `);
    return res.json((result.rows as any[]).map(r => ({ diagnosis: r.diagnosis, count: Number(r.count) })));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/inventory-alerts", requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const futureDate = thirtyDaysFromNow.toISOString().split("T")[0];

    const lowStock = await db.select().from(medicinesTable)
      .where(and(sql`quantity <= reorder_level`, eq(medicinesTable.isActive, true)))
      .limit(5);

    const expiring = await db.select().from(medicinesTable)
      .where(and(
        sql`expiration_date IS NOT NULL`,
        sql`expiration_date <= ${futureDate}`,
        sql`expiration_date >= ${today}`,
        eq(medicinesTable.isActive, true)
      ))
      .limit(5);

    const alerts = [
      ...lowStock.map(m => ({ id: m.id, name: m.drugName, type: "low_stock", severity: "warning", quantity: m.quantity, expiryDate: null })),
      ...expiring.map(m => ({ id: m.id, name: m.drugName, type: "expiring", severity: "danger", quantity: m.quantity, expiryDate: m.expirationDate })),
    ];

    return res.json(alerts);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
