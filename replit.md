# HanapCare

Hospital Management System for Philippine healthcare facilities — manages patients, appointments, billing, pharmacy, laboratory, wards, and staff.

---

## ⚠️ AGENT MIGRATION RULES — READ THIS FIRST, EVERY TIME

This project is regularly migrated between Replit accounts. Every agent session — on any Replit account — must follow these rules without exception:

### Database
- **Always use Neon PostgreSQL.** Never use Replit's built-in database.
- Replit auto-injects its own `DATABASE_URL` secret. This must always be overridden by `NEON_DATABASE_URL`.
- `lib/db/src/index.ts` must always read: `process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL`
- `lib/db/drizzle.config.ts` must always read: `process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL`
- All scripts and seed files must also follow the same pattern.

### On every new Replit account / migration
1. Run `pnpm install` — node_modules will be missing.
2. Check if `NEON_DATABASE_URL` secret exists. If not, immediately request it from the user:
   - Ask for their Neon connection string (postgresql://...@...neon.tech/...)
   - Add it as a secret named `NEON_DATABASE_URL`
3. Run `pnpm --filter @workspace/db run push` to sync schema to Neon.
4. Restart both workflows: `API Server` and `Start application`.
5. Do NOT seed or create tables in Replit's database. All data lives in Neon.

### Verification
- `GET /api/healthz` must return `{"status":"ok","dbConfigured":true}`
- Neon DB currently has 22 users including admin@hanapcare.ph, doctor@hanapcare.ph, etc.

---

## Run & Operate

- `PORT=20780 BASE_PATH=/ pnpm --filter @workspace/hanapcare run dev` — frontend (port 20780)
- `PORT=8080 pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm --filter @workspace/scripts run seed` — seed demo users and departments
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + Wouter + TanStack Query
- **Backend**: Express 5 + TypeScript + Pino logging
- **Auth**: JWT (jsonwebtoken) + bcryptjs — 7-day tokens, RBAC middleware in `artifacts/api-server/src/middleware/auth.ts`
- **DB**: PostgreSQL + Drizzle ORM (19 tables)
- **Validation**: Zod v4 + drizzle-zod
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Monorepo**: pnpm workspaces

## Where things live

- DB schema: `lib/db/src/schema/` (19 table files + index)
- API contract: `lib/api-spec/openapi.yaml`
- Generated client: `lib/api-client-react/src/generated/`
- JWT utilities: `artifacts/api-server/src/lib/jwt.ts`
- Auth middleware: `artifacts/api-server/src/middleware/auth.ts`
- Frontend auth context: `artifacts/hanapcare/src/lib/auth.tsx`
- Seed script: `scripts/src/seed.ts`

## Demo accounts (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hanapcare.ph | Admin@1234 |
| Doctor | doctor@hanapcare.ph | Doctor@1234 |
| Nurse | nurse@hanapcare.ph | Nurse@1234 |
| Receptionist | receptionist@hanapcare.ph | Recept@1234 |
| Pharmacist | pharmacist@hanapcare.ph | Pharma@1234 |
| Lab Staff | lab@hanapcare.ph | Lab@12345 |
| Cashier | cashier@hanapcare.ph | Cash@1234 |
| Support | support@hanapcare.ph | Support@1234 |
| HR | hr@hanapcare.ph | Hr@12345 |

## Deployment target

- **Frontend**: Render or Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL (always — never Replit's built-in DB)
- **Auth**: JWT + RBAC
- **CI/CD**: GitHub auto-deploy

### Render environment variables (backend)

```
DATABASE_URL=<neon-connection-string>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
PORT=8080
```

### Neon setup steps

1. Create project at neon.tech
2. Copy connection string → set as `NEON_DATABASE_URL` secret in Replit
3. Run `pnpm --filter @workspace/db run push` to push schema to Neon
4. Run `pnpm --filter @workspace/scripts run seed` to seed demo users

## Architecture decisions

- Proxy routes `/api` → port 8080 (API server), `/` → port 20780 (frontend) via `.replit-artifact/artifact.toml`
- JWT tokens stored in localStorage; 7-day expiry
- `requireAuth` middleware reads `Authorization: Bearer <token>` header
- All roles defined in `usersTable.role` column — no separate roles table
- Seed script uses `onConflictDoNothing()` so re-runs are safe

## Gotchas

- Frontend vite config requires both `PORT` and `BASE_PATH` env vars at startup
- API server must be rebuilt (`pnpm run build`) before `pnpm run start` in production
- Always run `pnpm --filter @workspace/db run push` after schema changes before seeding
- Replit injects its own `DATABASE_URL` — always set `NEON_DATABASE_URL` to override it
- `NEON_DATABASE_URL` takes priority over `DATABASE_URL` in all DB connection code

## User preferences
