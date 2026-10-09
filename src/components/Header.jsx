import { LeafLogo } from './LeafArt.jsx'

export default function Header({ isAdminUser, onLoginClick, onLogout, onAddClick }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-mark">
            <LeafLogo />
          </span>
          <span className="brand-text">
            <strong>Leaf Library</strong>
            <small>Resource hub</small>
          </span>
        </div>

        <div className="header-actions">
          {isAdminUser ? (
            <>
              <button type="button" className="btn btn-primary" onClick={onAddClick}>
                + Add resource
              </button>
              <span className="admin-pill" title="Signed in as admin">
                Admin
              </span>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={onLoginClick}>
              Admin login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
