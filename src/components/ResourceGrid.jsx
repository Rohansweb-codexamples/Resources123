import ResourceCard from './ResourceCard.jsx'
import { LeafPreview } from './LeafArt.jsx'

export default function ResourceGrid({ resources, isAdminUser, onEdit, onDelete }) {
  if (resources.length === 0) {
    return (
      <div className="empty">
        <LeafPreview label="Empty" />
        <h3>No resources here yet</h3>
        <p>Try a different search, or {isAdminUser ? 'add one' : 'check back soon'}.</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          isAdminUser={isAdminUser}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
