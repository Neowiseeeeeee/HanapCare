import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, staffTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const WORKER_ROLES = [
  "Admin", "Doctor", "Nurse", "Receptionist",
  "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager",
];

router.post("/hr/onboard", requireAuth, async (req, res) => {
  try {
    const caller = req.jwtUser;
    if (!caller || (caller.role !== "HR Manager" && caller.role !== "Admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      fullName,
      email,
      password,
      role,
      firstName,
      lastName,
      contactNumber,
      departmentId,
      employeeId,
      shift,
      joinedAt,
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

export default router;
