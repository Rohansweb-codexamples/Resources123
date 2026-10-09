import ResourceForm from '../components/ResourceForm.jsx'

export default function ResourceFormPage({ mode, resource, onSave, onCancel }) {
  const editing = mode === 'edit'

  function handleSubmit(data) {
    onSave(editing ? { ...data, id: resource.id } : data)
  }

  return (
    <main className="container main">
      <a className="back-link" href="#/">
        ← Back to all resources
      </a>
      <div className="form-page">
        <h1 className="page-title">{editing ? 'Edit resource' : 'Add a resource'}</h1>
        <p className="page-sub">
          Paste a link to the file — a PDF, document or presentation — and give it a
          preview picture.
        </p>
        <ResourceForm
          initial={editing ? resource : null}
          submitLabel={editing ? 'Save changes' : 'Add resource'}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </div>
    </main>
  )
}
