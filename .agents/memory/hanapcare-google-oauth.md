---
name: HanapCare Google OAuth
description: How Google OAuth is implemented — flow, endpoints, reset password, migration notes
---

## Flow

- `GET /api/auth/google?mode=login|reset` → signs a 10-min state JWT, redirects to Google
- Google redirects to `GET /api/auth/google/callback`
- Callback verifies state JWT, exchanges code, calls Google userinfo endpoint
- **login mode**: find user by `googleId` → fallback find by email and link → else create new Patient
- **reset mode**: find user by email, issue 15-min `{ purpose: "password-reset" }` JWT, redirect to `/reset-password?token=...`
- Frontend `/auth/callback` page reads `?token=&user=` URL params, calls `loginWithToken()`

## Key decisions

- `passwordHash` is nullable — Google-only accounts have `null` passwordHash
- Login route returns 401 "use Google Sign-in" if passwordHash is null
- `googleId` column is unique (NULLs are distinct in PostgreSQL, safe for existing rows)
- `GOOGLE_REDIRECT_URI` env var overrides auto-detected redirect URI (needed for production)
- `loginWithToken(token, user)` added to auth context for Google callback page

## Migration note

- `drizzle-kit push` requires TTY for interactive confirm when adding unique constraint to non-empty table
- **Workaround**: run `executeSql()` directly with raw `ALTER TABLE` statements
- Pattern: `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT; ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL; ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);`

## On migration to new Replit account

- Add new dev domain redirect URI to Google Cloud Console → APIs & Services → Credentials → Edit OAuth client
- Set `GOOGLE_REDIRECT_URI` env var in production to the Render backend URL callback
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets must be re-added each migration
