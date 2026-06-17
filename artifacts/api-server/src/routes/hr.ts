import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, staffTable, leaveRequestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const WORKER_ROLES = [
  "Admin", "Doctor", "Nurse", "Receptionist",
  "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager",
];

router.post("/hr/onboard", requireAuth, requireRole("Admin", "HR Manager"), async (req, res) => {
  try {
    const {
      fullName, email, password, role, firstName, lastName,
      contactNumber, departmentId, employeeId, shift, joinedAt,
    } = req.body;

    if (!fullName || !email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: "fullName, email, password, role, firstName and lastName are required" });
    }

    if (!WORKER_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${WORKER_ROLES.join(", ")}` });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        passwordHash,
        fullName,
        role,
        isActive: true,
        phone: contactNumber ?? null,
        profileComplete: true,
      })
      .returning();

    const [newStaff] = await db
      .insert(staffTable)
      .values({
        firstName,
        lastName,
        role,
        email: normalizedEmail,
        contactNumber: contactNumber ?? null,
        departmentId: departmentId ? Number(departmentId) : null,
        employeeId: employeeId ?? null,
        shift: shift ?? null,
        joinedAt: joinedAt ?? null,
        isActive: true,
      })
      .returning();

    return res.status(201).json({
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role },
      staff: newStaff,
    });
  } catch (err: any) {
    req.log.error(err);
    if (err?.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// HR Dashboard stats — real data
router.get("/hr/stats", requireAuth, requireRole("Admin", "HR Manager"), async (req, res) => {
  try {
    const [totalStaff] = await db.select({ count: sql<number>`count(*)` }).from(staffTable)
      .where(eq(staffTable.isActive, true));

    const [pendingLeave] = await db.select({ count: sql<number>`count(*)` }).from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.status, "Pending"));

    const [approvedLeaveToday] = await db.select({ count: sql<number>`count(*)` }).from(leaveRequestsTable)
      .where(sql`status = 'Approved' AND from_date <= CURRENT_DATE AND to_date >= CURRENT_DATE`);

    const recentLeave = await db
      .select({
        id: leaveRequestsTable.id,
        staffId: leaveRequestsTable.staffId,
        leaveType: leaveRequestsTable.leaveType,
        fromDate: leaveRequestsTable.fromDate,
        toDate: leaveRequestsTable.toDate,
        days: leaveRequestsTable.days,
        reason: leaveRequestsTable.reason,
        status: leaveRequestsTable.status,
        createdAt: leaveRequestsTable.createdAt,
        staffFirstName: staffTable.firstName,
        staffLastName: staffTable.lastName,
        staffRole: staffTable.role,
      })
      .from(leaveRequestsTable)
      .innerJoin(staffTable, eq(leaveRequestsTable.staffId, staffTable.id))
      .orderBy(sql`${leaveRequestsTable.createdAt} DESC`)
      .limit(5);

    const staffList = await db
      .select({
        id: staffTable.id,
        firstName: staffTable.firstName,
        lastName: staffTable.lastName,
        role: staffTable.role,
        shift: staffTable.shift,
        joinedAt: staffTable.joinedAt,
      })
      .from(staffTable)
      .where(eq(staffTable.isActive, true))
      .orderBy(staffTable.firstName)
      .limit(10);

    return res.json({
      totalStaff: Number(totalStaff.count),
      pendingLeaveRequests: Number(pendingLeave.count),
      staffOnLeaveToday: Number(approvedLeaveToday.count),
      recentLeave,
      staffList,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
