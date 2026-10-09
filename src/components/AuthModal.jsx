import { useState } from 'react'

export default function AuthModal({ onClose, onSubmit }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const creating = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit(mode, email, password)
    } catch (submitError) {
      setError(submitError.message)
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal modal-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="auth-title">{creating ? 'Create an account' : 'Login'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="modal-hint">
          {creating
            ? 'Create an account to sign in. Browsing the hub never needs one.'
            : 'Log in to your account. Browsing the hub never needs one.'}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="username"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete={creating ? 'new-password' : 'current-password'}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Please wait…' : creating ? 'Create account' : 'Login'}
            </button>
          </div>
        </form>

        <p className="modal-switch">
          {creating ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMode(creating ? 'login' : 'signup')
              setError('')
            }}
          >
            {creating ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  )
}
