import { useEffect, useMemo, useState } from 'react'
import seedResources from './data/resources.json'
import { isAdmin } from './lib/auth.js'
import { navigate, useHashRoute } from './lib/router.js'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ResourceGrid from './components/ResourceGrid.jsx'
import LoginModal from './components/LoginModal.jsx'
import LoginRequired from './components/LoginRequired.jsx'
import Footer from './components/Footer.jsx'
import ResourcePage from './pages/ResourcePage.jsx'
import ResourceFormPage from './pages/ResourceFormPage.jsx'

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
  const route = useHashRoute()
  const [resources, setResources] = useState(loadResources)
  const [isSignedIn, setIsSignedIn] = useState(
    () => localStorage.getItem(AUTH_KEY) === '1',
  )
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources))
    } catch {
      // storage may be full or blocked; the hub still works for this session
    }
  }, [resources])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route.name, route.id])

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
    setIsSignedIn(true)
    setShowLogin(false)
    return true
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY)
    setIsSignedIn(false)
  }

  function saveResource(data) {
    const id = data.id || newId()
    const record = { ...data, id }
    setResources((current) => {
      if (current.some((item) => item.id === id)) {
        return current.map((item) => (item.id === id ? { ...item, ...record } : item))
      }
      return [{ ...record, createdAt: new Date().toISOString().slice(0, 10) }, ...current]
    })
    return id
  }

  function handleDelete(resource) {
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return
    setResources((current) => current.filter((item) => item.id !== resource.id))
    navigate('/')
  }

  let content
  if (route.name === 'resource') {
    const resource = resources.find((item) => item.id === route.id)
    content = <ResourcePage resource={resource} isSignedIn={isSignedIn} onDelete={handleDelete} />
  } else if (route.name === 'add') {
    content = isSignedIn ? (
      <ResourceFormPage
        mode="add"
        onSave={(data) => {
          saveResource(data)
          navigate('/')
        }}
        onCancel={() => navigate('/')}
      />
    ) : (
      <LoginRequired onLogin={() => setShowLogin(true)} />
    )
  } else if (route.name === 'edit') {
    const resource = resources.find((item) => item.id === route.id)
    content =
      isSignedIn && resource ? (
        <ResourceFormPage
          mode="edit"
          resource={resource}
          onSave={(data) => {
            saveResource(data)
            navigate(`/resource/${data.id}`)
          }}
          onCancel={() => navigate(`/resource/${route.id}`)}
        />
      ) : (
        <LoginRequired onLogin={() => setShowLogin(true)} />
      )
  } else {
    content = (
      <main className="container main">
        <section className="hero">
          <h1>Everything you need, neatly gathered.</h1>
          <p>
            Browse PDFs, documents and presentations freely — no account required. Log
            in to add resources and give each one a preview picture.
          </p>
        </section>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          counts={counts}
        />

        <ResourceGrid resources={filtered} isSignedIn={isSignedIn} />
      </main>
    )
  }

  return (
    <div className="app-shell">
      <Header
        isSignedIn={isSignedIn}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onAddClick={() => navigate('/add')}
      />

      {content}

      <Footer />

      {showLogin ? (
        <LoginModal onClose={() => setShowLogin(false)} onSubmit={handleLogin} />
      ) : null}
    </div>
  )
}
