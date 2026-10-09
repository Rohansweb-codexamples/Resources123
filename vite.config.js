import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works from any GitHub Pages sub-path.
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

// The API runs as its own service, so the dev server proxies /api and /uploads to
// it. The browser then only ever talks to one origin (port 3000), which keeps the
// session cookie working. For a non-Docker run point it at localhost:4000.
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:4000'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/uploads': { target: apiTarget, changeOrigin: true },
    },
  },
})
