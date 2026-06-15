import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user.length || password !== "password123") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const u = user[0];
    return res.json({
      token: `mock-token-${u.id}`,
      user: { id: u.id, email: u.email, fullName: u.fullName, role: u.role, avatarUrl: u.avatarUrl, isActive: u.isActive },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req, res) => {
  const user = await db.select().from(usersTable).limit(1);
  if (!user.length) return res.status(401).json({ error: "Not authenticated" });
  const u = user[0];
  return res.json({ id: u.id, email: u.email, fullName: u.fullName, role: u.role, avatarUrl: u.avatarUrl, isActive: u.isActive });
});

router.post("/auth/logout", async (_req, res) => {
  return res.json({ success: true });
});

export default router;
