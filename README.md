# Leaf Library — Resource Hub

A leafy-themed hub for **PDFs, documents and presentations**. The frontend is a
static React + Vite site; a small Express API stores the uploaded files and the
user accounts, so everyone who visits sees the same library.

## What it does

- **Public browsing** — anyone can search and filter resources. No account needed.
- **Uploads** — the admin uploads PDFs, documents and presentations. Files are
  stored on the server, not in the browser.
- **Create an account** — anyone can sign up and log in. Accounts are real
  (server-side, password-hashed).
- **Only the admin can change the library** — adding, editing and deleting
  resources is restricted to the admin account. Everyone else can browse.
- **Blocks, not downloads** — the home page shows resource blocks; clicking one
  opens that resource's page. The file is never linked directly from the grid.
- **PDFs open, don't download** — a PDF renders inside its resource page in the
  browser's own viewer. Other types show the preview picture and an open link.
- **Preview picture** — each resource can have an optional preview picture.

## Pages

| Route              | What it is                                  |
| ------------------ | ------------------------------------------- |
| `#/`               | Home — the searchable grid of blocks        |
| `#/resource/<id>`  | A single resource, with the in-page viewer  |
| `#/add`            | Upload a resource (admin only)              |
| `#/edit/<id>`      | Edit a resource (admin only)                |

Routing is hash-based, so a static host needs no server rewrite rules.

## How it is put together

- `src/` — React frontend. Talks to the API through `src/lib/api.js`.
- `server/` — Express API (`server/index.js`):
  - accounts and resources in a JSON file on a volume (`server/storage/data.json`)
  - uploaded files in `server/storage/uploads`
  - sessions via an `httpOnly` cookie (`sid`)
  - passwords hashed with `scrypt`
- In development the Vite dev server proxies `/api` and `/uploads` to the API, so
  the browser sees a single origin and the session cookie just works.

## The admin account

The admin account is defined by `ADMIN_EMAIL` / `ADMIN_PASSWORD` and is applied
on every API boot, so a change to `ADMIN_PASSWORD` takes effect on restart.
`rohanwest@rohansweb.co.uk` is the admin. The password comes from the platform
secrets file; the value in [`.env.base44-defaults`](.env.base44-defaults) is only
a placeholder so the app boots, and it is overridden by anything stored in the
dashboard.

> Only this account can add, edit or delete resources. Accounts that sign up are
> ordinary accounts.

## Run locally

```bash
# API
cd server && npm install && ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm start

# Frontend (separate terminal)
npm install
npm run dev     # http://localhost:3000
```

The dev server proxies to `http://localhost:4000` by default; set
`API_PROXY_TARGET` to point somewhere else.

## Run in the sandbox (Docker)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Runs the API and the Vite dev server (host port 3000). Sandbox-only host-allowlist
overrides are gated on `BASE44_PREVIEW_MODE === "1"` in `vite.config.js`; with the
variable unset the dev server behaves normally (localhost only).

## Deployment

The frontend is static, but **the API is not** — it needs a host with a persistent
disk for `data.json` and the uploaded files. **Vercel's serverless functions have
no persistent filesystem, so this backend cannot run on Vercel as-is.**

- Static host (GitHub Pages, Netlify, Vercel) for the frontend — set
  `VITE_API_BASE` at build time to the API's URL.
- A host with a disk (Render, Railway, Fly.io, a VPS) for the API — set
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` there.

If it must all live on Vercel, the storage has to change first: uploaded files to
Vercel Blob and the accounts/resources to a hosted database. That is a different
storage backend, not a config change.
