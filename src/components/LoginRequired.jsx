export default function LoginRequired({ signedIn, onLogin }) {
  return (
    <main className="container main">
      <a className="back-link" href="#/">
        ← Back to all resources
      </a>
      <div className="notice-box">
        <h1 className="page-title">{signedIn ? 'Admin only' : 'Please log in'}</h1>
        <p>
          {signedIn
            ? 'Your account can browse the hub, but only the admin account can add, edit or delete resources.'
            : 'Log in as the admin account to add, edit or delete resources.'}
        </p>
        {signedIn ? (
          <a className="btn btn-ghost" href="#/">
            Back to the hub
          </a>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </main>
  )
}
