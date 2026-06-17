---
name: HanapCare security overhaul
description: Security middleware setup and RBAC guard patterns applied across the API server
---

## What was done

- `helmet` + `express-rate-limit` installed in `@workspace/api-server`
- `app.ts` rewritten: helmet (CSP/COEP disabled for SPA), CORS via `ALLOWED_ORIGINS` env var, auth rate limiter (20 req/15min on `/api/auth/*`), general limiter (300 req/min on `/api/*`), 2mb body limit
- All route files now import and use `requireAuth` + `requireRole(...)` from `../middleware/auth`
- Audit logs (`auditLogsTable`) inserted on all write operations (CREATE/UPDATE/DELETE/DISPENSE/etc.)

## Route guards applied

- `patients.ts` — GET all/by-id: requireAuth; POST/PATCH: requireRole(staff roles); DELETE: requireRole(Admin)
- `billing.ts` — all routes: requireAuth; write routes: requireRole(Admin/Cashier/Doctor/Nurse/Receptionist)
- `doctors.ts` — all requireAuth; write: requireRole(Admin/HR Manager)
- `pharmacy.ts` — all requireAuth; write: requireRole(Admin/Pharmacist)
- `lab.ts` — all requireAuth; write: requireRole(Admin/Doctor/Nurse or Lab Staff)
- `staff.ts` — all requireAuth; write: requireRole(Admin/HR Manager)
- `wards.ts` / `beds.ts` — all requireAuth; write: requireRole(Admin/Nurse/Receptionist)
- `consultations.ts` — all requireAuth; write: requireRole(Admin/Doctor/Nurse)
- `appointments.ts` — all requireAuth; write: requireRole(Admin/Doctor/Nurse/Receptionist)
- `dashboard.ts` — all requireAuth (no role restriction — all staff can see)
- `hr.ts` — write routes: requireRole(Admin/HR Manager)

## CORS in production

Set `ALLOWED_ORIGINS` env var on Render to your frontend domain (comma-separated if multiple).

**Why:** Locks API to known origins in production while remaining permissive in development.

**How to apply:** Any new route file must import `requireAuth` and call it as the first middleware. Role-restricted mutations must add `requireRole(...)` second.
