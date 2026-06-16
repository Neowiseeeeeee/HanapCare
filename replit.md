# HanapCare

Hospital Management System for Philippine healthcare facilities — manages patients, appointments, billing, pharmacy, laboratory, wards, and staff.

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
- **Database**: Neon PostgreSQL
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
2. Copy connection string → set as `DATABASE_URL` on Render
3. Run `pnpm --filter @workspace/db run push` with the Neon URL to push schema
4. Run `pnpm --filter @workspace/scripts run seed` with the Neon URL to seed users

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
