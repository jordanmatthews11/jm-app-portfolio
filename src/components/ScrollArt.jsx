import { useEffect, useRef } from 'react'

function useScrollProgress(containerRef) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function update() {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const raw = maxScroll <= 0 ? 0 : scrollY / maxScroll
      const p = Math.max(0, Math.min(1, raw))
      el.style.setProperty('--scroll-p', String(p))
      el.style.setProperty('--scroll-p-2', String(p * 0.7 + 0.15))
      el.style.setProperty('--scroll-p-3', String(1 - p * 0.5))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [containerRef])
}

export default function ScrollArt() {
  const containerRef = useRef(null)
  useScrollProgress(containerRef)

  return (
    <div ref={containerRef} className="scroll-art" aria-hidden="true">
      <div className="scroll-art__layer scroll-art__layer--1" />
      <div className="scroll-art__layer scroll-art__layer--2" />
      <div className="scroll-art__layer scroll-art__layer--3" />
      <div className="scroll-art__layer scroll-art__layer--4" />
      <div className="scroll-art__layer scroll-art__layer--5" />
      <div className="scroll-art__layer scroll-art__layer--6" />
    </div>
  )
}
