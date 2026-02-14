import { useState, useEffect } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useRedirects, RESERVED_SLUGS } from '../hooks/useRedirects'
import { useHelpfulLinks } from '../hooks/useHelpfulLinks'

const LOADING_SLOW_MS = 8000

function ShortlinksTab({ items, addRedirect, updateRedirect, removeRedirect }) {
  const [slug, setSlug] = useState('')
  const [url, setUrl] = useState('')
  const [editingSlug, setEditingSlug] = useState(null)
  const [editUrl, setEditUrl] = useState('')

  function normalizeSlug(s) {
    return s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
  }

  function isValidUrl(u) {
    const trimmed = (u || '').trim()
    return trimmed.startsWith('http://') || trimmed.startsWith('https://')
  }

  function clearForm() {
    setSlug('')
    setUrl('')
    setEditingSlug(null)
    setEditUrl('')
  }

  async function handleAdd(e) {
    e.preventDefault()
    const normalized = normalizeSlug(slug)
    if (!normalized) return
    if (RESERVED_SLUGS.includes(normalized.toLowerCase())) {
      alert(`"${normalized}" is reserved. Use a different slug.`)
      return
    }
    if (!isValidUrl(url)) {
      alert('URL must start with http:// or https://')
      return
    }
    await addRedirect(normalized, url.trim())
    clearForm()
  }

  function startEdit(item) {
    setEditingSlug(item.slug)
    setEditUrl(item.url || '')
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editingSlug || !isValidUrl(editUrl)) return
    await updateRedirect(editingSlug, editUrl.trim())
    clearForm()
  }

  async function handleDelete(slugToRemove) {
    if (window.confirm(`Remove shortlink /${slugToRemove}?`)) {
      await removeRedirect(slugToRemove)
    }
  }

  const shortlinkBase = typeof window !== 'undefined' ? window.location.origin : 'jordan-matthews.com'

  return (
    <>
      <section className="admin-home-section">
        <h2 className="admin-section-title">Shortlinks</h2>
        <p className="admin-empty" style={{ marginBottom: '1rem' }}>
          Add a slug and destination URL. Visitors to <strong>{shortlinkBase}/YourSlug</strong> will be redirected to the URL.
        </p>
        <form className="admin-form" onSubmit={editingSlug ? saveEdit : handleAdd}>
          <label>
            Slug <span className="required">*</span>
            <span className="hint"> One word or phrase, no spaces (e.g. Dog, my-app)</span>
            <input
              type="text"
              value={editingSlug ? editingSlug : slug}
              onChange={(e) => (editingSlug ? null : setSlug(e.target.value))}
              placeholder="Dog"
              required
              readOnly={!!editingSlug}
            />
          </label>
          <label>
            Destination URL <span className="required">*</span>
            <input
              type="url"
              value={editingSlug ? editUrl : url}
              onChange={(e) => (editingSlug ? setEditUrl(e.target.value) : setUrl(e.target.value))}
              placeholder="https://..."
              required
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editingSlug ? 'Save' : 'Add shortlink'}
            </button>
            {editingSlug && (
              <button type="button" className="btn btn-secondary" onClick={clearForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="admin-list">
          <h3 className="admin-list-title">Current shortlinks</h3>
          {items.length === 0 ? (
            <p className="admin-empty">No shortlinks yet.</p>
          ) : (
            <ul className="admin-items">
              {items.map((item) => (
                <li key={item.slug} className="admin-item">
                  {editingSlug === item.slug ? null : (
                    <>
                      <div className="admin-item-info">
                        <strong>/{item.slug}</strong>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                          {item.url}
                        </a>
                        <span className="admin-item-meta">{shortlinkBase}/{item.slug}</span>
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.slug)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function PortfolioTab({ items, addItem, updateItem, removeItem, moveItem }) {
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

  return (
    <>
      <form className="admin-form" onSubmit={handleAdd}>
        <h2 className="admin-form-title">Add app</h2>
        <label>
          Name <span className="required">*</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="App name" required />
        </label>
        <label>
          URL <span className="required">*</span>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
        </label>
        <label>
          Description
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
        </label>
        <label>
          Tags <span className="hint">(comma-separated)</span>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="React, Vite" />
        </label>
        <label>
          Image URL
          <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
        </label>
        <button type="submit" className="btn btn-primary">Add app</button>
      </form>

      <section className="admin-list">
        <h2 className="admin-list-title">Current apps</h2>
        {items.length === 0 ? (
          <p className="admin-empty">No apps yet. Add one above.</p>
        ) : (
          <ul className="admin-items">
            {items.map((item, index) => (
              <li key={item.id} className="admin-item">
                {editingId === item.id ? (
                  <form className="admin-edit-form" onSubmit={saveEdit}>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Name" required />
                    <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="URL" required />
                    <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                    <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma-separated)" />
                    <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="Image URL" />
                    <div className="admin-edit-actions">
                      <button type="submit" className="btn btn-primary btn-sm">Save</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-reorder-buttons">
                      <button
                        type="button"
                        className="btn-reorder"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        className="btn-reorder"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        title="Move down"
                      >
                        &#9660;
                      </button>
                    </div>
                    <div className="admin-item-info">
                      <strong>{item.title}</strong>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                        {item.url}
                      </a>
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>Edit</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function HelpfulLinksTab({ items, error, addLink, updateLink, removeLink, moveLink }) {
  if (error) {
    return (
      <p className="admin-error">
        Could not load helpful links: {error.message}. Make sure Firestore rules are deployed.
      </p>
    )
  }

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editDescription, setEditDescription] = useState('')

  function clearForm() {
    setTitle('')
    setUrl('')
    setDescription('')
    setEditingId(null)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    await addLink({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
    })
    clearForm()
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditTitle(item.title ?? '')
    setEditUrl(item.url ?? '')
    setEditDescription(item.description ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditUrl('')
    setEditDescription('')
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editingId || !editTitle.trim() || !editUrl.trim()) return
    await updateLink(editingId, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      description: editDescription.trim(),
    })
    cancelEdit()
  }

  async function handleDelete(id) {
    if (window.confirm('Remove this link?')) {
      await removeLink(id)
    }
  }

  return (
    <>
      <form className="admin-form" onSubmit={editingId ? saveEdit : handleAdd}>
        <h2 className="admin-form-title">{editingId ? 'Edit link' : 'Add link'}</h2>
        <label>
          Title <span className="required">*</span>
          <input
            type="text"
            value={editingId ? editTitle : title}
            onChange={(e) => (editingId ? setEditTitle(e.target.value) : setTitle(e.target.value))}
            placeholder="Link title"
            required
          />
        </label>
        <label>
          URL <span className="required">*</span>
          <input
            type="url"
            value={editingId ? editUrl : url}
            onChange={(e) => (editingId ? setEditUrl(e.target.value) : setUrl(e.target.value))}
            placeholder="https://..."
            required
          />
        </label>
        <label>
          Description <span className="hint">(optional)</span>
          <input
            type="text"
            value={editingId ? editDescription : description}
            onChange={(e) => (editingId ? setEditDescription(e.target.value) : setDescription(e.target.value))}
            placeholder="Short description"
          />
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save' : 'Add link'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="admin-list">
        <h2 className="admin-list-title">Current links</h2>
        {items.length === 0 ? (
          <p className="admin-empty">No helpful links yet.</p>
        ) : (
          <ul className="admin-items">
            {items.map((item, index) => (
              <li key={item.id} className="admin-item">
                {editingId === item.id ? null : (
                  <>
                    <div className="admin-reorder-buttons">
                      <button
                        type="button"
                        className="btn-reorder"
                        onClick={() => moveLink(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        className="btn-reorder"
                        onClick={() => moveLink(index, 1)}
                        disabled={index === items.length - 1}
                        title="Move down"
                      >
                        &#9660;
                      </button>
                    </div>
                    <div className="admin-item-info">
                      <strong>{item.title}</strong>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                        {item.url}
                      </a>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <div className="admin-item-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>Edit</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default function AdminPage() {
  const { items: portfolioItems, loading: portfolioLoading, error: portfolioError, addItem, updateItem, removeItem, moveItem } = usePortfolio()
  const { items: redirectItems, loading: redirectsLoading, error: redirectsError, addRedirect, updateRedirect, removeRedirect } = useRedirects()
  const { items: linkItems, loading: linksLoading, error: linksError, addLink, updateLink, removeLink, moveLink } = useHelpfulLinks()
  const [activeTab, setActiveTab] = useState('portfolio')
  const [loadingSlow, setLoadingSlow] = useState(false)

  const loading = portfolioLoading || redirectsLoading
  const linksReady = !linksLoading

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

  const coreError = portfolioError || redirectsError
  if (coreError) {
    return (
      <div className="page admin-page">
        <p className="admin-error">Error loading: {coreError.message}</p>
        {coreError.code && <p className="admin-error-code">Code: {coreError.code}</p>}
      </div>
    )
  }

  return (
    <div className="page admin-page">
      <header className="page-header">
        <h1>Admin</h1>
        <p className="page-subtitle">Manage your content</p>
      </header>

      <div className="admin-tabs">
        <button type="button" className={`admin-tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
          Portfolio
        </button>
        <button type="button" className={`admin-tab ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
          Helpful Links
        </button>
        <button type="button" className={`admin-tab ${activeTab === 'shortlinks' ? 'active' : ''}`} onClick={() => setActiveTab('shortlinks')}>
          Shortlinks
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <PortfolioTab items={portfolioItems} addItem={addItem} updateItem={updateItem} removeItem={removeItem} moveItem={moveItem} />
      )}

      {activeTab === 'links' && (
        <HelpfulLinksTab items={linkItems} error={linksError} addLink={addLink} updateLink={updateLink} removeLink={removeLink} moveLink={moveLink} />
      )}

      {activeTab === 'shortlinks' && (
        <ShortlinksTab items={redirectItems} addRedirect={addRedirect} updateRedirect={updateRedirect} removeRedirect={removeRedirect} />
      )}
    </div>
  )
}
