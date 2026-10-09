import { useState } from 'react'
import { FILE_CATEGORIES } from '../lib/categories.js'

const EMPTY = {
  title: '',
  description: '',
  category: 'pdf',
  url: '',
  previewImage: '',
}

export default function ResourceForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }))
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  // A picture picked from the device is read into a data URL and kept with the
  // resource in the browser. Nothing is uploaded to a server, so this keeps
  // working on GitHub Pages.
  function handlePreviewFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('previewImage', String(reader.result))
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Please add a title.')
      return
    }
    if (!form.url.trim()) {
      setError('Please add a link to the resource file.')
      return
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      previewImage: String(form.previewImage || '').trim(),
    })
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

        <label className="field">
          <span>Link to the file</span>
          <input
            type="url"
            value={form.url}
            placeholder="https://…"
            onChange={(event) => set('url', event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>Preview picture</span>
        <input
          type="url"
          value={form.previewImage.startsWith('data:') ? '' : form.previewImage}
          placeholder="Paste an image URL, or choose a picture below"
          onChange={(event) => set('previewImage', event.target.value)}
        />
      </label>

      <label className="field field-file">
        <span>…or choose a picture from your device</span>
        <input type="file" accept="image/*" onChange={handlePreviewFile} />
      </label>

      {form.previewImage ? (
        <div className="preview-thumb">
          <img src={form.previewImage} alt="Preview" />
          <button type="button" className="btn-icon" onClick={() => set('previewImage', '')}>
            Remove picture
          </button>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
