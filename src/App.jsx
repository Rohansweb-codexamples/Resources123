import { useEffect, useMemo, useState } from 'react'
import seedResources from './data/resources.json'
import { isAdmin } from './lib/auth.js'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ResourceGrid from './components/ResourceGrid.jsx'
import LoginModal from './components/LoginModal.jsx'
import ResourceFormModal from './components/ResourceFormModal.jsx'
import Footer from './components/Footer.jsx'

const RESOURCES_KEY = 'leaf-library:resources:v1'
const AUTH_KEY = 'leaf-library:admin:v1'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `resource-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadResources() {
  try {
    const raw = localStorage.getItem(RESOURCES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore corrupt storage and fall back to the sample resources
  }
  return seedResources
}

export default function App() {
  const [resources, setResources] = useState(loadResources)
  const [isAdminUser, setIsAdminUser] = useState(
    () => localStorage.getItem(AUTH_KEY) === '1',
  )
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [showLogin, setShowLogin] = useState(false)
  const [formTarget, setFormTarget] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources))
    } catch {
      // storage may be full or blocked; the hub still works for this session
    }
  }, [resources])

  const counts = useMemo(() => {
    const base = { all: resources.length, pdf: 0, document: 0, presentation: 0 }
    for (const resource of resources) {
      if (base[resource.category] !== undefined) base[resource.category] += 1
    }
    return base
  }, [resources])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return resources.filter((resource) => {
      if (category !== 'all' && resource.category !== category) return false
      if (!needle) return true
      return (
        resource.title.toLowerCase().includes(needle) ||
        (resource.description || '').toLowerCase().includes(needle)
      )
    })
  }, [resources, query, category])

  function handleLogin(email, password) {
    if (!isAdmin(email, password)) return false
    localStorage.setItem(AUTH_KEY, '1')
    setIsAdminUser(true)
    setShowLogin(false)
    return true
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY)
    setIsAdminUser(false)
  }

  function handleSave(resource) {
    setResources((current) => {
      const exists = resource.id && current.some((item) => item.id === resource.id)
      if (exists) {
        return current.map((item) =>
          item.id === resource.id ? { ...item, ...resource } : item,
        )
      }
      return [
        { ...resource, id: resource.id || newId(), createdAt: new Date().toISOString().slice(0, 10) },
        ...current,
      ]
    })
    setFormTarget(null)
  }

  function handleDelete(resource) {
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return
    setResources((current) => current.filter((item) => item.id !== resource.id))
  }

  return (
    <div className="app-shell">
      <Header
        isAdminUser={isAdminUser}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onAddClick={() => setFormTarget({})}
      />

      <main className="container main">
        <section className="hero">
          <h1>Everything you need, neatly gathered.</h1>
          <p>
            Browse PDFs, documents and presentations freely — no account required.
            Admins can sign in to add resources and give each one a preview picture.
          </p>
        </section>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          counts={counts}
        />

        <ResourceGrid
          resources={filtered}
          isAdminUser={isAdminUser}
          onEdit={(resource) => setFormTarget(resource)}
          onDelete={handleDelete}
        />
      </main>

      <Footer />

      {showLogin ? (
        <LoginModal onClose={() => setShowLogin(false)} onSubmit={handleLogin} />
      ) : null}

      {formTarget ? (
        <ResourceFormModal
          initial={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}
