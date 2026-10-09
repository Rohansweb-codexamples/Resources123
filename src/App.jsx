import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './lib/api.js'
import { navigate, useHashRoute } from './lib/router.js'
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx'
import ResourceGrid from './components/ResourceGrid.jsx'
import AuthModal from './components/AuthModal.jsx'
import LoginRequired from './components/LoginRequired.jsx'
import Footer from './components/Footer.jsx'
import ResourcePage from './pages/ResourcePage.jsx'
import ResourceFormPage from './pages/ResourceFormPage.jsx'

export default function App() {
  const route = useHashRoute()
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    try {
      const data = await api.listResources()
      setResources(data.resources || [])
      setLoadError('')
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [route.name, route.id])

  const canManage = Boolean(user && user.isAdmin)

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
        String(resource.title || '').toLowerCase().includes(needle) ||
        String(resource.description || '').toLowerCase().includes(needle)
      )
    })
  }, [resources, query, category])

  async function handleAuth(mode, email, password) {
    const data = mode === 'signup' ? await api.signup(email, password) : await api.login(email, password)
    setUser(data.user)
    setAuthOpen(false)
  }

  async function handleLogout() {
    try {
      await api.logout()
    } catch {
      // ignore — the session is cleared on the client either way
    }
    setUser(null)
    navigate('/')
  }

  async function handleSave(data, id) {
    if (id) await api.updateResource(id, data)
    else await api.createResource(data)
    await refresh()
    navigate('/')
  }

  async function handleDelete(resource) {
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return
    try {
      await api.deleteResource(resource.id)
      await refresh()
      navigate('/')
    } catch (error) {
      window.alert(error.message)
    }
  }

  let content
  if (route.name === 'resource') {
    const resource = resources.find((item) => item.id === route.id)
    content = <ResourcePage resource={resource} canManage={canManage} onDelete={handleDelete} />
  } else if (route.name === 'add') {
    content = canManage ? (
      <ResourceFormPage
        mode="add"
        onSubmit={(data) => handleSave(data)}
        onCancel={() => navigate('/')}
      />
    ) : (
      <LoginRequired signedIn={Boolean(user)} onLogin={() => setAuthOpen(true)} />
    )
  } else if (route.name === 'edit') {
    const resource = resources.find((item) => item.id === route.id)
    content =
      canManage && resource ? (
        <ResourceFormPage
          mode="edit"
          resource={resource}
          onSubmit={(data) => handleSave(data, resource.id)}
          onCancel={() => navigate(`/resource/${resource.id}`)}
        />
      ) : (
        <LoginRequired signedIn={Boolean(user)} onLogin={() => setAuthOpen(true)} />
      )
  } else {
    content = (
      <main className="container main">
        <section className="hero">
          <h1>Everything you need, neatly gathered.</h1>
          <p>
            Browse PDFs, documents and presentations freely — no account required.
            Create an account to sign in; only the admin can add, edit or delete
            resources.
          </p>
        </section>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          counts={counts}
        />

        {loading ? (
          <p className="notice">Loading resources…</p>
        ) : loadError ? (
          <p className="notice">{loadError}</p>
        ) : (
          <ResourceGrid resources={filtered} canManage={canManage} />
        )}
      </main>
    )
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onAddClick={() => navigate('/add')}
      />

      {content}

      <Footer />

      {authOpen ? (
        <AuthModal onClose={() => setAuthOpen(false)} onSubmit={handleAuth} />
      ) : null}
    </div>
  )
}
