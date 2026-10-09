# Leaf Library — Resource Hub

A leafy-themed hub for gathering **PDFs, documents and presentations** behind one
clean, searchable grid. Built as a **static site** (React + Vite) so it can be
hosted on **GitHub Pages** — resources are stored as **links**, not files on a
server, so there is nothing to upload or host yourself.

## What it does

- **Public browsing** — anyone can search and filter resources. No account needed.
- **Optional admin login** — sign in to add, edit and delete resources.
- **Preview pictures** — each resource can carry a preview image, set by URL or by
  choosing a picture from your device (stored in the browser, no upload).
- **Link-based resources** — point each entry at a PDF, document or presentation
  wherever it lives (GitHub Pages, Drive, Dropbox, any public URL).

## Admin login

Set in [`src/lib/auth.js`](src/lib/auth.js):

```
email:    rohanwest@rohansweb.co.uk
password: Ewanandlam100
```

> ⚠️ This is a **static site**, so the login is a client-side gate only — the
> credentials ship inside the bundle and are visible in the page source. It
> controls who sees the admin controls; it is **not** a security boundary. Use a
> backend if the resources need real protection.

## Where resources live

- Sample entries: [`src/data/resources.json`](src/data/resources.json).
- When an admin adds or edits a resource in the UI, the change is saved to the
  browser's `localStorage` (key `leaf-library:resources:v1`). This keeps the app
  fully static and GitHub-Pages-friendly.
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
