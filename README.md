# Rohans Web Resources

Leafy-themed resources library with a protected admin page.

## Run locally
Run `npm install` then `npm start`. Open `http://localhost:3000`. The public library is `/`; the private admin page is `/admin.html` and is intentionally not linked in public navigation.

## Admin security
On first visit to `/admin.html`, create a password of at least 12 characters. The server stores a bcrypt hash in `DATA_DIR/admin-auth.json`, never the raw password. Login is rate-limited and uses an HTTP-only session cookie.

## Render deployment
The included `render.yaml` sets up a Node service and persistent disk at `/var/data`. Deploy the repository on Render using this blueprint so uploaded resources and the password hash persist across restarts. Keep `SESSION_SECRET` private. Without a persistent disk, local uploaded files and the initial password setup may be lost on redeploy.

## Uploads
Admin supports common image, PDF, DOCX, PPTX, ZIP, text/CSV, audio and video file extensions up to 25 MB. Uploaded metadata is saved to `DATA_DIR/resources.json` and files to `DATA_DIR/uploads`.

The public banner automatically looks for an image at the repository root through the GitHub contents API; it does not assume a specific filename.
