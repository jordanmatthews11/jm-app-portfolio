// Pure presentational render of resume data into a formatted "paper".
// Shared by the Admin builder's live preview and the /resume page.

function formatDateRange(start, end, current) {
  const left = (start || '').trim()
  const right = current ? 'Present' : (end || '').trim()
  if (left && right) return `${left} – ${right}`
  return left || right || ''
}

function Bullets({ bullets }) {
  const list = (bullets || []).filter((b) => b && b.trim())
  if (list.length === 0) return null
  return (
    <ul className="resume-bullets">
      {list.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

function ExperienceItem({ item }) {
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <span className="resume-entry-title">
          {item.role}
          {item.role && item.company ? ' · ' : ''}
          {item.company}
        </span>
        <span className="resume-entry-dates">
          {formatDateRange(item.start, item.end, item.current)}
        </span>
      </div>
      {item.location && <div className="resume-entry-sub">{item.location}</div>}
      <Bullets bullets={item.bullets} />
    </div>
  )
}

function EducationItem({ item }) {
  const titleParts = [item.degree, item.field].filter(Boolean).join(', ')
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <span className="resume-entry-title">{titleParts || item.school}</span>
        <span className="resume-entry-dates">
          {formatDateRange(item.start, item.end, false)}
        </span>
      </div>
      {titleParts && item.school && <div className="resume-entry-sub">{item.school}</div>}
      {item.notes && <p className="resume-entry-notes">{item.notes}</p>}
    </div>
  )
}

function ProjectItem({ item }) {
  return (
    <div className="resume-entry">
      <div className="resume-entry-head">
        <span className="resume-entry-title">{item.name}</span>
      </div>
      {item.url && (
        <a className="resume-entry-link" href={item.url} target="_blank" rel="noopener noreferrer">
          {item.url}
        </a>
      )}
      {item.description && <p className="resume-entry-notes">{item.description}</p>}
      <Bullets bullets={item.bullets} />
    </div>
  )
}

function sectionHasContent(section) {
  const items = section.items || []
  if (section.type === 'skills') {
    return items.some((i) => i.label && i.label.trim())
  }
  if (section.type === 'experience') {
    return items.some((i) => i.role || i.company || (i.bullets || []).some((b) => b && b.trim()))
  }
  if (section.type === 'education') {
    return items.some((i) => i.school || i.degree || i.field)
  }
  if (section.type === 'projects') {
    return items.some((i) => i.name || i.description || (i.bullets || []).some((b) => b && b.trim()))
  }
  return items.length > 0
}

function ResumeSection({ section }) {
  if (!sectionHasContent(section)) return null
  const items = section.items || []

  if (section.type === 'skills') {
    const labels = items.map((i) => i.label).filter((l) => l && l.trim())
    return (
      <section className="resume-section">
        <h2 className="resume-section-title">{section.title || 'Skills'}</h2>
        <p className="resume-skills">{labels.join('  ·  ')}</p>
      </section>
    )
  }

  return (
    <section className="resume-section">
      <h2 className="resume-section-title">{section.title}</h2>
      {items.map((item) => {
        if (section.type === 'experience') return <ExperienceItem key={item.id} item={item} />
        if (section.type === 'education') return <EducationItem key={item.id} item={item} />
        if (section.type === 'projects') return <ProjectItem key={item.id} item={item} />
        return null
      })}
    </section>
  )
}

export function resumeHasContent(resume) {
  if (!resume) return false
  const basics = resume.basics || {}
  if (basics.name && basics.name.trim()) return true
  if (basics.summary && basics.summary.trim()) return true
  return (resume.sections || []).some(sectionHasContent)
}

export default function ResumePreview({ resume }) {
  if (!resume) return null
  const basics = resume.basics || {}
  const sections = resume.sections || []
  const settings = resume.settings || {}
  const accent = settings.accent || '#6B8A5E'
  const paperClass = settings.paperSize === 'a4' ? 'resume-paper resume-paper--a4' : 'resume-paper'
  const links = (basics.links || []).filter((l) => l && (l.url || l.label))

  return (
    <div className={paperClass} style={{ '--resume-accent': accent }}>
      <header className="resume-head">
        {basics.photo && <img className="resume-photo" src={basics.photo} alt="" />}
        <div className="resume-head-text">
          <h1 className="resume-name">{basics.name || 'Your Name'}</h1>
          {basics.headline && <p className="resume-headline">{basics.headline}</p>}
          <ul className="resume-contact">
            {basics.email && <li>{basics.email}</li>}
            {basics.phone && <li>{basics.phone}</li>}
            {basics.location && <li>{basics.location}</li>}
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label || l.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {basics.summary && basics.summary.trim() && (
        <section className="resume-section">
          <h2 className="resume-section-title">Summary</h2>
          <p className="resume-summary">{basics.summary}</p>
        </section>
      )}

      {sections.map((section) => (
        <ResumeSection key={section.id} section={section} />
      ))}
    </div>
  )
}
