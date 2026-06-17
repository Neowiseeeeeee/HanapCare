---
name: HanapCare nursing notes
description: nursing_notes DB table and API route added in this session
---

## Schema

File: `lib/db/src/schema/nursing-notes.ts`
Table: `nursing_notes`
Exported from: `lib/db/src/schema/index.ts`

Columns: id, patient_id (FK→patients), author_id, author_name, note_type, content, shift, is_handover (integer 0/1), created_at

## API route

File: `artifacts/api-server/src/routes/nursing.ts`
Registered in: `artifacts/api-server/src/routes/index.ts`

Endpoints:
- GET /api/nursing-notes — list (optionally ?patientId=N)
- POST /api/nursing-notes — create (requireRole Admin/Doctor/Nurse)
- GET /api/nursing-notes/:id — get one
- PATCH /api/nursing-notes/:id — update

## Frontend

File: `artifacts/hanapcare/src/pages/nursing-notes/index.tsx`
- Fetches real notes from /api/nursing-notes
- "Add Note" modal with patient select, note type, shift, handover checkbox
- Filter tabs: All / Today / This Week / This Month
- Stats: notes today, unique patients, handover count

**Why:** Previous page had no backend integration — it was a static shell.

**How to apply:** After any schema addition, run `pnpm --filter @workspace/db run push` to push to Neon.
