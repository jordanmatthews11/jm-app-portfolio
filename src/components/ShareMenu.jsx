import { useState, useRef, useEffect } from 'react'

function getSiteUrl() {
  return window.location.origin
}

export default function ShareMenu() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const url = getSiteUrl()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {
      // fallback or ignore
    }
  }

  function handleText() {
    window.open(`sms:?body=${encodeURIComponent(url)}`, '_blank')
    setOpen(false)
  }

  function handleEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent('Check out this site')}&body=${encodeURIComponent(url)}`
    setOpen(false)
  }

  return (
    <div className="share-menu" ref={menuRef}>
      <button
        type="button"
        className="nav-link share-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Share
      </button>
      {open && (
        <div className="share-dropdown">
          <button type="button" className="share-option" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button type="button" className="share-option" onClick={handleText}>
            Text link
          </button>
          <button type="button" className="share-option" onClick={handleEmail}>
            Email link
          </button>
        </div>
      )}
    </div>
  )
}
