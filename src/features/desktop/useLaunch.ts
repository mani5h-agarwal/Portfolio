import { useCallback, useEffect, useRef, useState } from 'react'
import { APPS, LINKS, type AppDef } from './apps'
import { GENIE_CLOSE_MS } from './genie'

/**
 * Opening an app, the Mac way:
 *   typing  – a Spotlight bar appears and the keyboard types the app's name, then presses Return
 *   zooming – in one motion the screen turns to face you and grows to fill the page, like a
 *             book page turning towards you
 *   open    – the app fills the whole page, full-screen
 *   closing – everything plays back in reverse
 */
export type LaunchPhase = 'idle' | 'typing' | 'zooming' | 'open' | 'closing'

/** Where the zoom leaves the Mac's screen on the page: its layout size, the top-left corner it
 *  lands on and the scale it's drawn at. The full-screen app redraws its wallpaper and pet in
 *  exactly this box, so the handover from the laptop's screen to the app is seamless. */
export interface ScreenFit {
  left: number
  top: number
  width: number
  height: number
  scale: number
  /** the screen's corner radius as it lands on the page, px: the open app keeps it */
  radius: number
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Animate 0→1 over `ms`, calling `step` every frame with the eased progress. */
function animate(ms: number, step: (k: number) => void) {
  return new Promise<void>((resolve) => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      step(easeInOut(t))
      if (t < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

/** Which physical key types a character (lower-case letters, digits, space). */
function keyFor(c: string) {
  if (c === ' ') return 'Space'
  if (/[a-z]/.test(c)) return `Key${c.toUpperCase()}`
  if (/[0-9]/.test(c)) return `Digit${c}`
  return null
}

/** What the keyboard types for an app: its name, lower-case, without accents (é → e). */
const typedName = (app: AppDef) => app.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** The app a Spotlight search means: names starting with it first, then names containing it. */
export function bestMatch(query: string): AppDef | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const all = [...APPS, ...LINKS]
  return (
    all.find((a) => typedName(a).startsWith(q)) ??
    all.find((a) =>
      typedName(a)
        .split(' ')
        .some((w) => w.startsWith(q)),
    ) ??
    all.find((a) => typedName(a).includes(q)) ??
    null
  )
}

/** What a key types into Spotlight: a character, or null for keys that don't type. */
function charFor(code: string) {
  if (code === 'Space') return ' '
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase()
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  return null
}

interface Options {
  /** press / release a key on the laptop (with its click sound) */
  keyDown: (id: string) => void
  keyUp: (id: string) => void
  /** swing the camera round the top of the lid to face the screen, 0–1 */
  setFocus: (v: number) => void
  /** the element that is zoomed so the laptop's screen fills the page */
  getCamera: () => HTMLDivElement | null
}

export function useLaunch({ keyDown, keyUp, setFocus, getCamera }: Options) {
  const [phase, setPhase] = useState<LaunchPhase>('idle')
  const [app, setApp] = useState<AppDef | null>(null)
  const [query, setQuery] = useState('')
  const [fit, setFit] = useState<ScreenFit | null>(null)
  const busy = useRef(false)
  const phaseRef = useRef<LaunchPhase>('idle')
  const go = (p: LaunchPhase) => {
    phaseRef.current = p
    setPhase(p)
  }

  // While an app is starting or open, the page must not scroll (it would move the laptop).
  const lockScroll = (on: boolean) => {
    document.documentElement.style.overflow = on ? 'hidden' : ''
  }

  /**
   * The camera move that makes the laptop's screen your screen: it swings round to face the screen
   * and zooms into it in one motion, like a book page turning towards you. `to` 1 goes in, 0 out.
   */
  const enter = useCallback(
    async (to: 0 | 1, ms: number) => {
      const cam = getCamera()
      const screen = cam?.querySelector<HTMLElement>('.mb-screen')
      if (!cam || !screen) return
      // measure where the screen ends up once it faces you (un-zoomed), then restore the start
      const previous = cam.style.transform
      cam.style.transform = ''
      setFocus(1)
      const c = cam.getBoundingClientRect()
      const r = screen.getBoundingClientRect()
      setFocus(1 - to)
      cam.style.transform = previous
      // Scale evenly (never stretch: that's what made the app's wallpaper and pet not line up) so
      // the screen covers the page. Whatever doesn't fit goes off the top (a strip of sky; the Dock
      // at the bottom stays) or off the right (the pet in the bottom-left corner stays).
      const scale = Math.max(innerWidth / r.width, innerHeight / r.height)
      const left = 0
      const top = innerHeight - r.height * scale
      const tx = left - c.left - scale * (r.left - c.left)
      const ty = top - c.top - scale * (r.top - c.top)
      if (to) {
        setFit({
          left,
          top,
          width: screen.offsetWidth,
          height: screen.offsetHeight,
          scale: (r.width * scale) / screen.offsetWidth,
          // the screen keeps its rounded corners all the way in, and the app keeps them too
          radius:
            parseFloat(getComputedStyle(screen).borderBottomLeftRadius) *
            ((r.width * scale) / screen.offsetWidth),
        })
      }
      cam.style.transformOrigin = '0 0'
      const from = to ? 0 : 1
      await animate(ms, (k) => {
        const f = from + (to - from) * k
        setFocus(f)
        cam.style.transform = `translate(${tx * f}px, ${ty * f}px) scale(${1 + (scale - 1) * f})`
      })
      if (!to) cam.style.transform = ''
    },
    [getCamera, setFocus],
  )

  const launch = useCallback(
    /** `typed`: the visitor already typed the search and pressed Return, so skip the typing. */
    async (next: AppDef, typed = false) => {
      if (busy.current) return
      busy.current = true
      lockScroll(true)
      setApp(next)
      if (typed && !reducedMotion()) {
        setQuery(typedName(next))
        await wait(160)
        go('zooming')
        await enter(1, 440)
      } else if (!reducedMotion()) {
        // Spotlight: type the app's name on the keyboard, then press Return
        setQuery('')
        go('typing')
        await wait(260)
        for (const ch of typedName(next)) {
          const key = keyFor(ch)
          if (key) keyDown(key)
          setQuery((q) => q + ch)
          await wait(65)
          if (key) keyUp(key)
          await wait(35 + Math.random() * 55)
        }
        await wait(240)
        keyDown('Enter')
        await wait(110)
        keyUp('Enter')
        await wait(140)
        // the camera swings round to face the screen, then the screen becomes your screen
        go('zooming')
        await enter(1, 440)
      }
      go('open')
      busy.current = false
    },
    [keyDown, keyUp, enter],
  )

  const close = useCallback(async () => {
    if (busy.current || phaseRef.current !== 'open') return
    busy.current = true
    go('closing')
    // the window goes back into its Dock icon (genie) while the screen zooms out, together
    if (!reducedMotion()) await Promise.all([enter(0, 500), wait(GENIE_CLOSE_MS)])
    setApp(null)
    setQuery('')
    go('idle')
    lockScroll(false)
    busy.current = false
  }, [enter])

  // Esc closes the open app. It's marked as handled (also mid-animation), so the browser doesn't act
  // on it too: Safari leaves full screen on an Esc the page doesn't use.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const phase = phaseRef.current
      if (phase === 'open' || phase === 'zooming' || phase === 'closing') e.preventDefault()
      if (phase === 'open') void close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // never leave the page locked if this unmounts mid-launch
  useEffect(() => () => lockScroll(false), [])

  /**
   * Typing into Spotlight (the visitor's keyboard, or clicks on the laptop's keys) while nothing is
   * open: letters, digits and space type, Backspace deletes, Esc clears, Return opens the best
   * match. Returns whether the key was used, so the caller can stop its default action.
   */
  const queryRef = useRef('')
  useEffect(() => {
    queryRef.current = query
  }, [query])
  const type = useCallback(
    (code: string) => {
      if (busy.current || phaseRef.current !== 'idle') return false
      const ch = charFor(code)
      if (ch) {
        setQuery((q) => (q.length < 24 ? q + ch : q))
        return true
      }
      if (code === 'Backspace') {
        setQuery((q) => q.slice(0, -1))
        return true
      }
      if (code === 'Escape') {
        setQuery('')
        return true
      }
      if (code === 'Enter') {
        const match = bestMatch(queryRef.current)
        if (!match) return true
        if (match.href) {
          window.open(match.href, '_blank', 'noopener,noreferrer')
          setQuery('')
        } else void launch(match, true)
        return true
      }
      return false
    },
    [launch],
  )

  return { phase, app, query, fit, launch, close, type }
}
