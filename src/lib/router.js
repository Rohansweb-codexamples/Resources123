import { useEffect, useState } from 'react'

// Tiny hash router — no dependency, and hash URLs work on GitHub Pages without
// any server rewrite rules.

export function navigate(path) {
  if (window.location.hash === `#${path}`) return
  window.location.hash = path
}

function parse(hash) {
  const parts = (hash || '').replace(/^#/, '').split('/').filter(Boolean)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'resource' && parts[1]) {
    return { name: 'resource', id: decodeURIComponent(parts[1]) }
  }
  if (parts[0] === 'add') return { name: 'add' }
  if (parts[0] === 'edit' && parts[1]) {
    return { name: 'edit', id: decodeURIComponent(parts[1]) }
  }
  return { name: 'home' }
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
