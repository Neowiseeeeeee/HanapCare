import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, patientsTable, usersTable, doctorsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const BASE_QUERY = `
  SELECT 
    a.id, a.patient_id as "patientId",
    concat(p.first_name, ' ', p.last_name) as "patientName",
    a.doctor_id as "doctorId",
    concat(d.first_name, ' ', d.last_name) as "doctorName",
    dept.name as "departmentName",
    d.specialization as "doctorSpecialization",
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

// ── Patient self-booking ────────────────────────────────────────────────────
router.post("/appointments/book", requireAuth, async (req, res) => {
  try {
    const userId = req.jwtUser!.sub;
    const { doctorId, appointmentDate, timeSlot, reason, notes } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({ error: "doctorId, appointmentDate, timeSlot, and reason are required" });
    }

    // Validate doctor exists
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, Number(doctorId)));
    if (!doctor) return res.status(400).json({ error: "Doctor not found" });

    // Check for slot conflict
    const conflict = await db.select({ id: appointmentsTable.id })
      .from(appointmentsTable)
      .where(and(
        eq(appointmentsTable.doctorId, Number(doctorId)),
        eq(appointmentsTable.appointmentDate, appointmentDate),
        eq(appointmentsTable.timeSlot, timeSlot),
      ));
    if (conflict.length > 0) {
      return res.status(409).json({ error: "That time slot is already taken. Please choose another." });
    }

    // Find or create patient record linked to this user
    let [patient] = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId));

    if (!patient) {
      // Try matching by email
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!user) return res.status(401).json({ error: "User not found" });

      if (user.email) {
        const [byEmail] = await db.select().from(patientsTable).where(eq(patientsTable.email, user.email));
        if (byEmail) {
          // Link existing patient record to this user account
          await db.update(patientsTable).set({ userId }).where(eq(patientsTable.id, byEmail.id));
          patient = { ...byEmail, userId };
        }
      }

      if (!patient) {
        // Auto-create patient record from user profile
        const [user2] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        const u = user2 ?? user;

        const names = u.fullName.trim().split(/\s+/);
        const firstName = names[0] ?? "Unknown";
        const lastName = names.slice(1).join(" ") || "Unknown";

        const [{ count: patCount }] = await db.select({ count: sql<number>`count(*)` }).from(patientsTable);
        const patientCode = `HC-${String(Number(patCount) + 1).padStart(5, "0")}`;

        [patient] = await db.insert(patientsTable).values({
          userId,
          patientCode,
          firstName,
          lastName,
          dateOfBirth: u.dateOfBirth ?? "N/A",
          gender: u.gender ?? "Not specified",
          contactNumber: u.phone ?? "N/A",
          email: u.email,
          address: u.address ?? "N/A",
          emergencyContactName: u.emergencyContactName ?? undefined,
          emergencyContactNumber: u.emergencyContactPhone ?? undefined,
          bloodType: u.bloodType ?? undefined,
          allergies: u.allergies ?? undefined,
        }).returning();
      }
    }

    // Queue number = appointments for that date + 1
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(appointmentsTable)
      .where(eq(appointmentsTable.appointmentDate, appointmentDate));
    const queueNumber = Number(count) + 1;

    const [appt] = await db.insert(appointmentsTable).values({
      patientId: patient.id,
      doctorId: Number(doctorId),
      appointmentDate,
      timeSlot,
      reason: reason.trim(),
      notes: notes?.trim() || null,
      status: "Pending",
      queueNumber,
    }).returning();

    const r = await db.execute(sql`${sql.raw(BASE_QUERY)} WHERE a.id = ${appt.id}`);
    return res.status(201).json((r.rows as any[])[0] ?? appt);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Patient: my appointments ────────────────────────────────────────────────
router.get("/appointments/my", requireAuth, async (req, res) => {
  try {
    const userId = req.jwtUser!.sub;
    const filter = (req.query.filter as string) ?? "upcoming";

    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId));
    if (!patient) return res.json([]);

    const today = new Date().toISOString().split("T")[0];

    let whereClause: string;
    if (filter === "past") {
      whereClause = `WHERE a.patient_id = ${patient.id} AND a.appointment_date < '${today}' AND a.status NOT IN ('Cancelled')`;
    } else if (filter === "cancelled") {
      whereClause = `WHERE a.patient_id = ${patient.id} AND a.status = 'Cancelled'`;
    } else {
      // upcoming
      whereClause = `WHERE a.patient_id = ${patient.id} AND a.appointment_date >= '${today}' AND a.status NOT IN ('Cancelled', 'Completed')`;
    }

    const r = await db.execute(sql`${sql.raw(BASE_QUERY + whereClause + " ORDER BY a.appointment_date ASC, a.time_slot ASC")}`);
    return res.json(r.rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Public: taken slots for a doctor on a date ──────────────────────────────
router.get("/appointments/slots", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ error: "doctorId and date are required" });

    const rows = await db.select({ timeSlot: appointmentsTable.timeSlot })
      .from(appointmentsTable)
      .where(and(
        eq(appointmentsTable.doctorId, Number(doctorId)),
        eq(appointmentsTable.appointmentDate, date as string),
        sql`${appointmentsTable.status} NOT IN ('Cancelled')`,
      ));

    return res.json(rows.map((r) => r.timeSlot));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Staff: all appointments (paginated, filterable) ─────────────────────────
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
