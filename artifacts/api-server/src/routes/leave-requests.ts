import { Router } from "express";
import { db } from "@workspace/db";
import { leaveRequestsTable, staffTable, usersTable } from "@workspace/db";
import { eq, desc, and, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

const HR_ROLES = ["HR Manager", "Admin"];

router.get("/leave-requests", requireAuth, async (req, res) => {
  try {
    const caller = req.jwtUser!;
    const isHR = HR_ROLES.includes(caller.role);

    let rows;

    if (isHR) {
      rows = await db
        .select({
          id: leaveRequestsTable.id,
          staffId: leaveRequestsTable.staffId,
          leaveType: leaveRequestsTable.leaveType,
          fromDate: leaveRequestsTable.fromDate,
          toDate: leaveRequestsTable.toDate,
          days: leaveRequestsTable.days,
          reason: leaveRequestsTable.reason,
          status: leaveRequestsTable.status,
          reviewedAt: leaveRequestsTable.reviewedAt,
          reviewNotes: leaveRequestsTable.reviewNotes,
          createdAt: leaveRequestsTable.createdAt,
          staffFirstName: staffTable.firstName,
          staffLastName: staffTable.lastName,
          staffRole: staffTable.role,
          staffEmail: staffTable.email,
        })
        .from(leaveRequestsTable)
        .innerJoin(staffTable, eq(leaveRequestsTable.staffId, staffTable.id))
        .orderBy(desc(leaveRequestsTable.createdAt));
    } else {
      const [myStaff] = await db
        .select({ id: staffTable.id })
        .from(staffTable)
        .where(eq(staffTable.email, caller.email))
        .limit(1);

      if (!myStaff) {
        return res.json([]);
      }

      rows = await db
        .select({
          id: leaveRequestsTable.id,
          staffId: leaveRequestsTable.staffId,
          leaveType: leaveRequestsTable.leaveType,
          fromDate: leaveRequestsTable.fromDate,
          toDate: leaveRequestsTable.toDate,
          days: leaveRequestsTable.days,
          reason: leaveRequestsTable.reason,
          status: leaveRequestsTable.status,
          reviewedAt: leaveRequestsTable.reviewedAt,
          reviewNotes: leaveRequestsTable.reviewNotes,
          createdAt: leaveRequestsTable.createdAt,
          staffFirstName: staffTable.firstName,
          staffLastName: staffTable.lastName,
          staffRole: staffTable.role,
          staffEmail: staffTable.email,
        })
        .from(leaveRequestsTable)
        .innerJoin(staffTable, eq(leaveRequestsTable.staffId, staffTable.id))
        .where(eq(leaveRequestsTable.staffId, myStaff.id))
        .orderBy(desc(leaveRequestsTable.createdAt));
    }

    return res.json(rows);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leave-requests", requireAuth, async (req, res) => {
  try {
    const caller = req.jwtUser!;
    const { leaveType, fromDate, toDate, days, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !days) {
      return res.status(400).json({ error: "leaveType, fromDate, toDate, and days are required" });
    }

    const [myStaff] = await db
      .select({ id: staffTable.id })
      .from(staffTable)
      .where(eq(staffTable.email, caller.email))
      .limit(1);

    if (!myStaff) {
      return res.status(400).json({ error: "No staff record found for this account" });
    }

    const [created] = await db
      .insert(leaveRequestsTable)
      .values({
        staffId: myStaff.id,
        leaveType,
        fromDate,
        toDate,
        days: Number(days),
        reason: reason || null,
        status: "Pending",
      })
      .returning();

    return res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leave-requests/:id", requireAuth, async (req, res) => {
  try {
    const caller = req.jwtUser!;
    if (!HR_ROLES.includes(caller.role)) {
      return res.status(403).json({ error: "Forbidden — HR Manager or Admin only" });
    }

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { status, reviewNotes } = req.body;

    if (!status || !["Approved", "Denied"].includes(status)) {
      return res.status(400).json({ error: "status must be Approved or Denied" });
    }

    const [updated] = await db
      .update(leaveRequestsTable)
      .set({
        status,
        reviewNotes: reviewNotes || null,
        reviewedBy: caller.sub,
        reviewedAt: new Date(),
      })
      .where(eq(leaveRequestsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Leave request not found" });

    return res.json(updated);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/leave-requests/:id", requireAuth, async (req, res) => {
  try {
    const caller = req.jwtUser!;
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [existing] = await db
      .select({ staffId: leaveRequestsTable.staffId, status: leaveRequestsTable.status })
      .from(leaveRequestsTable)
      .where(eq(leaveRequestsTable.id, id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });

    const [myStaff] = await db
      .select({ id: staffTable.id })
      .from(staffTable)
      .where(eq(staffTable.email, caller.email))
      .limit(1);

    const isOwner = myStaff?.id === existing.staffId;
    const isHR = HR_ROLES.includes(caller.role);

    if (!isOwner && !isHR) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (existing.status !== "Pending") {
      return res.status(400).json({ error: "Can only cancel pending requests" });
    }

    await db.delete(leaveRequestsTable).where(eq(leaveRequestsTable.id, id));
    return res.status(204).end();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
