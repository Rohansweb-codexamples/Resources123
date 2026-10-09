import { categoryLabel } from '../lib/categories.js'
import { isOpenable } from '../lib/embed.js'
import { LeafPreview } from '../components/LeafArt.jsx'

export default function ResourcePage({ resource, canManage, onDelete }) {
  if (!resource) {
    return (
      <main className="container main">
        <a className="back-link" href="#/">
          ← Back to all resources
        </a>
        <p className="notice">That resource could not be found.</p>
      </main>
    )
  }

  const label = categoryLabel(resource.category)
  const openable = isOpenable(resource)

  return (
    <main className="container main">
      <a className="back-link" href="#/">
        ← Back to all resources
      </a>

      <div className="resource-page">
        <div className="resource-viewer">
          {openable ? (
            <iframe src={resource.url} title={resource.title} />
          ) : resource.previewImage ? (
            <img src={resource.previewImage} alt="" />
          ) : (
            <LeafPreview label={label} />
          )}
        </div>

        <div className="resource-info">
          <span className={`type-tag type-tag-${resource.category}`}>{label}</span>
          <h1 className="resource-title">{resource.title}</h1>
          {resource.description ? <p className="resource-desc">{resource.description}</p> : null}

          <div className="resource-actions">
            <a className="btn btn-primary" href={resource.url} target="_blank" rel="noreferrer">
              {openable ? 'Open in new tab' : 'Open resource'} <span aria-hidden="true">↗</span>
            </a>
            {canManage ? (
              <>
                <a className="btn btn-ghost" href={`#/edit/${encodeURIComponent(resource.id)}`}>
                  Edit
                </a>
                <button type="button" className="btn-icon btn-danger" onClick={() => onDelete(resource)}>
                  Delete
                </button>
              </>
            ) : null}
          </div>

          {openable ? (
            <p className="viewer-note">
              Opens right here — nothing is downloaded. If it doesn’t load, use
              “Open in new tab”.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  )
}
