import { useState } from 'react'
import { FILE_CATEGORIES } from '../lib/categories.js'

const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.odt,.odp'

function categoryForFile(file) {
  const extension = file.name.split('.').pop().toLowerCase()
  if (extension === 'pdf') return 'pdf'
  if (extension === 'ppt' || extension === 'pptx' || extension === 'odp') return 'presentation'
  return 'document'
}

export default function ResourceForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'pdf',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleFile(event) {
    const picked = event.target.files?.[0] || null
    setFile(picked)
    if (picked) set('category', categoryForFile(picked))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!initial && !file) {
      setError('Choose a PDF, document or presentation to upload.')
      return
    }
    if (!form.title.trim()) {
      setError('Please add a title.')
      return
    }

    const data = new FormData()
    data.append('title', form.title.trim())
    data.append('description', form.description.trim())
    data.append('category', form.category)
    if (file) data.append('file', file)
    if (preview) data.append('preview', preview)

    setBusy(true)
    setError('')
    try {
      await onSubmit(data)
    } catch (submitError) {
      setError(submitError.message)
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Title</span>
        <input
          type="text"
          value={form.title}
          placeholder="e.g. Onboarding handbook"
          onChange={(event) => set('title', event.target.value)}
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          rows={3}
          value={form.description}
          placeholder="A short line about what this resource is."
          onChange={(event) => set('description', event.target.value)}
        />
      </label>

      <label className="field field-file">
        <span>{initial ? 'Replace the file (optional)' : 'Upload the file'}</span>
        <input type="file" accept={ACCEPTED} onChange={handleFile} />
      </label>
      {initial?.fileName ? <p className="file-note">Current file: {initial.fileName}</p> : null}
      {file ? <p className="file-note">Uploading: {file.name}</p> : null}

      <div className="field-row">
        <label className="field">
          <span>Type</span>
          <select value={form.category} onChange={(event) => set('category', event.target.value)}>
            {FILE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-file">
          <span>Preview picture (optional)</span>
          <input type="file" accept="image/*" onChange={(event) => setPreview(event.target.files?.[0] || null)} />
        </label>
      </div>
      {preview ? <p className="file-note">Preview picture: {preview.name}</p> : null}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
