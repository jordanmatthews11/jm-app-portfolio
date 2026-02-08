import { Link } from 'react-router-dom'
import ScrollArt from '../components/ScrollArt'

export default function HomePage() {
  return (
    <div className="page home-page">
      <ScrollArt />
      <div className="home-scroll-content">
        <section className="home-section home-section--hero">
          <h1>Hey, I'm Jordan</h1>
          <p className="hero-tagline">Builder of vibe-coded apps and small experiments.</p>
        </section>
        <section className="home-section home-section--about">
          <h2>About</h2>
          <p>
            This is my hub—where I keep my portfolio of projects and, eventually, some tools.
            Everything here is made with a mix of curiosity and good vibes.
          </p>
        </section>
        <section className="home-section home-section--middle">
          <p className="home-vibes">Work in progress. Vibes in motion.</p>
        </section>
        <section className="home-section home-section--cta">
          <h2>Explore</h2>
          <div className="cta-links">
            <Link to="/portfolio" className="btn btn-primary">
              See my apps
            </Link>
            <Link to="/tools" className="btn btn-secondary">
              Tools (coming soon)
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
