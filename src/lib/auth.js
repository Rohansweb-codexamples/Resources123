// Admin gate for the resource hub.
//
// This site is built as a static site for GitHub Pages, so there is no server to
// check a password. The login below is a client-side gate only: the credentials
// ship inside the bundle and are visible in the page source. It decides who sees
// the admin controls in the UI — it is NOT a security boundary. If you need real
// protection, the app needs a backend that authenticates and stores resources.
export const ADMIN_EMAIL = 'rohanwest@rohansweb.co.uk'
const ADMIN_PASSWORD = 'Ewanandlam100'

export function isAdmin(email, password) {
  return (
    String(email).trim().toLowerCase() === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  )
}
