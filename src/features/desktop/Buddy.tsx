import { memo, useEffect, useId, useRef } from 'react'
import { activeLoop } from '../macbook/activeLoop'

/**
 * A little kitty-blob living on the Mac's desktop. Its big eyes chase the cursor wherever it is
 * on the page, and it reacts to what you do:
 *   idle     – watches the cursor, blinks now and then, leans towards it
 *   near     – the cursor comes close: sparkly, excited eyes
 *   happy    – the cursor is on it, or you click it: ^ ^ eyes, a grin and floating hearts
 *   wow      – the cursor zooms across the page: wide eyes, "o" mouth, a hop
 *   dizzy    – the cursor goes round and round: spinning spiral eyes and a wobble
 *   typing   – you're typing: it looks down at the keyboard
 *   sleepy   – nothing has moved for a while: droopy eyes… then asleep (z z)
 *   startled – woken up by the cursor: "!" and a jump
 *
 * Everything moves in one requestAnimationFrame loop that writes SVG attributes directly, so it
 * never re-renders React and costs next to nothing.
 */
type Mood =
  'idle' | 'near' | 'happy' | 'wow' | 'dizzy' | 'typing' | 'sleepy' | 'asleep' | 'startled'

const EYES = [
  { x: 52, y: 76 },
  { x: 88, y: 76 },
] as const
const PUPIL_X = 9 // how far a pupil can travel inside its eye (SVG units)
const PUPIL_Y = 7
const FACE_X = 7 // and how far the whole face shifts the same way
const FACE_Y = 5
const SLEEPY_AFTER = 2000
const ASLEEP_AFTER = 4000

const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** an Archimedean spiral centred on (cx, cy): the dizzy eyes */
function spiral(cx: number, cy: number, r: number) {
  const pts: string[] = []
  const turns = 2.6
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const a = t * turns * Math.PI * 2
    pts.push(`${(cx + Math.cos(a) * r * t).toFixed(2)} ${(cy + Math.sin(a) * r * t).toFixed(2)}`)
  }
  return `M${pts.join(' L')}`
}

/** Memoised: it never changes, so typing (which re-renders the laptop) skips it. */
export const Buddy = memo(function Buddy({ className = '' }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null)
  const uid = useId().replace(/:/g, '')

  useEffect(() => {
    const svg = root.current
    if (!svg) return
    const q = <T extends Element>(s: string) => [...svg.querySelectorAll<T>(s)]
    const blinkers = q<SVGGElement>('.buddy-eye')
    const pupils = q<SVGGElement>('.buddy-pupil')
    const face = svg.querySelector<SVGGElement>('.buddy-face')
    const lean = svg.querySelector<SVGGElement>('.buddy-lean')
    const hop = svg.querySelector<SVGGElement>('.buddy-hop')
    const hearts = q<SVGPathElement>('.buddy-heart')
    const bang = svg.querySelector<SVGTextElement>('.buddy-bang')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const now = () => performance.now()

    let mx = innerWidth / 2
    let my = innerHeight / 2
    let px = mx
    let py = my
    let hasPointer = false
    let speed = 0
    let lastMove = now()
    let hover = false
    let happyUntil = 0
    let wowUntil = 0
    let dizzyUntil = 0
    let typingUntil = 0
    let startledUntil = 0
    let blinkAt = now() + 1800
    let blinkStart = -1
    // circling detection: the cursor's path over the last moment, in steps of at least STEP px
    const STEP = 14
    const WINDOW = 1500 // ms
    let anchor = { x: mx, y: my }
    let heading: number | null = null
    let path: { t: number; x: number; y: number; turn: number }[] = []
    let box: DOMRect | null = null
    let boxAt = 0
    let fx = 0
    let fy = 0
    let pxs = 0
    let pys = 0
    let tilt = 0
    let open = 1 // how open the eyes are: 1 open, 0 shut
    let mood: Mood = 'idle'

    const animate = (el: Element | null | undefined, frames: Keyframe[], ms: number) => {
      if (!reduce && el && 'animate' in el) el.animate(frames, { duration: ms, easing: 'ease-out' })
    }
    const jump = (height: number) =>
      animate(
        hop,
        [
          { transform: 'translateY(0) scale(1, 1)' },
          { transform: 'translateY(0) scale(1.12, 0.86)', offset: 0.15 },
          { transform: `translateY(${-height}px) scale(0.93, 1.08)`, offset: 0.45 },
          { transform: 'translateY(0) scale(1.08, 0.92)', offset: 0.78 },
          { transform: 'translateY(0) scale(1, 1)' },
        ],
        580,
      )
    const love = () =>
      hearts.forEach((h, i) =>
        animate(
          h,
          [
            { opacity: 0, transform: 'translate(0, 0) scale(0.4)' },
            { opacity: 1, transform: `translate(${i ? 6 : -6}px, -10px) scale(1)`, offset: 0.3 },
            { opacity: 0, transform: `translate(${i ? 12 : -12}px, -34px) scale(0.8)` },
          ],
          1100 + i * 200,
        ),
      )

    const onMove = (e: PointerEvent) => {
      const t = now()
      mx = e.clientX
      my = e.clientY
      hasPointer = true
      // woken up by the cursor
      if (mood === 'asleep') {
        startledUntil = t + 900
        jump(18)
        animate(
          bang,
          [
            { opacity: 0, transform: 'translateY(6px) scale(0.5)' },
            { opacity: 1, transform: 'translateY(0) scale(1.2)', offset: 0.25 },
            { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.8 },
            { opacity: 0, transform: 'translateY(-4px) scale(1)' },
          ],
          900,
        )
      }
      lastMove = t
      if (t > dizzyUntil + 3000) checkCircling(t)
    }

    /**
     * Dizzy only from real circles: over the last 1.5 s the cursor's heading must have turned
     * through at least one and a half loops, nearly all in the same direction (zig-zags and wiggles
     * cancel out), around a roughly round path of a decent size.
     */
    const checkCircling = (t: number) => {
      const dx = mx - anchor.x
      const dy = my - anchor.y
      if (Math.hypot(dx, dy) < STEP) return // ignore jitter: wait for a proper stretch of path
      anchor = { x: mx, y: my }
      const h = Math.atan2(dy, dx)
      let d = 0
      if (heading !== null) {
        d = h - heading
        if (d > Math.PI) d -= 2 * Math.PI
        if (d < -Math.PI) d += 2 * Math.PI
      }
      heading = h
      path.push({ t, x: mx, y: my, turn: d })
      path = path.filter((p) => t - p.t < WINDOW)
      if (path.length < 10) return

      let net = 0
      let total = 0
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const p of path) {
        net += p.turn
        total += Math.abs(p.turn)
        x0 = Math.min(x0, p.x)
        x1 = Math.max(x1, p.x)
        y0 = Math.min(y0, p.y)
        y1 = Math.max(y1, p.y)
      }
      const w = x1 - x0
      const hgt = y1 - y0
      const round = w > 70 && hgt > 70 && w / hgt > 0.4 && w / hgt < 2.5
      if (Math.abs(net) > 3 * Math.PI && Math.abs(net) / total > 0.8 && round) {
        dizzyUntil = t + 1300
        path = []
        heading = null
      }
    }
    const onKey = () => {
      typingUntil = now() + 1100
      lastMove = now()
    }
    const onDirty = () => {
      boxAt = 0
    }
    const onEnter = () => {
      hover = true
      love()
    }
    const onLeave = () => {
      hover = false
    }
    const onDown = () => {
      happyUntil = now() + 1500
      lastMove = now()
      jump(18)
      love()
    }
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) hasPointer = false // left the window
    }

    /** Sets an SVG attribute only when it changes: an unchanged write still repaints the screen. */
    const written = new WeakMap<Element, string>()
    const setT = (el: Element | null | undefined, value: string) => {
      if (!el || written.get(el) === value) return
      written.set(el, value)
      el.setAttribute('transform', value)
    }
    // not while the Mac is asleep (lid shut) or an app covers the screen
    const offScreen = () => !!svg.closest('[data-asleep], [data-app-open]')

    const tick = () => {
      const t = now()
      // where it is on the page (re-measured a few times a second, or after scrolling)
      if (t - boxAt > 300) {
        box = svg.getBoundingClientRect()
        boxAt = t
      }
      if (!box || box.bottom < 0 || box.top > innerHeight) return

      // how fast the cursor is moving (smoothed)
      const moved = Math.hypot(mx - px, my - py)
      px = mx
      py = my
      speed = lerp(speed, moved, 0.2)
      if (hasPointer && speed > 40 && t > wowUntil + 500 && t > dizzyUntil) {
        wowUntil = t + 750
        jump(8)
      }

      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.6
      const dist = Math.hypot(mx - cx, my - cy)
      const idleFor = t - lastMove
      const next: Mood =
        t < startledUntil
          ? 'startled'
          : t < dizzyUntil
            ? 'dizzy'
            : hover || t < happyUntil
              ? 'happy'
              : t < wowUntil
                ? 'wow'
                : t < typingUntil
                  ? 'typing'
                  : idleFor > ASLEEP_AFTER
                    ? 'asleep'
                    : idleFor > SLEEPY_AFTER
                      ? 'sleepy'
                      : hasPointer && dist < box.width * 1.6
                        ? 'near'
                        : 'idle'
      if (next !== mood) {
        mood = next
        svg.dataset.mood = mood
      }

      // what it looks at: the cursor, the keyboard while you type, nothing while dozing/dizzy
      const look =
        mood === 'typing'
          ? { x: cx, y: box.bottom + 600 }
          : mood === 'asleep' || mood === 'dizzy'
            ? null
            : { x: mx, y: my }
      let ux = 0
      let uy = 0.3
      let reach = 0
      if (look) {
        const dx = look.x - cx
        const dy = look.y - cy
        const d = Math.hypot(dx, dy) || 1
        reach = Math.min(1, d / 90)
        ux = dx / d
        uy = dy / d
      }
      const k = reduce ? 0.5 : 0.25
      fx = lerp(fx, ux * reach * FACE_X, k)
      fy = lerp(fy, uy * reach * FACE_Y, k)
      pxs = lerp(pxs, ux * reach * PUPIL_X, k)
      pys = lerp(pys, uy * reach * PUPIL_Y, k)
      setT(face, `translate(${fx.toFixed(1)} ${fy.toFixed(1)})`)
      pupils.forEach((p) => setT(p, `translate(${pxs.toFixed(1)} ${pys.toFixed(1)})`))

      // eyes: droopy when sleepy, plus the odd blink
      open = lerp(open, mood === 'sleepy' ? 0.4 : 1, 0.08)
      if (t > blinkAt) {
        blinkStart = t
        // sometimes a quick double blink
        blinkAt = t + (Math.random() < 0.2 ? 280 : 2200 + Math.random() * 4000)
      }
      const b = (t - blinkStart) / 170
      const s = b >= 0 && b < 1 ? open * (1 - 0.94 * Math.sin(b * Math.PI)) : open
      EYES.forEach((e, i) =>
        setT(
          blinkers[i],
          `translate(${e.x} ${e.y}) scale(1 ${s.toFixed(2)}) translate(${-e.x} ${-e.y})`,
        ),
      )

      // leans towards the cursor
      const lt = look && !reduce ? clamp((look.x - cx) / 30, -11, 11) : 0
      tilt = lerp(tilt, lt, 0.1)
      setT(lean, `rotate(${tilt.toFixed(1)} 70 120)`)
    }

    svg.dataset.mood = mood
    // runs only while it can be seen: no frames at all while the lid is shut or an app is open
    const stopLoop = activeLoop(() => !offScreen(), tick)
    const hit = svg.querySelector('.buddy-hit')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onDirty, { passive: true })
    window.addEventListener('resize', onDirty)
    hit?.addEventListener('pointerenter', onEnter)
    hit?.addEventListener('pointerleave', onLeave)
    hit?.addEventListener('pointerdown', onDown)
    return () => {
      stopLoop()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onOut)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onDirty)
      window.removeEventListener('resize', onDirty)
      hit?.removeEventListener('pointerenter', onEnter)
      hit?.removeEventListener('pointerleave', onLeave)
      hit?.removeEventListener('pointerdown', onDown)
    }
  }, [])

  const heart = (x: number, y: number) =>
    `M${x} ${y + 4} C ${x - 7} ${y - 1} ${x - 5} ${y - 7} ${x} ${y - 3} C ${x + 5} ${y - 7} ${x + 7} ${y - 1} ${x} ${y + 4} Z`

  return (
    <svg ref={root} className={`buddy ${className}`} viewBox="0 0 140 130" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-body`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fdf8ff" />
          <stop offset="1" stopColor="#dccdf7" />
        </radialGradient>
      </defs>

      {/* its shadow on the bottom of the screen */}
      <ellipse className="buddy-shadow" cx="70" cy="122" rx="44" ry="5" />

      <g className="buddy-hop">
        <g className="buddy-breathe">
          <g className="buddy-wobble">
            <g className="buddy-lean">
              {/* ears */}
              <path d="M30 60 C 26 40 30 22 38 14 C 48 18 58 28 62 36 Z" fill="#efe6fd" />
              <path d="M110 60 C 114 40 110 22 102 14 C 92 18 82 28 78 36 Z" fill="#efe6fd" />
              <path d="M36 44 C 35 34 37 26 40 22 C 46 25 51 30 54 35 Z" fill="#ffb3cf" />
              <path d="M104 44 C 105 34 103 26 100 22 C 94 25 89 30 86 35 Z" fill="#ffb3cf" />

              {/* body: a soft round blob */}
              <path
                className="buddy-hit"
                d="M70 28 C 104 28 124 52 124 84 C 124 109 102 120 70 120 C 38 120 16 109 16 84 C 16 52 36 28 70 28 Z"
                fill={`url(#${uid}-body)`}
                stroke="#cbb8f2"
                strokeWidth="1"
              />
              <ellipse cx="44" cy="48" rx="9" ry="5" fill="#fff" transform="rotate(-32 44 48)" />

              {/* the face shifts as one towards whatever it looks at */}
              <g className="buddy-face">
                <ellipse className="buddy-cheek" cx="34" cy="92" rx="8" ry="4.5" />
                <ellipse className="buddy-cheek" cx="106" cy="92" rx="8" ry="4.5" />

                {EYES.map((e, i) => (
                  <g key={i}>
                    {/* open eye: a big shiny pupil that chases the cursor */}
                    <g className="buddy-eye">
                      <g className="buddy-eye-open">
                        <g>
                          <g className="buddy-pupil">
                            <g
                              className="buddy-pupil-size"
                              style={{ transformOrigin: `${e.x}px ${e.y}px` }}
                            >
                              <circle cx={e.x} cy={e.y} r="8.5" fill="#2a2140" />
                              <circle cx={e.x - 3} cy={e.y - 3.5} r="3" fill="#fff" />
                              <circle cx={e.x + 3} cy={e.y + 3} r="1.3" fill="#fff" />
                              {/* sparkles when excited */}
                              <path
                                className="buddy-sparkle"
                                d={`M${e.x + 2} ${e.y - 6} l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z`}
                                fill="#fff"
                              />
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                    {/* dizzy: a spinning spiral */}
                    <g className="buddy-spiral" style={{ transformOrigin: `${e.x}px ${e.y}px` }}>
                      <path
                        d={spiral(e.x, e.y, 10)}
                        fill="none"
                        stroke="#2a2140"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                    {/* happy: ^ */}
                    <path
                      className="buddy-arc buddy-happy-eye"
                      d={`M${e.x - 9} ${e.y + 3} Q${e.x} ${e.y - 9} ${e.x + 9} ${e.y + 3}`}
                    />
                    {/* asleep: ‿ */}
                    <path
                      className="buddy-arc buddy-closed-eye"
                      d={`M${e.x - 9} ${e.y} Q${e.x} ${e.y + 7} ${e.x + 9} ${e.y}`}
                    />
                  </g>
                ))}

                {/* mouths, one per mood */}
                <path className="buddy-mouth m-cat" d="M63 95 Q66.5 99 70 95 Q73.5 99 77 95" />
                <path className="buddy-mouth m-grin" d="M62 93 Q70 106 78 93 Z" />
                <ellipse className="buddy-mouth m-wow" cx="70" cy="98" rx="4" ry="5" />
                <path className="buddy-mouth m-wavy" d="M61 97 Q64.5 94 68 97 T75 97 T82 97" />
                <path className="buddy-mouth m-sleep" d="M66 97 Q70 99 74 97" />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* hearts (hover / click), "!" (woken up) and z z (asleep) */}
      <path className="buddy-heart" d={heart(30, 34)} />
      <path className="buddy-heart" d={heart(110, 30)} />
      <text className="buddy-bang" x="124" y="30">
        !
      </text>
      <g className="buddy-z">
        <text x="112" y="38">
          z
        </text>
        <text x="126" y="18">
          z
        </text>
      </g>
    </svg>
  )
})
