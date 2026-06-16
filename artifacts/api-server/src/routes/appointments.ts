import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable, usersTable } from "@workspace/db";
import { eq, sql, ilike } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const BASE_QUERY = `
  SELECT 
    a.id, a.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    a.doctor_id as "doctorId",
    concat(d.first_name, ' ', d.last_name) as "doctorName",
    dept.name as "departmentName",
    a.appointment_date as "appointmentDate",
    a.time_slot as "timeSlot",
    a.status, a.queue_number as "queueNumber",
    a.reason, a.notes,
    a.created_at as "createdAt"
  FROM appointments a
  LEFT JOIN patients p ON p.id = a.patient_id
  LEFT JOIN doctors d ON d.id = a.doctor_id
  LEFT JOIN departments dept ON dept.id = d.department_id
`;

router.get("/appointments", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(appointmentsTable);

    let rows: any[];
    if (req.query.date && req.query.status) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.appointment_date = ${req.query.date as string} AND a.status = ${req.query.status as string} ORDER BY a.appointment_date DESC, a.time_slot ASC`);
      rows = r.rows as any[];
    } else if (req.query.date) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.appointment_date = ${req.query.date as string} ORDER BY a.appointment_date DESC, a.time_slot ASC`);
      rows = r.rows as any[];
    } else if (req.query.status) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.status = ${req.query.status as string} ORDER BY a.appointment_date DESC, a.time_slot ASC`);
      rows = r.rows as any[];
    } else if (req.query.doctorId) {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.doctor_id = ${Number(req.query.doctorId)} ORDER BY a.appointment_date DESC, a.time_slot ASC`);
      rows = r.rows as any[];
    } else {
      const r = await db.execute(sql`${sql.raw(BASE_QUERY)} ORDER BY a.appointment_date DESC, a.time_slot ASC LIMIT ${limit} OFFSET ${offset}`);
      rows = r.rows as any[];
    }

    return res.json({ data: rows, total: Number(count), page });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/appointments", async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason, notes } = req.body;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(appointmentsTable)
      .where(eq(appointmentsTable.appointmentDate, appointmentDate));
    const queueNumber = Number(count) + 1;
    const [appt] = await db.insert(appointmentsTable).values({
      patientId, doctorId, appointmentDate, timeSlot, reason, notes,
      status: "Pending", queueNumber,
    }).returning();
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.id = ${appt.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? appt);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/appointments/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.appointment_date = ${today} ORDER BY a.time_slot ASC`);
    return res.json(r.rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/appointments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Appointment not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/appointments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(appointmentsTable).set(req.body).where(eq(appointmentsTable.id, id));
    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.id = ${id}`);
    if (!(r.rows as any[]).length) return res.status(404).json({ error: "Appointment not found" });
    return res.json((r.rows as any[])[0]);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
