import { useEffect, useRef, type CSSProperties, type Ref } from 'react'
import { profile } from '@/config/profile'

/** How many copies stack up behind the name to give it depth */
const DEPTH_LAYERS = 16
/** How far it tilts towards the cursor, at the edges of the page (degrees) */
const TILT_X = 8
const TILT_Y = 10

/** The name's words and its round full stop: the first name lighter than the rest */
function NameText() {
  return (
    <>
      {profile.name.split(' ').map((word, i) => (
        <span key={i} className={i === 0 ? 'name-first' : 'name-last'}>
          {word}
        </span>
      ))}
      {/* the full stop, drawn as a round dot (the typeface's own is square) */}
      <span className="name-dot" />
    </>
  )
}

/**
 * The name in 3D: solid letters with depth (darker copies stacked behind the face), tilting to
 * look at the cursor wherever it is on the page and settling back when it leaves. A transform on
 * one element, eased once per frame, so the GPU does the work. Mouse only; still without motion.
 */
function useTiltToCursor() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (!el || !fine || reduce) return
    let mouse: { x: number; y: number } | null = null
    let rx = 0
    let ry = 0
    let frame = 0
    const tick = () => {
      frame = 0
      let tx = 0
      let ty = 0
      if (mouse) {
        // where the cursor is relative to the name, as a share of the page (-1 … 1)
        const r = el.getBoundingClientRect()
        const dx = (mouse.x - (r.left + r.width / 2)) / (innerWidth / 2)
        const dy = (mouse.y - (r.top + r.height / 2)) / (innerHeight / 2)
        tx = -Math.max(-1, Math.min(1, dy)) * TILT_X
        ty = Math.max(-1, Math.min(1, dx)) * TILT_Y
      }
      rx += (tx - rx) * 0.12
      ry += (ty - ry) * 0.12
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      // keep easing until it has settled
      if (Math.abs(tx - rx) > 0.02 || Math.abs(ty - ry) > 0.02) frame = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouse = { x: e.clientX, y: e.clientY }
      kick()
    }
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return
      mouse = null // left the window: back to facing straight ahead
      kick()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onOut)
    }
  }, [])
  return ref
}

/** Name above the closed laptop. Lifts away as the laptop opens (--p). */
export function HeroTitle() {
  const tilt = useTiltToCursor()
  return (
    <div className="hero-title">
      <RoundFilter />
      <p className="hero-eyebrow">{profile.greeting}</p>
      <h1 className="hero-name" aria-label={profile.name}>
        <span className="name-3d" ref={tilt} aria-hidden="true">
          {/* the depth: copies further and further back, each a little darker */}
          {Array.from({ length: DEPTH_LAYERS }, (_, i) => (
            <span
              key={i}
              className="name-depth"
              style={{ '--i': DEPTH_LAYERS - i } as CSSProperties}
            >
              <NameText />
            </span>
          ))}
          <span className="name-face">
            <NameText />
          </span>
        </span>
      </h1>
    </div>
  )
}

/**
 * Rounds off every corner of the letters: blur the shape a little, then cut it back to a hard
 * edge. Straight strokes stay put; sharp corners come back soft and round (see .hero-name).
 */
function RoundFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <filter id="name-round" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="soft" />
        <feColorMatrix
          in="soft"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
        />
      </filter>
    </svg>
  )
}

/** A line of my own under the closed laptop. Fades away with the name as the laptop opens. */
export function HeroQuote() {
  return (
    <figure className="hero-quote">
      {/* broken into its lines here, so every browser shows the same two lines */}
      <blockquote>
        {profile.quote.map((line, i) => (
          <span key={i}>
            {i === 0 && '“'}
            {line}
            {i === profile.quote.length - 1 && '”'}
          </span>
        ))}
      </blockquote>
      <figcaption>— {profile.firstName}</figcaption>
    </figure>
  )
}

/** "Scroll to open" with an animated mouse wheel. Fades as soon as scrolling starts. */
export function ScrollCue({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div className="mb-scroll-hint" ref={ref} aria-hidden="true">
      <div className="cue">
        <span className="cue-mouse">
          <span className="cue-wheel" />
        </span>
        <span className="cue-label">Scroll to open</span>
      </div>
    </div>
  )
}
