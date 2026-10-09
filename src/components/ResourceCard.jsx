import { useState } from 'react'
import { categoryLabel } from '../lib/categories.js'
import { LeafPreview } from './LeafArt.jsx'

export default function ResourceCard({ resource, isAdminUser, onEdit, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(resource.previewImage) && !imageFailed
  const label = categoryLabel(resource.category)

  return (
    <article className="card">
      <div className="card-media">
        {showImage ? (
          <img
            src={resource.previewImage}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <LeafPreview label={label} />
        )}
        <span className={`badge badge-${resource.category}`}>{label}</span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{resource.title}</h3>
        {resource.description ? <p className="card-desc">{resource.description}</p> : null}
      </div>

      <div className="card-actions">
        <a className="btn btn-open" href={resource.url} target="_blank" rel="noreferrer">
          Open resource
          <span aria-hidden="true">↗</span>
        </a>
        {isAdminUser ? (
          <div className="card-admin">
            <button type="button" className="btn-icon" onClick={() => onEdit(resource)}>
              Edit
            </button>
            <button
              type="button"
              className="btn-icon btn-danger"
              onClick={() => onDelete(resource)}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
