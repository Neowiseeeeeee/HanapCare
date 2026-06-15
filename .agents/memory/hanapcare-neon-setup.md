---
name: HanapCare Neon DB setup
description: How DATABASE_URL and NEON_DATABASE_URL are handled in this project, and why seed must target the right DB.
---

Replit manages its own `DATABASE_URL` and blocks `requestEnvVar` for it. To use Neon in parallel:
- Store Neon URL as `NEON_DATABASE_URL` secret instead.
- Both `lib/db/src/index.ts` and `lib/db/drizzle.config.ts` resolve: `NEON_DATABASE_URL ?? DATABASE_URL`.
- SSL must be enabled for Neon connections: `ssl: { rejectUnauthorized: false }` when URL contains `neon.tech`.
- The seed script (`scripts/src/seed.ts`) must also use `NEON_DATABASE_URL ?? DATABASE_URL` — if it only reads `DATABASE_URL`, it seeds the Replit DB instead of Neon, causing login failures.

**Why:** Replit injects its own managed Postgres as DATABASE_URL. Neon is the production target; using a separate key avoids conflicts.

**How to apply:** Any new script or migration that connects to the DB should use `process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL` and apply SSL conditionally on `neon.tech` in the URL.
