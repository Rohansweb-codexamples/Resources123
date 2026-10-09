import { LeafLogo } from './LeafArt.jsx'

export default function Header({ isSignedIn, onLoginClick, onLogout, onAddClick }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#/">
          <span className="brand-mark">
            <LeafLogo />
          </span>
          <span className="brand-text">
            <strong>Leaf Library</strong>
            <small>Resource hub</small>
          </span>
        </a>

        <div className="header-actions">
          {isSignedIn ? (
            <>
              <button type="button" className="btn btn-primary" onClick={onAddClick}>
                + Add resource
              </button>
              <span className="signed-pill">Signed in</span>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={onLoginClick}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
