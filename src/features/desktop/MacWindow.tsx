import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

/**
 * A Safari window on a Mac, for a project made for the desktop: traffic lights, back and forward,
 * the address in the middle, and the page below. It plays `screens` as a carousel (auto-advancing
 * from outside, swipeable here), each screen placed on its own a pixel more than a screen apart.
 */
export function MacWindow({
  screens,
  index,
  onIndex,
  title,
}: {
  screens: { src: string }[]
  index: number
  onIndex: (i: number) => void
  /** what the address bar shows */
  title: string
}) {
  const page = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; dx: number; w: number } | null>(null)
  const [dragX, setDragX] = useState(0)
  const count = screens.length

  const onDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, dx: 0, w: page.current?.clientWidth ?? 1 }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag.current) return
    drag.current.dx = e.clientX - drag.current.x
    setDragX(drag.current.dx)
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    setDragX(0)
    if (!d) return
    if (d.dx < -d.w * 0.15 && index < count - 1) onIndex(index + 1)
    else if (d.dx > d.w * 0.15 && index > 0) onIndex(index - 1)
  }

  return (
    <div className="macwin">
      <div className="macwin-bar" aria-hidden="true">
        <span className="macwin-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="macwin-nav">
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
        <span className="macwin-address">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          {title}
        </span>
      </div>

      <div
        ref={page}
        className="macwin-page"
        data-dragging={dragX !== 0 || undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {screens.map((s, i) => {
          const offset = i - index
          return (
            <img
              key={s.src}
              src={s.src}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              data-near={Math.abs(offset) <= 1 || undefined}
              style={
                {
                  transform: `translateX(calc(${offset * 100}% + ${Math.sign(offset) + dragX}px))`,
                } as CSSProperties
              }
            />
          )
        })}
      </div>
    </div>
  )
}
