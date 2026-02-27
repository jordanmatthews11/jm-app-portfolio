import { useState } from 'react'
import BlockDudeGame from './BlockDudeGame'

export default function BlockDudeTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="block-dude-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open Block Dude game"
        title="Block puzzle…"
      >
        <span className="block-dude-trigger-icon" aria-hidden>🧱</span>
      </button>
      {open && <BlockDudeGame onClose={() => setOpen(false)} />}
    </>
  )
}
