import { Link } from 'react-router-dom'
import ScrollArt from '../components/ScrollArt'
import { useHomeContent } from '../hooks/useHomeContent'

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

export default function HomePage() {
  const { content, loading } = useHomeContent()

  if (loading) {
    return (
      <div className="page home-page">
        <ScrollArt />
        <div className="home-scroll-content">
          <section className="home-section home-section--hero">
            <p className="page-subtitle">Loading…</p>
          </section>
        </div>
      </div>
    )
  }

  const hero = content.hero || {}
  const about = content.about || {}
  const updates = content.updates || []
  const blog = content.blog || []
  const recentProjects = content.recentProjects || []

  return (
    <div className="page home-page">
      <ScrollArt />
      <div className="home-scroll-content">
        <section className="home-section home-section--hero">
          {hero.title && <h1>{hero.title}</h1>}
          {hero.tagline && <p className="hero-tagline">{hero.tagline}</p>}
        </section>

        {about.heading && about.bio && (
          <section className="home-section home-section--about">
            {about.heading && <h2>{about.heading}</h2>}
            {about.bio && (
              <div className="home-bio">
                {about.bio.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {updates.length > 0 && (
          <section className="home-section home-section--updates">
            <h2>Updates</h2>
            <ul className="home-updates">
              {updates.map((update) => (
                <li key={update.id} className="home-update">
                  <div className="home-update-header">
                    <h3 className="home-update-title">{update.title}</h3>
                    {update.date && <time className="home-update-date">{formatDate(update.date)}</time>}
                  </div>
                  {update.content && <p className="home-update-content">{update.content}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {blog.length > 0 && (
          <section className="home-section home-section--blog">
            <h2>Blog</h2>
            <ul className="home-blog">
              {blog.map((post) => (
                <li key={post.id} className="home-blog-post">
                  <div className="home-blog-header">
                    <h3 className="home-blog-title">
                      {post.link ? (
                        <a href={post.link} target="_blank" rel="noopener noreferrer">
                          {post.title}
                        </a>
                      ) : (
                        post.title
                      )}
                    </h3>
                    {post.date && <time className="home-blog-date">{formatDate(post.date)}</time>}
                  </div>
                  {post.excerpt && <p className="home-blog-excerpt">{post.excerpt}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recentProjects.length > 0 && (
          <section className="home-section home-section--projects">
            <h2>Recent Projects</h2>
            <ul className="home-recent-projects">
              {recentProjects.map((project) => (
                <li key={project.id} className="home-project">
                  <h3 className="home-project-title">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      {project.title}
                    </a>
                    {project.featured && <span className="home-project-badge">Featured</span>}
                  </h3>
                  {project.description && <p className="home-project-description">{project.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

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
