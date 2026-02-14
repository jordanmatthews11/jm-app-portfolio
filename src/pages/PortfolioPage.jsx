import { usePortfolio } from '../hooks/usePortfolio'
import { useRedirects } from '../hooks/useRedirects'
import { useHelpfulLinks } from '../hooks/useHelpfulLinks'
import Card from '../components/Card'

export default function PortfolioPage() {
  const { items, loading, error } = usePortfolio()
  const { items: redirectItems } = useRedirects()
  const { items: linkItems } = useHelpfulLinks()

  const shortlinkBase = typeof window !== 'undefined' ? window.location.origin : 'https://jordan-matthews.com'

  return (
    <div className="page portfolio-page">
      <header className="page-header">
        <h1>Vibe-coded apps and experiments</h1>
      </header>
      {loading && <p className="portfolio-loading">Loading…</p>}
      {error && <p className="portfolio-error">Could not load portfolio. Try again later.</p>}
      {!loading && !error && items.length === 0 && (
        <p className="portfolio-empty">No apps yet. Add some in Admin.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="portfolio-grid">
          {items.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              description={item.description || ''}
              url={item.url}
              image={item.image}
              tags={item.tags || []}
            />
          ))}
        </div>
      )}

      {linkItems.length > 0 && (
        <section className="main-section helpful-links-section">
          <h2 className="main-section-title">Helpful Links</h2>
          <ul className="helpful-links-list">
            {linkItems.map((link) => (
              <li key={link.id} className="helpful-link-item">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="helpful-link-anchor">
                  {link.title}
                </a>
                {link.description && <span className="helpful-link-desc">{link.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {redirectItems.length > 0 && (
        <section className="main-section shortlinks-section">
          <h2 className="main-section-title">Shortlinks</h2>
          <ul className="shortlinks-list">
            {redirectItems.map((item) => (
              <li key={item.slug} className="shortlink-item">
                <a
                  href={`${shortlinkBase}/${item.slug}`}
                  className="shortlink-slug"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /{item.slug}
                </a>
                <span className="shortlink-arrow">→</span>
                <a href={item.url} className="shortlink-url" target="_blank" rel="noopener noreferrer">
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="main-section tools-section">
        <h2 className="main-section-title">Tools</h2>
        <p className="placeholder-message">
          Handy stuff—coming soon.
        </p>
      </section>
    </div>
  )
}
