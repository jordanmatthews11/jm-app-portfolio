import ShareAppMenu from './ShareAppMenu'

export default function Card({ title, description, url, image, tags = [] }) {
  const initial = (title || '?').trim().charAt(0).toUpperCase()
  return (
    <div className="card-wrapper">
      <a href={url} target="_blank" rel="noopener noreferrer" className="card">
        <div className="card-icon" aria-hidden="true">
          {image ? <img src={image} alt="" /> : <span className="card-icon-initial">{initial}</span>}
        </div>
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          {description && <p className="card-description">{description}</p>}
          {tags.length > 0 && (
            <ul className="card-tags">
              {tags.map((tag) => (
                <li key={tag} className="card-tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <span className="card-cta">
            Explore <span className="card-cta-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </a>
      <ShareAppMenu url={url} title={title} />
    </div>
  )
}
