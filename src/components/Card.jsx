import ShareAppMenu from './ShareAppMenu'

export default function Card({ title, description, url, image, tags = [] }) {
  return (
    <div className="card-wrapper">
      <a href={url} target="_blank" rel="noopener noreferrer" className="card">
        {image && (
          <div className="card-image">
            <img src={image} alt="" />
          </div>
        )}
        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          {description && <p className="card-description">{description}</p>}
          <div className="card-footer">
            {tags.length > 0 && (
              <ul className="card-tags">
                {tags.map((tag) => (
                  <li key={tag} className="card-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            <span className="card-arrow">&#8599;</span>
          </div>
        </div>
      </a>
      <ShareAppMenu url={url} title={title} />
    </div>
  )
}
