# AGENTS.md

Notes for future agents working in this repo.

## What this app is

A **static** React + Vite site (no backend, no database). It is intended for
GitHub Pages, so anything server-side (real uploads, real auth, cross-device
persistence) is intentionally out of scope.

## Non-obvious facts

- **Single service.** `docker-compose.base44.yml` runs only the Vite dev server
  from the cloned source on host port 3000. There is no API, DB or worker.
- **No secrets.** `.base44/environment.json` has an empty `secrets` list; the app
  needs no external credentials to boot.
- **Admin login is client-side.** Credentials live in `src/lib/auth.js` and are
  compiled into the bundle. It is a UI gate, not security.
- **Resources are links.** Seed data: `src/data/resources.json`. Admin edits
  persist to `localStorage` (`leaf-library:resources:v1`) — per browser only. To
  make a resource permanent for everyone, edit the JSON and commit.
- **Preview pictures** may be a URL or a device file read into a data URL (stored
  in `localStorage`; keep such images small).
- **Host allowlist.** `vite.config.js` extends `server.allowedHosts` with the
  sandbox domain only when `BASE44_PREVIEW_MODE === "1"`. Don't hardcode any
  `BASE44_*` host value.

## How to verify

- `curl -sI http://localhost:3000/` returns 200 and the page title appears in the
  served HTML (dev server serves unhashed `/src/main.jsx`, confirming live source).
- `npm run build` must succeed (this is what GitHub Pages ships).
- In the preview: cards render, search/filter work, admin login (with the
  credentials above) reveals the add/edit/delete controls.
