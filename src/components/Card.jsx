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
          <p className="card-description">{description}</p>
          {tags.length > 0 && (
            <ul className="card-tags">
              {tags.map((tag) => (
                <li key={tag} className="card-tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </a>
      <ShareAppMenu url={url} title={title} />
    </div>
  )
}
