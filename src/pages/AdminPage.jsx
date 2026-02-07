import { useState, useEffect } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'

const LOADING_SLOW_MS = 8000

export default function AdminPage() {
  const { items, loading, error, addItem, updateItem, removeItem } = usePortfolio()
  const [loadingSlow, setLoadingSlow] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [image, setImage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editImage, setEditImage] = useState('')

  function clearForm() {
    setTitle('')
    setUrl('')
    setDescription('')
    setTags('')
    setImage('')
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    await addItem({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      tags: tags.trim() ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      image: image.trim(),
    })
    clearForm()
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditTitle(item.title ?? '')
    setEditUrl(item.url ?? '')
    setEditDescription(item.description ?? '')
    setEditTags(Array.isArray(item.tags) ? item.tags.join(', ') : '')
    setEditImage(item.image ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editingId || !editTitle.trim() || !editUrl.trim()) return
    await updateItem(editingId, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      description: editDescription.trim(),
      tags: editTags.trim() ? editTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      image: editImage.trim(),
    })
    setEditingId(null)
  }

  async function handleDelete(id) {
    if (window.confirm('Remove this app from the portfolio?')) {
      await removeItem(id)
    }
  }

  useEffect(() => {
    if (!loading) {
      setLoadingSlow(false)
      return
    }
    const t = setTimeout(() => setLoadingSlow(true), LOADING_SLOW_MS)
    return () => clearTimeout(t)
  }, [loading])

  if (loading) {
    return (
      <div className="page admin-page">
        <p className="page-subtitle">Loading…</p>
        {loadingSlow && (
          <p className="admin-loading-slow">
            Taking a while… Make sure Firestore is set up: Firebase Console → Build → Firestore Database → Create database, then deploy the rules from <code>firestore.rules</code>.
          </p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="page admin-page">
        <p className="admin-error">Error loading portfolio: {error.message}</p>
        {error.code && <p className="admin-error-code">Code: {error.code}</p>}
      </div>
    )
  }

  return (
    <div className="page admin-page">
      <header className="page-header">
        <h1>Admin</h1>
        <p className="page-subtitle">Add and edit portfolio apps</p>
      </header>

      <form className="admin-form" onSubmit={handleAdd}>
        <h2 className="admin-form-title">Add app</h2>
        <label>
          Name <span className="required">*</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="App name"
            required
          />
        </label>
        <label>
          URL <span className="required">*</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </label>
        <label>
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
          />
        </label>
        <label>
          Tags <span className="hint">(comma-separated)</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="React, Vite"
          />
        </label>
        <label>
          Image URL
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Add app
        </button>
      </form>

      <section className="admin-list">
        <h2 className="admin-list-title">Current apps</h2>
        {items.length === 0 ? (
          <p className="admin-empty">No apps yet. Add one above.</p>
        ) : (
          <ul className="admin-items">
            {items.map((item) => (
              <li key={item.id} className="admin-item">
                {editingId === item.id ? (
                  <form className="admin-edit-form" onSubmit={saveEdit}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Name"
                      required
                    />
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="URL"
                      required
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                    />
                    <input
                      type="url"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="Image URL"
                    />
                    <div className="admin-edit-actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-item-info">
                      <strong>{item.title}</strong>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                        {item.url}
                      </a>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
