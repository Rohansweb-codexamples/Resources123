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
- **Hash routing.** `src/lib/router.js` is a tiny dependency-free hash router
  (`#/`, `#/resource/<id>`, `#/add`, `#/edit/<id>`). Hash URLs need no server
  rewrite rules, which is why they are used for GitHub Pages.
- **Login is client-side.** Credentials live in `src/lib/auth.js` and are compiled
  into the bundle. It is a UI gate, not security. The UI says “Login” (never
  “admin”) and never displays the email address.
- **Resources are links.** Seed data: `src/data/resources.json`. Logged-in edits
  persist to `localStorage` (`leaf-library:resources:v1`) — per browser only. To
  make a resource permanent for everyone, edit the JSON and commit.
- **No download from the home page.** Home cards are anchors to the resource page
  and never link the file directly.
- **PDFs open in-page.** `src/lib/embed.js` decides; PDF resources are shown in an
  `<iframe>` on the resource page (browser PDF viewer) so a click opens rather
  than downloads. Other types show the preview picture. A few sample URLs send
  `Content-Disposition: attachment` or `frame-ancestors`, which would force a
  download / block framing — check headers before adding seeds.
- **Preview pictures** may be a URL or a device file read into a data URL (stored
  in `localStorage`; keep such images small).
- **Host allowlist.** `vite.config.js` extends `server.allowedHosts` with the
  sandbox domain only when `BASE44_PREVIEW_MODE === "1"`. Don't hardcode any
  `BASE44_*` host value.

## How to verify

- `curl -sI http://localhost:3000/` returns 200 and the page title appears in the
  served HTML (dev server serves unhashed `/src/main.jsx`, confirming live source).
- `npm run build` must succeed (this is what GitHub Pages ships).
- In the preview: cards render and navigate to `#/resource/<id>`; search/filter
  work; a PDF resource shows the in-page viewer; logging in reveals Add/Edit and
  Delete; the Add page lives at `#/add`.
