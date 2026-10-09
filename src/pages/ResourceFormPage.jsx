import ResourceForm from '../components/ResourceForm.jsx'

export default function ResourceFormPage({ mode, resource, onSubmit, onCancel }) {
  const editing = mode === 'edit'

  return (
    <main className="container main">
      <a className="back-link" href="#/">
        ← Back to all resources
      </a>
      <div className="form-page">
        <h1 className="page-title">{editing ? 'Edit resource' : 'Add a resource'}</h1>
        <p className="page-sub">
          Upload a PDF, document or presentation and give the resource a title. The
          file is stored on the server so everyone sees it.
        </p>
        <ResourceForm
          initial={editing ? resource : null}
          submitLabel={editing ? 'Save changes' : 'Add resource'}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </main>
  )
}
