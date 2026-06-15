import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/users/profile", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.jwtUser!.sub)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/profile", requireAuth, async (req, res) => {
  try {
    const {
      fullName, phone, dateOfBirth, gender, address, bio,
      bloodType, allergies, emergencyContactName, emergencyContactPhone,
      avatarUrl, profileComplete,
    } = req.body;

    const updateData: Record<string, unknown> = {};
    if (fullName !== undefined) updateData.fullName = String(fullName).trim();
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (bloodType !== undefined) updateData.bloodType = bloodType;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) updateData.emergencyContactPhone = emergencyContactPhone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (profileComplete !== undefined) updateData.profileComplete = Boolean(profileComplete);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    const [user] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, req.jwtUser!.sub))
      .returning();

    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
