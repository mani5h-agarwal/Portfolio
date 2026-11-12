import { useEffect, useRef } from 'react'

/**
 * ✦ Polish: a soft, warm light that follows the mouse over the dark page, like holding a torch.
 * (MatrixRain brightens the glyphs that fall inside it.) Moved with a transform once per frame, so
 * the GPU does the work. Mouse only, and hidden while an app is open.
 */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return
    let x = 0
    let y = 0
    let frame = 0
    const place = () => {
      frame = 0
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.parentElement?.getBoundingClientRect()
      x = e.clientX - (r?.left ?? 0)
      y = e.clientY - (r?.top ?? 0)
      el.classList.add('is-on')
      if (!frame) frame = requestAnimationFrame(place)
    }
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) el.classList.remove('is-on') // left the window
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return <div ref={ref} className="mb-torch" aria-hidden="true" />
}
