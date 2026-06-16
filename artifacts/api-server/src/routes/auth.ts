import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

// ── Google OAuth helpers ────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;

function getGoogleRedirectUri(req: import("express").Request): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? process.env.REPLIT_DEV_DOMAIN;
  const proto = req.headers["x-forwarded-proto"] ?? (process.env.NODE_ENV === "production" ? "https" : "https");
  return `${proto}://${host}/api/auth/google/callback`;
}

function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeGoogleCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed");
  return res.json() as Promise<{ access_token: string }>;
}

async function getGoogleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google profile");
  return res.json() as Promise<{ sub: string; email: string; name: string; picture?: string }>;
}

function buildUserPayload(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    bio: user.bio,
    bloodType: user.bloodType,
    allergies: user.allergies,
    emergencyContactName: user.emergencyContactName,
    emergencyContactPhone: user.emergencyContactPhone,
    profileComplete: user.profileComplete,
  };
}

// ── Google OAuth: initiate ──────────────────────────────────────────────────

router.get("/auth/google", (req, res) => {
  const mode = (req.query.mode as string) || "login";
  const redirectUri = getGoogleRedirectUri(req);
  const state = jwt.sign({ mode }, JWT_SECRET, { expiresIn: "10m" });
  return res.redirect(buildGoogleAuthUrl(redirectUri, state));
});

// ── Google OAuth: callback ──────────────────────────────────────────────────

router.get("/auth/google/callback", async (req, res) => {
  const frontendBase = process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL ?? "")
    : "";

  try {
    const { code, state, error: oauthError } = req.query as Record<string, string>;

    if (oauthError || !code || !state) {
      return res.redirect(`${frontendBase}/auth/callback?error=oauth-failed`);
    }

    // Verify state JWT
    let statePayload: { mode: string };
    try {
      statePayload = jwt.verify(state, JWT_SECRET) as { mode: string };
    } catch {
      return res.redirect(`${frontendBase}/auth/callback?error=oauth-failed`);
    }

    const redirectUri = getGoogleRedirectUri(req);
    const { access_token } = await exchangeGoogleCode(code, redirectUri);
    const profile = await getGoogleProfile(access_token);

    const normalizedEmail = profile.email.toLowerCase().trim();

    if (statePayload.mode === "reset") {
      // Password reset via Google: find account by email, issue short-lived reset token
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail))
        .limit(1);

      if (!user) return res.redirect(`${frontendBase}/auth/callback?error=no-account`);
      if (!user.isActive) return res.redirect(`${frontendBase}/auth/callback?error=account-inactive`);

      const resetToken = jwt.sign(
        { sub: user.id, purpose: "password-reset" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
      return res.redirect(`${frontendBase}/reset-password?token=${resetToken}`);
    }

    // Login/signup mode: find by googleId first, then by email, else create
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, profile.sub))
      .limit(1);

    if (!user) {
      // Try linking by email
      const [byEmail] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail))
        .limit(1);

      if (byEmail) {
        // Link existing account to Google
        const [updated] = await db
          .update(usersTable)
          .set({ googleId: profile.sub, avatarUrl: byEmail.avatarUrl ?? profile.picture })
          .where(eq(usersTable.id, byEmail.id))
          .returning();
        user = updated;
      } else {
        // Create new patient account
        const [created] = await db
          .insert(usersTable)
          .values({
            email: normalizedEmail,
            passwordHash: null,
            googleId: profile.sub,
            fullName: profile.name,
            avatarUrl: profile.picture,
            role: "Patient",
            isActive: true,
          })
          .returning();
        user = created;
      }
    }

    if (!user.isActive) {
      return res.redirect(`${frontendBase}/auth/callback?error=account-inactive`);
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const userJson = encodeURIComponent(JSON.stringify(buildUserPayload(user)));
    return res.redirect(`${frontendBase}/auth/callback?token=${token}&user=${userJson}`);
  } catch (err) {
    req.log.error(err);
    return res.redirect(`${frontendBase}/auth/callback?error=oauth-failed`);
  }
});

// ── Password reset (token-based) ────────────────────────────────────────────

router.post("/auth/forgot-password", async (req, res) => {
  // Stub: encourage Google-based reset (no email service configured)
  return res.json({ message: "If an account exists, a reset link will be sent." });
});

router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });

    let payload: { sub: number; purpose: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { sub: number; purpose: string };
    } catch {
      return res.status(400).json({ error: "Reset link has expired or is invalid. Please request a new one." });
    }

    if (payload.purpose !== "password-reset") {
      return res.status(400).json({ error: "Invalid reset token." });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters with one uppercase letter and one number." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, payload.sub));

    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Email/password login ────────────────────────────────────────────────────

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Your account has been deactivated. Please contact support." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "This account uses Google Sign-in. Please click \"Continue with Google\" to sign in." });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        bio: user.bio,
        bloodType: user.bloodType,
        allergies: user.allergies,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        profileComplete: user.profileComplete,
      },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Full name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must include at least one uppercase letter" });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must include at least one number" });
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

    const [user] = await db
      .insert(usersTable)
      .values({
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        role: "Patient",
        isActive: true,
      })
      .returning();

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        profileComplete: user.profileComplete,
      },
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.jwtUser!.sub))
      .limit(1);

    if (!user) return res.status(401).json({ error: "User not found" });

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

export default router;
