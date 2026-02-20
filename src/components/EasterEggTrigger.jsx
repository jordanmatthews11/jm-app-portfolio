import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import EasterEggGame from './EasterEggGame'

export default function EasterEggTrigger() {
  const [open, setOpen] = useState(false)
  const { isAllowed } = useAuth()

  return (
    <>
      <button
        type="button"
        className="easter-egg-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open secret game"
        title="Something hidden…"
      >
        <span className="easter-egg-trigger-icon" aria-hidden>🥚</span>
      </button>
      {open && <EasterEggGame onClose={() => setOpen(false)} canSubmit={isAllowed} />}
    </>
  )
}
