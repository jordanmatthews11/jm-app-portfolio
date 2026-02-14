import { usePortfolio } from '../hooks/usePortfolio'
import Card from '../components/Card'

export default function PortfolioPage() {
  const { items, loading, error } = usePortfolio()

  return (
    <div className="page portfolio-page">
      <header className="page-header">
        <h1>Portfolio</h1>
        <p className="page-subtitle">Vibe-coded apps and experiments</p>
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

      <section className="tools-section">
        <header className="page-header">
          <h2>Tools</h2>
          <p className="page-subtitle">Handy stuff—coming soon.</p>
        </header>
        <p className="placeholder-message">
          Drop your tools here when you're ready.
        </p>
      </section>
    </div>
  )
}
