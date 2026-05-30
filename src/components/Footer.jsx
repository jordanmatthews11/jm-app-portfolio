export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer
      className="site-footer"
      style={{ backgroundImage: "url('/footer-landscape.jpg')" }}
    >
      <div className="site-footer-inner">
        <div className="site-footer-left">
          <span className="site-footer-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2c3.5 4 3.5 10 0 14-3.5-4-3.5-10 0-14z" />
              <path d="M12 16v6" />
            </svg>
          </span>
          <div>
            <p className="site-footer-title">Always building. Always learning.</p>
            <p className="site-footer-sub">Thanks for stopping by!</p>
          </div>
        </div>
        <div className="site-footer-right">
          <span className="site-footer-copy">© {year} JM</span>
        </div>
      </div>
    </footer>
  )
}
