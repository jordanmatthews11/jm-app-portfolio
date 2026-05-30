import { Link } from 'react-router-dom'
import { useResume } from '../hooks/useResume'
import ResumePreview, { resumeHasContent } from '../components/resume/ResumePreview'

export default function ResumeView() {
  const { resume, loading, error } = useResume()
  const hasContent = resumeHasContent(resume)

  return (
    <div className="resume-view">
      <div className="resume-toolbar">
        <Link to="/" className="btn btn-secondary btn-sm">← Home</Link>
        <div className="resume-toolbar-right">
          <Link to="/admin" className="btn btn-secondary btn-sm">Edit</Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
            disabled={!hasContent}
          >
            Download PDF
          </button>
        </div>
      </div>

      {loading && <p className="portfolio-loading">Loading…</p>}
      {error && <p className="portfolio-error">Could not load resume. Try again later.</p>}

      {!loading && !error && !hasContent && (
        <p className="portfolio-empty">
          No resume yet — build it in <Link to="/admin">Admin → Resume</Link>.
        </p>
      )}

      {!loading && !error && hasContent && <ResumePreview resume={resume} />}
    </div>
  )
}
