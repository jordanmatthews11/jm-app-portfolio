import { useState, useEffect } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useHomeContent } from '../hooks/useHomeContent'
import { useRedirects, RESERVED_SLUGS } from '../hooks/useRedirects'

const LOADING_SLOW_MS = 8000

function ShortlinksTab({ items, loading, error, addRedirect, updateRedirect, removeRedirect }) {
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

function PortfolioTab({ items, loading, error, addItem, updateItem, removeItem }) {
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
    </>
  )
}

function HomeContentTab({
  content,
  updateContent,
  addUpdate,
  updateUpdate,
  removeUpdate,
  addBlogPost,
  updateBlogPost,
  removeBlogPost,
  addRecentProject,
  updateRecentProject,
  removeRecentProject,
  portfolioItems,
}) {
  const [heroTitle, setHeroTitle] = useState('')
  const [heroTagline, setHeroTagline] = useState('')
  const [aboutHeading, setAboutHeading] = useState('')
  const [aboutBio, setAboutBio] = useState('')
  const [updateDate, setUpdateDate] = useState('')
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateContentText, setUpdateContentText] = useState('')
  const [editingUpdateId, setEditingUpdateId] = useState(null)
  const [blogDate, setBlogDate] = useState('')
  const [blogTitle, setBlogTitle] = useState('')
  const [blogExcerpt, setBlogExcerpt] = useState('')
  const [blogLink, setBlogLink] = useState('')
  const [editingBlogId, setEditingBlogId] = useState(null)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectLink, setProjectLink] = useState('')
  const [projectFeatured, setProjectFeatured] = useState(false)
  const [projectPortfolioLink, setProjectPortfolioLink] = useState('')
  const [editingProjectId, setEditingProjectId] = useState(null)

  useEffect(() => {
    if (content.hero) {
      setHeroTitle(content.hero.title || '')
      setHeroTagline(content.hero.tagline || '')
    }
    if (content.about) {
      setAboutHeading(content.about.heading || '')
      setAboutBio(content.about.bio || '')
    }
  }, [content])

  async function handleSaveHero(e) {
    e.preventDefault()
    await updateContent('hero', {
      title: heroTitle.trim(),
      tagline: heroTagline.trim(),
    })
  }

  async function handleSaveAbout(e) {
    e.preventDefault()
    await updateContent('about', {
      heading: aboutHeading.trim(),
      bio: aboutBio.trim(),
    })
  }

  function clearUpdateForm() {
    setUpdateDate('')
    setUpdateTitle('')
    setUpdateContentText('')
    setEditingUpdateId(null)
  }

  async function handleAddUpdate(e) {
    e.preventDefault()
    if (!updateDate || !updateTitle.trim()) return
    await addUpdate({
      date: updateDate,
      title: updateTitle.trim(),
      content: updateContentText.trim(),
    })
    clearUpdateForm()
  }

  function startEditUpdate(update) {
    setEditingUpdateId(update.id)
    setUpdateDate(update.date || '')
    setUpdateTitle(update.title || '')
    setUpdateContentText(update.content || '')
  }

  async function handleSaveUpdate(e) {
    e.preventDefault()
    if (!editingUpdateId || !updateDate || !updateTitle.trim()) return
    await updateUpdate(editingUpdateId, {
      date: updateDate,
      title: updateTitle.trim(),
      content: updateContentText.trim(),
    })
    clearUpdateForm()
  }

  async function handleDeleteUpdate(id) {
    if (window.confirm('Remove this update?')) {
      await removeUpdate(id)
    }
  }

  function clearBlogForm() {
    setBlogDate('')
    setBlogTitle('')
    setBlogExcerpt('')
    setBlogLink('')
    setEditingBlogId(null)
  }

  async function handleAddBlog(e) {
    e.preventDefault()
    if (!blogDate || !blogTitle.trim()) return
    await addBlogPost({
      date: blogDate,
      title: blogTitle.trim(),
      excerpt: blogExcerpt.trim(),
      link: blogLink.trim() || undefined,
    })
    clearBlogForm()
  }

  function startEditBlog(post) {
    setEditingBlogId(post.id)
    setBlogDate(post.date || '')
    setBlogTitle(post.title || '')
    setBlogExcerpt(post.excerpt || '')
    setBlogLink(post.link || '')
  }

  async function handleSaveBlog(e) {
    e.preventDefault()
    if (!editingBlogId || !blogDate || !blogTitle.trim()) return
    await updateBlogPost(editingBlogId, {
      date: blogDate,
      title: blogTitle.trim(),
      excerpt: blogExcerpt.trim(),
      link: blogLink.trim() || undefined,
    })
    clearBlogForm()
  }

  async function handleDeleteBlog(id) {
    if (window.confirm('Remove this blog post?')) {
      await removeBlogPost(id)
    }
  }

  function clearProjectForm() {
    setProjectTitle('')
    setProjectDescription('')
    setProjectLink('')
    setProjectFeatured(false)
    setProjectPortfolioLink('')
    setEditingProjectId(null)
  }

  function handlePortfolioLinkChange(e) {
    const portfolioId = e.target.value
    setProjectPortfolioLink(portfolioId)
    if (portfolioId) {
      const item = portfolioItems.find((i) => i.id === portfolioId)
      if (item) {
        setProjectTitle(item.title || '')
        setProjectDescription(item.description || '')
        setProjectLink(item.url || '')
      }
    }
  }

  async function handleAddProject(e) {
    e.preventDefault()
    if (!projectTitle.trim() || !projectLink.trim()) return
    await addRecentProject({
      title: projectTitle.trim(),
      description: projectDescription.trim(),
      link: projectLink.trim(),
      featured: projectFeatured,
    })
    clearProjectForm()
  }

  function startEditProject(project) {
    setEditingProjectId(project.id)
    setProjectTitle(project.title || '')
    setProjectDescription(project.description || '')
    setProjectLink(project.link || '')
    setProjectFeatured(project.featured || false)
    setProjectPortfolioLink('')
  }

  async function handleSaveProject(e) {
    e.preventDefault()
    if (!editingProjectId || !projectTitle.trim() || !projectLink.trim()) return
    await updateRecentProject(editingProjectId, {
      title: projectTitle.trim(),
      description: projectDescription.trim(),
      link: projectLink.trim(),
      featured: projectFeatured,
    })
    clearProjectForm()
  }

  async function handleDeleteProject(id) {
    if (window.confirm('Remove this recent project?')) {
      await removeRecentProject(id)
    }
  }

  return (
    <>
      <section className="admin-home-section">
        <h2 className="admin-section-title">Hero Section</h2>
        <form className="admin-form" onSubmit={handleSaveHero}>
          <label>
            Title <span className="required">*</span>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Hey, I'm Jordan"
              required
            />
          </label>
          <label>
            Tagline
            <input
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="Builder of vibe-coded apps..."
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Save Hero
          </button>
        </form>
      </section>

      <section className="admin-home-section">
        <h2 className="admin-section-title">About Section</h2>
        <form className="admin-form" onSubmit={handleSaveAbout}>
          <label>
            Heading
            <input
              type="text"
              value={aboutHeading}
              onChange={(e) => setAboutHeading(e.target.value)}
              placeholder="About"
            />
          </label>
          <label>
            Bio <span className="required">*</span>
            <textarea
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              placeholder="Multi-paragraph bio... Use double line breaks for paragraphs."
              rows={6}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Save About
          </button>
        </form>
      </section>

      <section className="admin-home-section">
        <h2 className="admin-section-title">Updates</h2>
        <form className="admin-form" onSubmit={editingUpdateId ? handleSaveUpdate : handleAddUpdate}>
          <label>
            Date <span className="required">*</span>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              required
            />
          </label>
          <label>
            Title <span className="required">*</span>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="Update title"
              required
            />
          </label>
          <label>
            Content
            <textarea
              value={updateContentText}
              onChange={(e) => setUpdateContentText(e.target.value)}
              placeholder="Update content..."
              rows={4}
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editingUpdateId ? 'Save Update' : 'Add Update'}
            </button>
            {editingUpdateId && (
              <button type="button" className="btn btn-secondary" onClick={clearUpdateForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="admin-list">
          <h3 className="admin-list-title">Current Updates</h3>
          {content.updates && content.updates.length === 0 ? (
            <p className="admin-empty">No updates yet.</p>
          ) : (
            <ul className="admin-items">
              {content.updates?.map((update) => (
                <li key={update.id} className="admin-item">
                  {editingUpdateId === update.id ? null : (
                    <>
                      <div className="admin-item-info">
                        <strong>{update.title}</strong>
                        <span className="admin-item-meta">{update.date}</span>
                        {update.content && <p>{update.content}</p>}
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditUpdate(update)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteUpdate(update.id)}>
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

      <section className="admin-home-section">
        <h2 className="admin-section-title">Blog</h2>
        <form className="admin-form" onSubmit={editingBlogId ? handleSaveBlog : handleAddBlog}>
          <label>
            Date <span className="required">*</span>
            <input
              type="date"
              value={blogDate}
              onChange={(e) => setBlogDate(e.target.value)}
              required
            />
          </label>
          <label>
            Title <span className="required">*</span>
            <input
              type="text"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="Blog post title"
              required
            />
          </label>
          <label>
            Excerpt
            <textarea
              value={blogExcerpt}
              onChange={(e) => setBlogExcerpt(e.target.value)}
              placeholder="Short excerpt..."
              rows={3}
            />
          </label>
          <label>
            Link (optional)
            <input
              type="url"
              value={blogLink}
              onChange={(e) => setBlogLink(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editingBlogId ? 'Save Post' : 'Add Post'}
            </button>
            {editingBlogId && (
              <button type="button" className="btn btn-secondary" onClick={clearBlogForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="admin-list">
          <h3 className="admin-list-title">Current Posts</h3>
          {content.blog && content.blog.length === 0 ? (
            <p className="admin-empty">No blog posts yet.</p>
          ) : (
            <ul className="admin-items">
              {content.blog?.map((post) => (
                <li key={post.id} className="admin-item">
                  {editingBlogId === post.id ? null : (
                    <>
                      <div className="admin-item-info">
                        <strong>{post.title}</strong>
                        <span className="admin-item-meta">{post.date}</span>
                        {post.excerpt && <p>{post.excerpt}</p>}
                        {post.link && (
                          <a href={post.link} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                            {post.link}
                          </a>
                        )}
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditBlog(post)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteBlog(post.id)}>
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

      <section className="admin-home-section">
        <h2 className="admin-section-title">Recent Projects</h2>
        <form className="admin-form" onSubmit={editingProjectId ? handleSaveProject : handleAddProject}>
          <label>
            Link to Portfolio Item (optional)
            <select value={projectPortfolioLink} onChange={handlePortfolioLinkChange}>
              <option value="">-- Manual entry --</option>
              {portfolioItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title <span className="required">*</span>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Project name"
              required
            />
          </label>
          <label>
            Description
            <input
              type="text"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Short description"
            />
          </label>
          <label>
            Link <span className="required">*</span>
            <input
              type="url"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              placeholder="https://..."
              required
            />
          </label>
          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              checked={projectFeatured}
              onChange={(e) => setProjectFeatured(e.target.checked)}
            />
            Featured
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editingProjectId ? 'Save Project' : 'Add Project'}
            </button>
            {editingProjectId && (
              <button type="button" className="btn btn-secondary" onClick={clearProjectForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="admin-list">
          <h3 className="admin-list-title">Current Projects</h3>
          {content.recentProjects && content.recentProjects.length === 0 ? (
            <p className="admin-empty">No recent projects yet.</p>
          ) : (
            <ul className="admin-items">
              {content.recentProjects?.map((project) => (
                <li key={project.id} className="admin-item">
                  {editingProjectId === project.id ? null : (
                    <>
                      <div className="admin-item-info">
                        <strong>{project.title}</strong>
                        {project.featured && <span className="admin-badge">Featured</span>}
                        {project.description && <p>{project.description}</p>}
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="admin-item-url">
                          {project.link}
                        </a>
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditProject(project)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteProject(project.id)}>
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

export default function AdminPage() {
  const { items: portfolioItems, loading: portfolioLoading, error: portfolioError, addItem, updateItem, removeItem } = usePortfolio()
  const { content, loading: homeLoading, error: homeError, updateContent, addUpdate, updateUpdate, removeUpdate, addBlogPost, updateBlogPost, removeBlogPost, addRecentProject, updateRecentProject, removeRecentProject } = useHomeContent()
  const { items: redirectItems, loading: redirectsLoading, error: redirectsError, addRedirect, updateRedirect, removeRedirect } = useRedirects()
  const [activeTab, setActiveTab] = useState('portfolio')
  const [loadingSlow, setLoadingSlow] = useState(false)

  const loading = portfolioLoading || homeLoading || redirectsLoading
  const error = portfolioError || homeError || redirectsError

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
        <p className="admin-error">Error loading: {error.message}</p>
        {error.code && <p className="admin-error-code">Code: {error.code}</p>}
      </div>
    )
  }

  return (
    <div className="page admin-page">
      <header className="page-header">
        <h1>Admin</h1>
        <p className="page-subtitle">Manage portfolio and home page content</p>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home Content
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'shortlinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('shortlinks')}
        >
          Shortlinks
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <PortfolioTab
          items={portfolioItems}
          loading={portfolioLoading}
          error={portfolioError}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
        />
      )}

      {activeTab === 'home' && (
        <HomeContentTab
          content={content}
          updateContent={updateContent}
          addUpdate={addUpdate}
          updateUpdate={updateUpdate}
          removeUpdate={removeUpdate}
          addBlogPost={addBlogPost}
          updateBlogPost={updateBlogPost}
          removeBlogPost={removeBlogPost}
          addRecentProject={addRecentProject}
          updateRecentProject={updateRecentProject}
          removeRecentProject={removeRecentProject}
          portfolioItems={portfolioItems}
        />
      )}

      {activeTab === 'shortlinks' && (
        <ShortlinksTab
          items={redirectItems}
          loading={redirectsLoading}
          error={redirectsError}
          addRedirect={addRedirect}
          updateRedirect={updateRedirect}
          removeRedirect={removeRedirect}
        />
      )}
    </div>
  )
}
