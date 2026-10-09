import { useState } from 'react'
import { categoryLabel } from '../lib/categories.js'
import { LeafPreview } from './LeafArt.jsx'

export default function ResourceCard({ resource }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(resource.previewImage) && !imageFailed
  const label = categoryLabel(resource.category)

  return (
    <a className="card" href={`#/resource/${encodeURIComponent(resource.id)}`}>
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

      <div className="card-foot">
        <span className="card-cta">
          View resource <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  )
}
