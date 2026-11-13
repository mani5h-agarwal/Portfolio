import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'

/** iOS's status bar: the time on the left, signal, Wi-Fi and battery on the right */
function StatusBar() {
  return (
    <div className="ip-status" aria-hidden="true">
      <span className="ip-time">9:41</span>
      <span className="ip-status-icons">
        <svg viewBox="0 0 18 12">
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        <svg viewBox="0 0 16 12">
          <path d="M8 2.6c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.8 10.8 0 0 0 8 .8C5.1.8 2.4 1.9.5 3.8l1.2 1.3A9 9 0 0 1 8 2.6zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3A7.2 7.2 0 0 0 8 4.4c-1.9 0-3.6.7-4.9 1.9l1.2 1.3c1-.9 2.3-1.4 3.7-1.4zM8 9.8a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
        </svg>
        <svg viewBox="0 0 27 12">
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="11"
            rx="3.2"
            fill="none"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <path d="M25 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" opacity="0.45" />
        </svg>
      </span>
    </div>
  )
}

/**
 * The colour along a screenshot's top edge, and whether it's light, so the strip above it (behind
 * the status bar) carries on in the same colour and the status bar's text stays readable.
 */
type Tone = { bg: string; light: boolean }
/** each screenshot's top colour, worked out once and remembered */
const TONES = new Map<string, Tone | Promise<Tone | null>>()

function sampleTop(src: string): Promise<Tone | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = 8
        c.height = 1
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, img.naturalWidth, 4, 0, 0, 8, 1)
        const d = ctx.getImageData(0, 0, 8, 1).data
        let r = 0
        let g = 0
        let b = 0
        for (let i = 0; i < d.length; i += 4) {
          r += d[i]
          g += d[i + 1]
          b += d[i + 2]
        }
        const n = d.length / 4
        ;[r, g, b] = [r / n, g / n, b / n]
        resolve({
          bg: `rgb(${r | 0} ${g | 0} ${b | 0})`,
          light: 0.299 * r + 0.587 * g + 0.114 * b > 150,
        })
      } catch {
        resolve(null) // can't read it: keep the default
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * The colour along a screenshot's top edge, and whether it's light, so the strip above it (behind
 * the status bar) carries on in the same colour and the status bar's text stays readable. Sampled
 * once per screenshot, and only when asked for (the current screen and its neighbours).
 */
function useTopColour(src: string | undefined) {
  const cached = src ? TONES.get(src) : undefined
  // already worked out: use it straight away
  const ready = cached && !(cached instanceof Promise) ? cached : null
  const [loaded, setLoaded] = useState<{ src: string; tone: Tone | null } | null>(null)
  useEffect(() => {
    if (!src || ready) return
    let alive = true
    let pending = TONES.get(src)
    if (!(pending instanceof Promise)) {
      pending = sampleTop(src).then((t) => {
        if (t) TONES.set(src, t)
        else TONES.delete(src)
        return t
      })
      TONES.set(src, pending)
    }
    void pending.then((tone) => alive && setLoaded({ src, tone }))
    return () => {
      alive = false
    }
  }, [src, ready])
  return ready ?? (loaded && loaded.src === src ? loaded.tone : null)
}

/** One screen of the carousel: a screenshot under the status bar, `offset` screens from the
 *  current one. Each is placed on its own, exactly a screen apart, so no sliver of the next one
 *  can show along the edge; only the current one and its neighbours are drawn. */
function Shot({
  src,
  full,
  offset,
  dragX,
}: {
  src: string
  full?: boolean
  offset: number
  dragX: number
}) {
  // only the screens that can be seen (this one and its neighbours) need their colour
  const tone = useTopColour(full || Math.abs(offset) > 1 ? undefined : src)
  return (
    <div
      className="ip-shot"
      data-full={full || undefined}
      data-near={Math.abs(offset) <= 1 || undefined}
      style={
        {
          '--top': tone?.bg ?? '#fff',
          // a pixel further out than a screen apart, so a neighbour can never peek in at the edge
          transform: `translateX(calc(${offset * 100}% + ${Math.sign(offset) + dragX}px))`,
        } as CSSProperties
      }
    >
      <img src={src} alt="" draggable={false} loading="lazy" decoding="async" />
    </div>
  )
}

/**
 * An iPhone 17 Pro, drawn in CSS: titanium frame, side buttons, Dynamic Island and glass. It plays
 * `screens` as a carousel (auto-advancing, swipeable), or shows `children` as a live screen.
 * It leans towards the cursor.
 */
export function IPhone({
  screens,
  index = 0,
  onIndex,
  children,
  darkStatus,
}: {
  screens?: { src: string; full?: boolean }[]
  index?: number
  onIndex?: (i: number) => void
  /** a live screen instead of screenshots */
  children?: ReactNode
  /** the live screen is dark: white status bar */
  darkStatus?: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; dx: number; w: number } | null>(null)
  const [dragX, setDragX] = useState(0)
  const count = screens?.length ?? 0
  const current = screens?.[index]
  // a light screen gets a dark status bar, a dark one a white status bar
  const tone = useTopColour(current && !current.full ? current.src : undefined)
  const lightStatus = children
    ? !darkStatus
    : Boolean(current && !current.full && (tone?.light ?? true))

  const onDown = (e: PointerEvent) => {
    if (!count) return
    drag.current = { x: e.clientX, dx: 0, w: track.current?.clientWidth ?? 1 }
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
    if (!d || !onIndex) return
    if (d.dx < -d.w * 0.18 && index < count - 1) onIndex(index + 1)
    else if (d.dx > d.w * 0.18 && index > 0) onIndex(index - 1)
  }

  return (
    <div className="iphone">
      {/* the side buttons: Action and volume on the left, power and Camera Control on the right */}
      <i className="ip-btn ip-action" />
      <i className="ip-btn ip-vol-up" />
      <i className="ip-btn ip-vol-down" />
      <i className="ip-btn ip-power" />
      <i className="ip-btn ip-camera" />

      <div className="ip-body">
        <div
          className="ip-screen"
          data-light-status={lightStatus || undefined}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {children ?? (
            <div ref={track} className="ip-track" data-dragging={dragX !== 0 || undefined}>
              {screens?.map((s, i) => (
                <Shot key={s.src} src={s.src} full={s.full} offset={i - index} dragX={dragX} />
              ))}
            </div>
          )}
          <StatusBar />
          <div className="ip-island" aria-hidden="true" />
          <div className="ip-home" aria-hidden="true" />
          <div className="ip-glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
