# AGENTS.md

Notes for future agents working in this repo.

## What this app is

A leafy resource hub: a **static React + Vite frontend** plus a **small Express
API** (`server/`) that stores uploaded files and accounts. It is *not* a pure
static site any more — see "Deployment" in the README before promising GitHub
Pages or Vercel hosting.

## Services (docker-compose.base44.yml)

- **api** — `node:22` running `server/index.js` on port 4000. Express + multer
  only; no database. State lives on the `server_storage` volume:
  `storage/data.json` (users, sessions, resources) and `storage/uploads/`.
- **web** — Vite dev server on host port 3000, proxying `/api` and `/uploads` to
  `api:4000` (single origin, so the session cookie works).
- Sandbox-only host-allowlist overrides are gated on
  `BASE44_PREVIEW_MODE === "1"` in `vite.config.js`. Don't hardcode `BASE44_*`.

## Non-obvious facts

- **The admin account is config, not data.** `server/index.js` re-applies
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` on every boot (updating the hash), so editing
  the admin password in-app is not preserved across restarts — change the config.
- **Secret precedence.** `.env.base44-defaults` holds the boot placeholder and is
  listed FIRST in `env_file:`; `/run/base44/app.env` (platform secrets) is listed
  LAST so a dashboard value always wins. `.gitignore` has an explicit
  `!.env.base44-defaults` exception — keep it, or the file stops being committed.
- **Passwords** are hashed with `node:crypto` scrypt (`server/auth.js`); sessions
  are rows in `data.json` referenced by an httpOnly `sid` cookie.
- **Authorization** is enforced server-side in `requireAdmin`. The UI merely hides
  the controls; do not rely on the UI for access control.
- **Uploads** accept PDF/Office/text extensions, max 25 MB (multer). The uploaded
  file is served from `/uploads/<uuid>.<ext>` — same-origin, so PDFs render inline.
- **Seed data** is `server/seed.json`, inserted only when the store has no
  resources yet. Editing it will not change an existing volume.

## How to verify

- `docker compose -f docker-compose.base44.yml ps` — both services healthy;
  `curl -s localhost:3000/api/health` → `{"ok":true}`.
- **Account/upload flow over HTTP** (no browser needed):
  - `POST /api/auth/signup` → non-admin user, sets `sid` cookie.
  - that session `POST /api/resources` → **403** (only the admin may change data).
  - `POST /api/auth/login` with the admin credentials → `isAdmin: true`.
  - admin `POST /api/resources` with `-F file=@some.pdf` → 201, then
    `GET /uploads/<file>` → 200 `application/pdf`, then `DELETE` → 200.
- `npm run build` must still succeed (the frontend). `server/` has no build step.
