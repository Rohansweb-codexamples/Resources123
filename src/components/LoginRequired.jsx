export default function LoginRequired({ onLogin }) {
  return (
    <main className="container main">
      <a className="back-link" href="#/">
        ← Back to all resources
      </a>
      <div className="notice-box">
        <h1 className="page-title">Please log in</h1>
        <p>You need to be logged in to add or edit resources.</p>
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          Login
        </button>
      </div>
    </main>
  )
}
