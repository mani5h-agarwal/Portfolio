import { useCallback, useEffect, useRef } from 'react'
import { DECK_H, LID_H } from './MacBook'

/** Where the animation starts: lid closed, seen level and straight on from the front, a little smaller. */
const START = {
  rotX: 89, // tilt: 0 = seen from directly above, 90 = level with it: only the thin front edge
  rotY: 0, // turn: 0 = straight on; negative shows the right side, positive the left
  scale: 0.74,
  lid: -180, // closed flat on the deck
  lift: 0.12, // cqw gap so the closed lid doesn't z-fight with the keys
}
/** Where it ends: lid open 50° past upright, and the whole laptop tilted back a little, like a
 *  MacBook on a desk seen from your seat: the keyboard leans away, so more of the screen faces you. */
const OPEN_LID = -50
const REST_TILT = 20 // degrees the whole laptop leans back at rest (0 = seen from directly above)
/** The tilt pivots on the line where the bottom of the screen cuts the trackpad, so that framing
 *  holds: the trackpad's bottom edge sits 2.2cqw above the deck's, and it is 30.4cqw tall. */
const padCutFromDeckBottom = (padVisible: number) => 2.2 + 30.4 * (1 - padVisible)

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * Scroll-driven opening: as the visitor scrolls through `track`, the closed laptop turns from a
 * front-left view to directly above while the lid opens, landing exactly on the resting layout.
 * Returns the refs to attach to those elements.
 */
export function useOpening() {
  const track = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const camera = useRef<HTMLDivElement>(null)
  const laptop = useRef<HTMLDivElement>(null)
  const lid = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  /** 0 = normal view; 1 = the whole laptop turned on its hinge (like a book page) until the
   *  screen faces the viewer. The lid keeps its angle to the keyboard throughout. */
  const focus = useRef(0)
  const applyRef = useRef<() => void>(() => {})

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) track.current?.setAttribute('data-static', '')
    let frame = 0

    /* Writes only when a value actually changes. Most of these are read deep inside the laptop,
       and changing a custom property on an ancestor restyles everything below it (every key):
       so each value goes to the few elements that use it, and is left alone when it's the same. */
    const last = new WeakMap<HTMLElement, Map<string, string>>()
    const put = (el: HTMLElement | null | undefined, name: string, value: string) => {
      if (!el) return
      let m = last.get(el)
      if (!m) last.set(el, (m = new Map()))
      if (m.get(name) === value) return
      m.set(name, value)
      el.style.setProperty(name, value)
    }
    let padVisible = NaN // read from CSS once, and again after a resize

    const apply = () => {
      frame = 0
      const t = track.current
      const s = scene.current
      const c = camera.current
      const l = laptop.current
      const d = lid.current
      if (!t || !s || !c || !l || !d) return

      const vh = window.innerHeight
      const box = t.getBoundingClientRect()
      const range = box.height - vh
      const p = reduce || range <= 0 ? 1 : clamp(-box.top / range)

      // The scene's resting layout position. Measured from its parent plus its offset, not its own
      // box: on load the scene plays an entrance animation (rising 28px into place), and reading its
      // box mid-animation put the laptop too high until the first scroll re-measured it.
      const W = s.offsetWidth
      const parent = s.offsetParent as HTMLElement | null
      const sceneTop = parent
        ? parent.getBoundingClientRect().top + parent.clientTop + s.offsetTop
        : s.getBoundingClientRect().top
      const lidH = (LID_H * W) / 100
      const pivotY = lidH + (DECK_H * W) / 200 // centre of the deck: what the camera orbits
      const startShift = vh / 2 - (sceneTop + pivotY) // move it to the middle of the screen

      const cam = ease(p)
      const open = ease(clamp((p - 0.1) / 0.75))

      const atRest = p >= 1
      t.toggleAttribute('data-open', atRest)
      const deck = l.querySelector<HTMLElement>('.mb-deck')
      const hero = t.firstElementChild as HTMLElement | null

      // The camera orbits the deck's centre while opening, then settles pivoting on the trackpad
      // cut line for the resting tilt. `pivot` moves the rotation axis from one to the other.
      if (Number.isNaN(padVisible))
        padVisible = parseFloat(getComputedStyle(s).getPropertyValue('--pad-visible')) || 0.4
      const restPivot = ((DECK_H / 2 - padCutFromDeckBottom(padVisible)) * W) / 100
      const pivot = lerp(0, restPivot, cam)

      if (atRest) {
        // At rest there is no shared 3D scene at all (Safari mis-sorts layers inside one, which hid
        // pressed keys behind the deck). Instead the deck and the lid each carry their own complete
        // perspective transform, built from the same camera point (the hinge) and the same tilt, so
        // they project exactly as the 3D scene did, as two independent flat surfaces.
        const axis = (DECK_H * W) / 200 + restPivot // tilt axis, measured from the hinge
        // "focus" moves the viewer's eye, not the laptop: the camera swings around the top edge of
        // the lid until it looks straight at the screen. That edge stays put; the rest of the screen
        // "opens up" towards you and the keyboard drops away below.
        const turn = lerp(0, -(REST_TILT + OPEN_LID), focus.current)
        const a = (OPEN_LID * Math.PI) / 180
        const topY = -lidH * Math.cos(a) // the lid's top edge, measured from the hinge
        const topZ = -lidH * Math.sin(a)
        const tilt =
          `perspective(${2 * W}px) translateY(${axis}px) rotateX(${REST_TILT}deg) translateY(${-axis}px) ` +
          `translate3d(0, ${topY}px, ${topZ}px) rotateX(${turn}deg) translate3d(0, ${-topY}px, ${-topZ}px)`
        put(l, 'transform', 'none')
        put(deck, 'transform-origin', '50% 0') // the hinge, the camera's vanishing point
        put(deck, 'transform', tilt)
        put(d, 'transform', `${tilt} rotateX(${OPEN_LID}deg)`) // lid pivots on the hinge too
      } else {
        // While opening: one real 3D scene, orbited by the camera.
        put(deck, 'transform-origin', '')
        put(deck, 'transform', '')
        put(
          l,
          'transform',
          `translate3d(0, ${lerp(startShift, 0, cam)}px, 0) translateY(${pivot}px) ` +
            `rotateY(${lerp(START.rotY, 0, cam)}deg) rotateX(${lerp(START.rotX, REST_TILT, cam)}deg) ` +
            `scale(${lerp(START.scale, 1, cam)}) translateY(${-pivot}px)`,
        )
        put(
          d,
          'transform',
          `translateZ(${lerp(START.lift, 0, open)}cqw) rotateX(${lerp(START.lid, OPEN_LID, open)}deg)`,
        )
      }
      // the shadow under the closed laptop
      put(l.querySelector<HTMLElement>('.mb-contact-shadow'), '--closed', (1 - open).toFixed(3))
      // 1 only while the lid is shut; back to 0 within the first few percent of it lifting
      put(l, '--shut', clamp(1 - open / 0.04).toFixed(3))
      // scroll progress for the overlay: title, floor light and progress line
      const pv = p.toFixed(4)
      hero
        ?.querySelectorAll<HTMLElement>(
          ':scope > .mb-floor, :scope > .hero-title, :scope > .hero-quote, :scope > .mb-progress',
        )
        .forEach((el) => put(el, '--p', pv))
      // The Mac waking up: screen and keyboard backlight come on during the second half of the lid
      // opening. The screen fades smoothly (its own opacity); the backlight, which restyles every
      // key, steps up in twentieths.
      const wake = atRest ? 1 : clamp((open - 0.3) / 0.55)
      const screenOn = wake.toFixed(3)
      put(s.querySelector<HTMLElement>('.mb-screen-content'), 'opacity', screenOn)
      put(s.querySelector<HTMLElement>('.mb-screen-wake'), 'opacity', (1 - wake).toFixed(3))
      put(s, '--wake', (Math.round(wake * 20) / 20).toFixed(2))
      // nothing on the screen moves until it's awake (see the pause rules in macbook.css)
      s.toggleAttribute('data-asleep', wake === 0)
      // Look at the laptop's centre at the start, end looking from above the hinge like before.
      put(c, 'perspective-origin', `50% ${lerp(pivotY + startShift, lidH, cam)}px`)
      const cue = clamp(1 - p * 6)
      put(hint.current, 'opacity', String(cue))
      // its little scrolling wheel stops once it has faded out
      t.toggleAttribute('data-scrolled', cue === 0)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    applyRef.current = apply
    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    const onResize = () => {
      padVisible = NaN
      schedule()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /** Swing the camera round the top of the lid until it looks straight at the screen (0–1). */
  const setFocus = useCallback((v: number) => {
    focus.current = v
    applyRef.current()
  }, [])

  return { track, scene, camera, laptop, lid, hint, setFocus }
}
