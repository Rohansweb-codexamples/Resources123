// Talks to the Leaf Library API. In the sandbox the Vite dev server proxies
// /api and /uploads, so these are same-origin calls and the session cookie just
// works. Set VITE_API_BASE to point at a different origin when the API is hosted
// separately.
const BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, { credentials: 'include', ...options })
  const isJson = (response.headers.get('content-type') || '').includes('application/json')
  const body = isJson ? await response.json() : null
  if (!response.ok) {
    throw new Error((body && body.error) || `Request failed (${response.status})`)
  }
  return body
}

function jsonRequest(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const api = {
  me: () => request('/api/auth/me'),
  login: (email, password) => jsonRequest('/api/auth/login', { email, password }),
  signup: (email, password) => jsonRequest('/api/auth/signup', { email, password }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  listResources: () => request('/api/resources'),
  createResource: (formData) => request('/api/resources', { method: 'POST', body: formData }),
  updateResource: (id, formData) =>
    request(`/api/resources/${encodeURIComponent(id)}`, { method: 'PUT', body: formData }),
  deleteResource: (id) =>
    request(`/api/resources/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
