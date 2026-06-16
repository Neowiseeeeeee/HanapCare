---
name: HanapCare Neon DB setup
description: Rules for always using Neon DB on every migration/Replit account. NEON_DATABASE_URL must always take priority. Never use Replit's built-in DB.
---

## Rule: Always use Neon. Never use Replit's built-in DB.

This project is migrated between Replit accounts frequently. On every new account:

### Step 1 — Install dependencies
```
pnpm install
```

### Step 2 — Request Neon credentials
Check if `NEON_DATABASE_URL` secret exists. If missing, immediately request it:
```javascript
await requestEnvVar({
  requestType: "secret",
  keys: ["NEON_DATABASE_URL"],
  userMessage: "Please paste your Neon connection string (postgresql://...@...neon.tech/...?sslmode=require)"
});
```

### Step 3 — Push schema to Neon
```
pnpm --filter @workspace/db run push
```

### Step 4 — Restart workflows
Restart both `API Server` and `Start application`.

### Step 5 — Verify
`GET /api/healthz` must return `{"status":"ok","dbConfigured":true}`

---

## Code rules (enforce on every migration)

### `lib/db/src/index.ts`
```ts
const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
```
NEON_DATABASE_URL must come FIRST.

### `lib/db/drizzle.config.ts`
Must also use `NEON_DATABASE_URL ?? DATABASE_URL`.

### Any seed/script file
Must use `NEON_DATABASE_URL ?? DATABASE_URL`.

---

## Why

Replit auto-injects its own managed Postgres as `DATABASE_URL`. This is empty and not the real data. The real data lives in Neon (22 users as of June 2026 including admin@hanapcare.ph). If the code reads `DATABASE_URL` first, it silently connects to an empty Replit DB and logins fail.

**How to apply:** Any new DB connection code must always check `NEON_DATABASE_URL` before `DATABASE_URL`. SSL must be enabled conditionally when the URL contains `neon.tech`: `ssl: { rejectUnauthorized: false }`.
