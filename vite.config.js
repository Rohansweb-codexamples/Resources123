import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works from any GitHub Pages sub-path
// (e.g. https://<user>.github.io/Resources123/).
//
// Sandbox preview: the Vite dev server receives requests whose Host header is
// "<port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN" (the sandbox id rotates), so
// while BASE44_PREVIEW_MODE is exactly "1" we extend the host allowlist with the
// sandbox domain wildcard. Unset / any other value -> original behaviour.
const isPreview = process.env.BASE44_PREVIEW_MODE === '1'

const allowedHosts = ['localhost', '127.0.0.1']
if (isPreview) {
  for (const domain of [
    process.env.BASE44_SANDBOX_HOST_DOMAIN,
    process.env.BASE44_PUBLIC_HOST_SUFFIX,
  ]) {
    if (domain) allowedHosts.push(domain, `.${domain}`)
  }
}

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
})
