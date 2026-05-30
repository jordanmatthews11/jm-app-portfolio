import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useResume } from '../../hooks/useResume'
import ResumePreview from './ResumePreview'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function defaultResume() {
  return {
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      links: [],
      photo: '',
      summary: '',
    },
    sections: [
      { id: uid(), type: 'experience', title: 'Experience', items: [] },
      { id: uid(), type: 'education', title: 'Education', items: [] },
      { id: uid(), type: 'skills', title: 'Skills', items: [] },
      { id: uid(), type: 'projects', title: 'Projects', items: [] },
    ],
    settings: { template: 'classic', accent: '#6B8A5E', paperSize: 'letter' },
  }
}

function blankItem(type) {
  switch (type) {
    case 'experience':
      return { id: uid(), role: '', company: '', location: '', start: '', end: '', current: false, bullets: [] }
    case 'education':
      return { id: uid(), school: '', degree: '', field: '', start: '', end: '', notes: '' }
    case 'projects':
      return { id: uid(), name: '', url: '', description: '', bullets: [] }
    default:
      return { id: uid() }
  }
}

const AUTOSAVE_MS = 1000

export default function ResumeBuilder() {
  const { resume, loading, error, saveResume } = useResume()
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const hydratedRef = useRef(false)
  const userEditedRef = useRef(false)

  // Hydrate local draft once Firestore has responded.
  useEffect(() => {
    if (hydratedRef.current || loading) return
    setDraft(resume ? { ...defaultResume(), ...resume } : defaultResume())
    hydratedRef.current = true
  }, [resume, loading])

  // Debounced autosave on user edits.
  useEffect(() => {
    if (!hydratedRef.current || !draft || !userEditedRef.current) return
    setStatus('saving')
    const t = setTimeout(async () => {
      try {
        await saveResume(draft)
        setStatus('saved')
      } catch {
        setStatus('idle')
      }
    }, AUTOSAVE_MS)
    return () => clearTimeout(t)
  }, [draft, saveResume])

  function edit(updater) {
    userEditedRef.current = true
    setDraft((prev) => updater(prev))
  }

  function updateBasics(field, value) {
    edit((prev) => ({ ...prev, basics: { ...prev.basics, [field]: value } }))
  }

  function updateSettings(field, value) {
    edit((prev) => ({ ...prev, settings: { ...prev.settings, [field]: value } }))
  }

  function updateSectionTitle(sectionId, title) {
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    }))
  }

  // Links (in basics)
  function addLink() {
    edit((prev) => ({
      ...prev,
      basics: { ...prev.basics, links: [...(prev.basics.links || []), { id: uid(), label: '', url: '' }] },
    }))
  }
  function updateLink(linkId, field, value) {
    edit((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        links: prev.basics.links.map((l) => (l.id === linkId ? { ...l, [field]: value } : l)),
      },
    }))
  }
  function removeLink(linkId) {
    edit((prev) => ({
      ...prev,
      basics: { ...prev.basics, links: prev.basics.links.filter((l) => l.id !== linkId) },
    }))
  }

  // Items within a section
  function addItem(sectionId, type) {
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...(s.items || []), blankItem(type)] } : s
      ),
    }))
  }
  function updateItem(sectionId, itemId, patch) {
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : s
      ),
    }))
  }
  function removeItem(sectionId, itemId) {
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s
      ),
    }))
  }
  function moveItem(sectionId, index, direction) {
    const target = index + direction
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s
        if (target < 0 || target >= s.items.length) return s
        const items = [...s.items]
        ;[items[index], items[target]] = [items[target], items[index]]
        return { ...s, items }
      }),
    }))
  }

  // Skills are edited as one comma-separated field mapped to {id,label} items.
  function updateSkills(sectionId, value) {
    const labels = value.split(',')
    edit((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: labels.map((label) => ({ id: uid(), label })) } : s
      ),
    }))
  }

  if (loading) {
    return <p className="admin-empty">Loading resume…</p>
  }
  if (error) {
    return <p className="admin-error">Could not load resume: {error.message}</p>
  }
  if (!draft) return null

  const statusLabel = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : ''

  return (
    <div className="resume-builder">
      <div className="resume-builder-editor">
        <div className="resume-builder-bar">
          <span className="resume-save-status">{statusLabel}</span>
          <Link to="/resume" className="btn btn-secondary btn-sm">Open full page →</Link>
        </div>

        {/* Basics */}
        <section className="admin-form resume-fieldset">
          <h3 className="admin-form-title">Header</h3>
          <label>
            Full name <span className="required">*</span>
            <input type="text" value={draft.basics.name} onChange={(e) => updateBasics('name', e.target.value)} placeholder="Jordan Matthews" />
          </label>
          <label>
            Headline
            <input type="text" value={draft.basics.headline} onChange={(e) => updateBasics('headline', e.target.value)} placeholder="Product & Operations Leader" />
          </label>
          <div className="resume-field-row">
            <label>
              Email
              <input type="email" value={draft.basics.email} onChange={(e) => updateBasics('email', e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              Phone <span className="hint">(optional)</span>
              <input type="text" value={draft.basics.phone} onChange={(e) => updateBasics('phone', e.target.value)} placeholder="(555) 123-4567" />
            </label>
          </div>
          <label>
            Location <span className="hint">(city, state — avoid full address)</span>
            <input type="text" value={draft.basics.location} onChange={(e) => updateBasics('location', e.target.value)} placeholder="Bentonville, AR" />
          </label>
          <label>
            Photo URL <span className="hint">(optional)</span>
            <input type="url" value={draft.basics.photo} onChange={(e) => updateBasics('photo', e.target.value)} placeholder="https://..." />
          </label>
          <label>
            Summary
            <textarea value={draft.basics.summary} onChange={(e) => updateBasics('summary', e.target.value)} placeholder="2–3 sentences about who you are and what you do." />
          </label>

          <div className="resume-links">
            <div className="resume-links-head">
              <span>Links</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addLink}>+ Add link</button>
            </div>
            {(draft.basics.links || []).map((l) => (
              <div key={l.id} className="resume-link-row">
                <input type="text" value={l.label} onChange={(e) => updateLink(l.id, 'label', e.target.value)} placeholder="LinkedIn" />
                <input type="url" value={l.url} onChange={(e) => updateLink(l.id, 'url', e.target.value)} placeholder="https://linkedin.com/in/…" />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeLink(l.id)}>✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* Sections */}
        {draft.sections.map((section) => (
          <section key={section.id} className="admin-form resume-fieldset">
            <label className="resume-section-title-field">
              Section title
              <input type="text" value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} />
            </label>

            {section.type === 'skills' ? (
              <label>
                Skills <span className="hint">(comma-separated)</span>
                <textarea
                  value={(section.items || []).map((i) => i.label).join(', ')}
                  onChange={(e) => updateSkills(section.id, e.target.value)}
                  placeholder="Leadership, Forecasting, SQL, Figma, Retail Analytics"
                />
              </label>
            ) : (
              <>
                {(section.items || []).map((item, index) => (
                  <div key={item.id} className="resume-item-card">
                    <div className="resume-item-controls">
                      <div className="admin-reorder-buttons">
                        <button type="button" className="btn-reorder" onClick={() => moveItem(section.id, index, -1)} disabled={index === 0} title="Move up">▲</button>
                        <button type="button" className="btn-reorder" onClick={() => moveItem(section.id, index, 1)} disabled={index === section.items.length - 1} title="Move down">▼</button>
                      </div>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(section.id, item.id)}>Remove</button>
                    </div>

                    {section.type === 'experience' && (
                      <>
                        <div className="resume-field-row">
                          <label>Role<input type="text" value={item.role} onChange={(e) => updateItem(section.id, item.id, { role: e.target.value })} placeholder="Director of Operations" /></label>
                          <label>Company<input type="text" value={item.company} onChange={(e) => updateItem(section.id, item.id, { company: e.target.value })} placeholder="Storesight" /></label>
                        </div>
                        <div className="resume-field-row">
                          <label>Location<input type="text" value={item.location} onChange={(e) => updateItem(section.id, item.id, { location: e.target.value })} placeholder="Remote" /></label>
                          <label>Start<input type="text" value={item.start} onChange={(e) => updateItem(section.id, item.id, { start: e.target.value })} placeholder="Jan 2022" /></label>
                          <label>End<input type="text" value={item.end} onChange={(e) => updateItem(section.id, item.id, { end: e.target.value })} placeholder="May 2024" disabled={item.current} /></label>
                        </div>
                        <label className="admin-checkbox-label">
                          <input type="checkbox" checked={!!item.current} onChange={(e) => updateItem(section.id, item.id, { current: e.target.checked })} />
                          Current role
                        </label>
                        <label>
                          Highlights <span className="hint">(one per line)</span>
                          <textarea value={(item.bullets || []).join('\n')} onChange={(e) => updateItem(section.id, item.id, { bullets: e.target.value.split('\n') })} placeholder={'Led a team of 8…\nGrew revenue 35%…'} />
                        </label>
                      </>
                    )}

                    {section.type === 'education' && (
                      <>
                        <div className="resume-field-row">
                          <label>School<input type="text" value={item.school} onChange={(e) => updateItem(section.id, item.id, { school: e.target.value })} placeholder="University of Arkansas" /></label>
                          <label>Degree<input type="text" value={item.degree} onChange={(e) => updateItem(section.id, item.id, { degree: e.target.value })} placeholder="B.S." /></label>
                        </div>
                        <div className="resume-field-row">
                          <label>Field<input type="text" value={item.field} onChange={(e) => updateItem(section.id, item.id, { field: e.target.value })} placeholder="Business" /></label>
                          <label>Start<input type="text" value={item.start} onChange={(e) => updateItem(section.id, item.id, { start: e.target.value })} placeholder="2014" /></label>
                          <label>End<input type="text" value={item.end} onChange={(e) => updateItem(section.id, item.id, { end: e.target.value })} placeholder="2018" /></label>
                        </div>
                        <label>Notes <span className="hint">(optional)</span><input type="text" value={item.notes} onChange={(e) => updateItem(section.id, item.id, { notes: e.target.value })} placeholder="Honors, GPA, activities" /></label>
                      </>
                    )}

                    {section.type === 'projects' && (
                      <>
                        <div className="resume-field-row">
                          <label>Name<input type="text" value={item.name} onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })} placeholder="Block Dude" /></label>
                          <label>Link<input type="url" value={item.url} onChange={(e) => updateItem(section.id, item.id, { url: e.target.value })} placeholder="https://…" /></label>
                        </div>
                        <label>Description<input type="text" value={item.description} onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })} placeholder="One-line description" /></label>
                        <label>
                          Highlights <span className="hint">(one per line)</span>
                          <textarea value={(item.bullets || []).join('\n')} onChange={(e) => updateItem(section.id, item.id, { bullets: e.target.value.split('\n') })} placeholder={'Built with React…\nShipped to production…'} />
                        </label>
                      </>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem(section.id, section.type)}>
                  + Add {section.type === 'experience' ? 'role' : section.type === 'education' ? 'school' : 'project'}
                </button>
              </>
            )}
          </section>
        ))}

        {/* Settings */}
        <section className="admin-form resume-fieldset">
          <h3 className="admin-form-title">Style</h3>
          <div className="resume-field-row">
            <label>
              Accent color
              <input type="color" value={draft.settings.accent} onChange={(e) => updateSettings('accent', e.target.value)} />
            </label>
            <label>
              Paper size
              <select value={draft.settings.paperSize} onChange={(e) => updateSettings('paperSize', e.target.value)}>
                <option value="letter">US Letter</option>
                <option value="a4">A4</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      <div className="resume-builder-preview">
        <div className="resume-preview-scroll">
          <ResumePreview resume={draft} />
        </div>
      </div>
    </div>
  )
}
