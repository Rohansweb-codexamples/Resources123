import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// Small JSON-file store. It lives on a Docker volume (DATA_DIR) so accounts,
// sessions and resource metadata survive restarts. Keeps the app dependency-free
// beyond Express + multer.

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

const state = { users: [], resources: [], sessions: [] }

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    state.users = Array.isArray(parsed.users) ? parsed.users : []
    state.resources = Array.isArray(parsed.resources) ? parsed.resources : []
    state.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : []
  } catch {
    // first boot — start empty
  }
}

function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2))
  fs.renameSync(tmp, DATA_FILE)
}

load()

function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export const store = {
  findUserByEmail(email) {
    const needle = normaliseEmail(email)
    return state.users.find((user) => user.email === needle) || null
  },

  findUserById(id) {
    return state.users.find((user) => user.id === id) || null
  },

  addUser({ email, passwordHash, isAdmin }) {
    const user = {
      id: randomUUID(),
      email: normaliseEmail(email),
      passwordHash,
      isAdmin: Boolean(isAdmin),
      createdAt: new Date().toISOString(),
    }
    state.users.push(user)
    save()
    return user
  },

  // The admin account is defined by the server config on every boot, so the
  // configured password always applies (a dashboard update takes effect after
  // the service restarts).
  upsertAdmin(email, passwordHash) {
    const existing = this.findUserByEmail(email)
    if (existing) {
      existing.passwordHash = passwordHash
      existing.isAdmin = true
      save()
      return existing
    }
    return this.addUser({ email, passwordHash, isAdmin: true })
  },

  addSession(token, userId) {
    state.sessions = state.sessions.filter((session) => session.userId !== userId)
    state.sessions.push({ token, userId, createdAt: new Date().toISOString() })
    save()
  },

  findSession(token) {
    return state.sessions.find((session) => session.token === token) || null
  },

  removeSession(token) {
    state.sessions = state.sessions.filter((session) => session.token !== token)
    save()
  },

  getResources() {
    return [...state.resources].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt)),
    )
  },

  addResource(data) {
    const resource = { id: randomUUID(), ...data, createdAt: new Date().toISOString() }
    state.resources.push(resource)
    save()
    return resource
  },

  updateResource(id, data) {
    const resource = state.resources.find((item) => item.id === id)
    if (!resource) return null
    Object.assign(resource, data)
    save()
    return resource
  },

  deleteResource(id) {
    const resource = state.resources.find((item) => item.id === id)
    if (!resource) return null
    state.resources = state.resources.filter((item) => item.id !== id)
    save()
    return resource
  },

  seedResources(samples) {
    if (state.resources.length > 0) return
    state.resources = samples.map((sample) => ({ ...sample, id: sample.id || randomUUID() }))
    save()
  },
}
