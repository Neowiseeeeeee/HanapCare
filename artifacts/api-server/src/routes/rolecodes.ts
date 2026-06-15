import { Router } from "express";
import { db } from "@workspace/db";
import { roleCodesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

function generateCode(role: string): string {
  const prefix = role.toUpperCase().slice(0, 3).replace(/\s/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}

router.post("/role-codes", requireAuth, async (req, res) => {
  try {
    if (req.jwtUser!.role !== "Admin") {
      return res.status(403).json({ error: "Only admins can create role codes" });
    }
    const { assignedRole, description, expiresAt } = req.body;
    if (!assignedRole) return res.status(400).json({ error: "assignedRole is required" });

    const code = generateCode(assignedRole);
    const [roleCode] = await db
      .insert(roleCodesTable)
      .values({
        code,
        assignedRole,
        description: description || null,
        createdById: req.jwtUser!.sub,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return res.status(201).json(roleCode);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/role-codes", requireAuth, async (req, res) => {
  try {
    if (req.jwtUser!.role !== "Admin") return res.status(403).json({ error: "Forbidden" });
    const codes = await db.select().from(roleCodesTable).orderBy(roleCodesTable.createdAt);
    return res.json(codes);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/role-codes/redeem", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const [roleCode] = await db
      .select()
      .from(roleCodesTable)
      .where(and(eq(roleCodesTable.code, code.trim().toUpperCase()), eq(roleCodesTable.isActive, true)))
      .limit(1);

    if (!roleCode) return res.status(404).json({ error: "Invalid or expired code" });
    if (roleCode.usedById) return res.status(409).json({ error: "This code has already been used" });
    if (roleCode.expiresAt && new Date() > roleCode.expiresAt) {
      return res.status(410).json({ error: "This code has expired" });
    }

    await db
      .update(roleCodesTable)
      .set({ usedById: req.jwtUser!.sub, usedAt: new Date(), isActive: false })
      .where(eq(roleCodesTable.id, roleCode.id));

    const [user] = await db
      .update(usersTable)
      .set({ role: roleCode.assignedRole })
      .where(eq(usersTable.id, req.jwtUser!.sub))
      .returning();

    const { passwordHash: _, ...safe } = user;
    return res.json({ success: true, newRole: roleCode.assignedRole, user: safe });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/role-codes/:id", requireAuth, async (req, res) => {
  try {
    if (req.jwtUser!.role !== "Admin") return res.status(403).json({ error: "Forbidden" });
    await db.update(roleCodesTable).set({ isActive: false }).where(eq(roleCodesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
