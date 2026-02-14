import { useEffect, useRef } from 'react'

const RESIZE_THROTTLE_MS = 150

function useScrollProgress(containerRef) {
  const scrollRef = useRef(0)
  const lastPRef = useRef(-1)
  const rafRef = useRef(null)
  const resizeTimeoutRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function applyScroll() {
      rafRef.current = null
      const scrollY = scrollRef.current
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const raw = maxScroll <= 0 ? 0 : scrollY / maxScroll
      const p = Math.max(0, Math.min(1, raw))
      const pRounded = Math.round(p * 10000) / 10000
      if (pRounded === lastPRef.current) return
      lastPRef.current = pRounded
      el.style.setProperty('--scroll-p', String(p))
      el.style.setProperty('--scroll-p-2', String(p * 0.7 + 0.15))
      el.style.setProperty('--scroll-p-3', String(p * 0.4 + 0.3))
      el.style.setProperty('--scroll-p-4', String(p * 0.85 + 0.08))
    }

    function scheduleUpdate() {
      scrollRef.current = window.scrollY
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(applyScroll)
      }
    }

    function onResize() {
      scrollRef.current = window.scrollY
      if (resizeTimeoutRef.current != null) return
      resizeTimeoutRef.current = setTimeout(() => {
        resizeTimeoutRef.current = null
        scheduleUpdate()
      }, RESIZE_THROTTLE_MS)
    }

    lastPRef.current = -1
    applyScroll()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', onResize)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      if (resizeTimeoutRef.current != null) clearTimeout(resizeTimeoutRef.current)
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
      <div className="scroll-art__layer scroll-art__layer--7" />
      <div className="scroll-art__layer scroll-art__layer--8" />
      <div className="scroll-art__layer scroll-art__layer--9" />
      <div className="scroll-art__layer scroll-art__layer--10" />
      <div className="scroll-art__layer scroll-art__layer--11" />
      <div className="scroll-art__layer scroll-art__layer--12" />
    </div>
  )
}
