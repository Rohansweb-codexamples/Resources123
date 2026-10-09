# Leaf Library — Resource Hub

A leafy-themed hub for gathering **PDFs, documents and presentations** behind one
clean, searchable grid. Built as a **static site** (React + Vite) so it can be
hosted on **GitHub Pages** — resources are stored as **links**, not files on a
server, so there is nothing to upload or host yourself.

## What it does

- **Public browsing** — anyone can search and filter resources. No account needed.
- **Blocks, not downloads** — the home page shows resource blocks; clicking one
  opens that resource's own page. The file itself is never linked from the home
  page, so you can't download straight from the grid.
- **PDFs open, don't download** — a PDF resource opens inside its page in the
  browser's own viewer. Other file types show the preview picture with an "open in
  a new tab" link.
- **Optional login** — log in to add and edit resources.
- **Add resource page** — a dedicated page (`#/add`) for adding a resource, with a
  title, description, type, the link to the file, and a **preview picture** (paste
  an image URL or pick a picture from your device).

## Pages

| Route              | What it is                                  |
| ------------------ | ------------------------------------------- |
| `#/`               | Home — the searchable grid of blocks        |
| `#/resource/<id>`  | A single resource, with the in-page viewer  |
| `#/add`            | Add a resource (requires login)             |
| `#/edit/<id>`      | Edit a resource (requires login)            |

Routing is hash-based, so it works on GitHub Pages with no server config.

## Login

Set in [`src/lib/auth.js`](src/lib/auth.js) — only this account can add or edit:

```
email:    rohanwest@rohansweb.co.uk
password: Ewanandlam100
```

> ⚠️ This is a **static site**, so the login is a client-side gate only — the
> credentials ship inside the bundle and are visible in the page source. It
> controls who sees the add/edit controls; it is **not** a security boundary. Use
> a backend if the resources need real protection.

## Where resources live

- Sample entries: [`src/data/resources.json`](src/data/resources.json).
- When you add or edit a resource in the UI, the change is saved to the browser's
  `localStorage` (key `leaf-library:resources:v1`). This keeps the app fully static
  and GitHub-Pages-friendly.
- Because it is browser storage, added resources are **per browser/device**. To
  publish a resource for everyone, add it to `src/data/resources.json` and commit
  (the GitHub Pages workflow redeploys automatically).

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
```

## Run in the sandbox (Docker)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Serves the Vite dev server on host port 3000. Sandbox-only host-allowlist
overrides are gated on `BASE44_PREVIEW_MODE === "1"` in `vite.config.js`; with the
variable unset the dev server behaves normally (localhost only).

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   builds the site on every push to `main` and publishes it.

`vite.config.js` uses a relative base (`base: './'`), so the site works from a
project sub-path such as `https://<user>.github.io/Resources123/`.
