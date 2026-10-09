// PDFs open inside the page in the browser's own PDF viewer, so a click opens
// the file instead of downloading it. Other file types (documents,
// presentations) can't be rendered by a browser, so their resource page shows
// the preview picture plus an "open in a new tab" link.
export function isOpenable(resource) {
  if (!resource) return false
  if (resource.category === 'pdf') return true
  return /\.pdf(\?|#|$)/i.test(resource.url || '')
}
