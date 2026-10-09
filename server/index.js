import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import { hashPassword, verifyPassword } from './auth.js'
import { store } from './store.js'

const PORT = Number(process.env.PORT || 4000)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '')

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// The admin account comes from config (ADMIN_EMAIL / ADMIN_PASSWORD) and is
// re-applied on every boot. Everyone else who signs up is a normal account.
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  store.upsertAdmin(ADMIN_EMAIL, hashPassword(ADMIN_PASSWORD))
}

try {
  const seedPath = path.join(import.meta.dirname, 'seed.json')
  store.seedResources(JSON.parse(fs.readFileSync(seedPath, 'utf8')))
} catch {
  // seed file is optional
}

const UPLOADABLE = new Set([
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.csv', '.rtf', '.odt', '.odp',
])

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'preview') {
      if (!file.mimetype.startsWith('image/')) return cb(new Error('The preview must be an image.'))
      return cb(null, true)
    }
    if (!UPLOADABLE.has(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Upload a PDF, a document or a presentation.'))
    }
    cb(null, true)
  },
})

const app = express()

app.use('/uploads', express.static(UPLOAD_DIR))

function publicUser(user) {
  return { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin) }
}

function parseCookies(req) {
  const header = req.headers.cookie || ''
  const cookies = {}
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index === -1) continue
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return cookies
}

function currentUser(req) {
  const token = parseCookies(req).sid
  if (!token) return null
  const session = store.findSession(token)
  if (!session) return null
  return store.findUserById(session.userId)
}

function startSession(res, user) {
  const token = randomBytes(32).toString('hex')
  store.addSession(token, user.id)
  res.cookie('sid', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.post('/api/auth/signup', express.json(), (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!email.includes('@')) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (password.length < 6) return res.status(400).json({ error: 'Use a password of at least 6 characters.' })
  if (store.findUserByEmail(email)) {
    return res.status(409).json({ error: 'That email already has an account.' })
  }
  const user = store.addUser({ email, passwordHash: hashPassword(password), isAdmin: false })
  startSession(res, user)
  res.status(201).json({ user: publicUser(user) })
})

app.post('/api/auth/login', express.json(), (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = store.findUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Those details did not match.' })
  }
  startSession(res, user)
  res.json({ user: publicUser(user) })
})

app.post('/api/auth/logout', (req, res) => {
  const token = parseCookies(req).sid
  if (token) store.removeSession(token)
  res.clearCookie('sid', { path: '/' })
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req)
  res.json({ user: user ? publicUser(user) : null })
})

app.get('/api/resources', (req, res) => {
  res.json({ resources: store.getResources() })
})

function requireAdmin(req, res, next) {
  const user = currentUser(req)
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Only the admin can add, edit or delete resources.' })
  }
  req.user = user
  next()
}

const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
])

function removeUploaded(url) {
  if (!url || !url.startsWith('/uploads/')) return
  const target = path.join(UPLOAD_DIR, path.basename(url))
  fs.rm(target, { force: true }, () => {})
}

app.post('/api/resources', requireAdmin, uploadFields, (req, res) => {
  const file = req.files?.file?.[0]
  const preview = req.files?.preview?.[0]
  const title = String(req.body?.title || '').trim()
  if (!file) return res.status(400).json({ error: 'Choose a PDF, document or presentation to upload.' })
  if (!title) return res.status(400).json({ error: 'Add a title.' })

  const resource = store.addResource({
    title,
    description: String(req.body?.description || '').trim(),
    category: String(req.body?.category || '').trim() || 'document',
    url: `/uploads/${file.filename}`,
    previewImage: preview ? `/uploads/${preview.filename}` : '',
    fileName: file.originalname,
  })
  res.status(201).json({ resource })
})

app.put('/api/resources/:id', requireAdmin, uploadFields, (req, res) => {
  const existing = store.getResources().find((item) => item.id === req.params.id)
  if (!existing) return res.status(404).json({ error: 'That resource no longer exists.' })

  const file = req.files?.file?.[0]
  const preview = req.files?.preview?.[0]
  const changes = {
    title: String(req.body?.title || '').trim() || existing.title,
    description: String(req.body?.description || '').trim(),
    category: String(req.body?.category || '').trim() || existing.category,
  }
  if (file) {
    changes.url = `/uploads/${file.filename}`
    changes.fileName = file.originalname
    removeUploaded(existing.url)
  }
  if (preview) {
    changes.previewImage = `/uploads/${preview.filename}`
    removeUploaded(existing.previewImage)
  }

  res.json({ resource: store.updateResource(req.params.id, changes) })
})

app.delete('/api/resources/:id', requireAdmin, (req, res) => {
  const removed = store.deleteResource(req.params.id)
  if (!removed) return res.status(404).json({ error: 'That resource no longer exists.' })
  removeUploaded(removed.url)
  removeUploaded(removed.previewImage)
  res.json({ ok: true })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  const message =
    err?.code === 'LIMIT_FILE_SIZE'
      ? 'That file is too large — the limit is 25 MB.'
      : err?.message || 'Something went wrong.'
  res.status(400).json({ error: message })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Leaf Library API listening on http://0.0.0.0:${PORT}`)
})
