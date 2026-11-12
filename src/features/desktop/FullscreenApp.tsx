import { useEffect, useLayoutEffect, useRef } from 'react'
import { AppIcon } from './AppIcon'
import { genie, genieFrame, GENIE_CLOSE_MS, GENIE_OPEN_MS, type IconBox } from './genie'
import type { AppDef } from './apps'
import { screenOutlinePolygon } from './screenOutlinePolygon'
import type { LaunchPhase, ScreenFit } from './useLaunch'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * An app open full-screen, in macOS full-screen style: a slim menu bar and the app below, on the
 * app's own background. It pours out of its Dock icon with the macOS genie effect, and back into
 * it when closed.
 */
export function FullscreenApp({
  app,
  phase,
  fit,
  onClose,
}: {
  app: AppDef | null
  phase: LaunchPhase
  fit: ScreenFit | null
  onClose: () => void
}) {
  // the window is there from the start of the zoom: it genies out while the screen grows
  const active = phase === 'zooming' || phase === 'open' || phase === 'closing'
  const win = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  /** While animating, cut everything to the Mac screen's real outline (seen at an angle, it isn't
   *  a box): the opening window then never spills onto the bezel. Off once the app fills the page. */
  const clipToScreen = (on = true) => {
    const l = layer.current
    if (!l) return
    l.style.clipPath = (on && screenOutlinePolygon(l.getBoundingClientRect())) || ''
  }
  const closeRef = useRef<HTMLButtonElement>(null)
  /** Keyboard focus once open: the app's own text field if it has one (the terminal's prompt),
   *  otherwise the window itself, which shows no focus ring (the close button would). */
  const focusApp = () => {
    const field = win.current?.querySelector<HTMLElement>('input, textarea')
    ;(field ?? win.current)?.focus({ preventScroll: true })
  }

  /** An element's box relative to the window, clipped to it. Measured against the window's
   *  container: the window itself is squashed while it genies. */
  const boxOf = (selector: string): IconBox | null => {
    const w = win.current
    const el = document.querySelector(selector)
    if (!w || !el) return null
    const r = el.getBoundingClientRect()
    const o = (w.parentElement ?? w).getBoundingClientRect()
    return {
      left: Math.max(0, r.left - o.left),
      right: Math.min(o.width, r.right - o.left),
      top: Math.max(0, r.top - o.top),
      bottom: Math.min(o.height, r.bottom - o.top),
    }
  }
  /** This app's Dock icon, and the Mac's screen the window grows into as the camera zooms. */
  const iconBox = () => boxOf(`.dock-item[data-app="${app?.id}"] .app-icon`)
  const screenBox = () => boxOf('.mb-screen')

  // open, together with the zoom: tuck the window into its icon before the first paint, then
  // pour it out (without motion, the app simply appears once open)
  useLayoutEffect(() => {
    const w = win.current
    if (!w) return
    if (phase === 'open' && reducedMotion()) return focusApp()
    if (phase !== 'zooming') return
    const icon = iconBox()
    if (!icon) return
    genieFrame(w, icon, 0, screenBox())
    clipToScreen()
    void genie(w, iconBox, screenBox, 0, 1, GENIE_OPEN_MS, clipToScreen).then(() => {
      clipToScreen(false)
      focusApp()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per open
  }, [phase])

  // close: back into the icon, while the screen zooms out (useLaunch waits GENIE_CLOSE_MS)
  useEffect(() => {
    const w = win.current
    if (phase !== 'closing' || !w || reducedMotion()) return
    void genie(w, iconBox, screenBox, 1, 0, GENIE_CLOSE_MS, clipToScreen)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per close
  }, [phase])

  if (!app?.render || !active) return null
  const Content = app.render

  return (
    <div className="fs-app" data-app={app.id} ref={layer}>
      <div
        ref={win}
        className="fs-window"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={app.name}
        // rounded like the Mac's screen it fills
        style={fit ? { borderRadius: fit.radius } : undefined}
      >
        <header className="fs-bar">
          <div className="traffic">
            {/* the symbols show while hovering the buttons, as on a Mac */}
            <button
              ref={closeRef}
              type="button"
              className="tl tl-close"
              aria-label={`Close ${app.name}`}
              onClick={onClose}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3.9 3.9l4.2 4.2M8.1 3.9L3.9 8.1" />
              </svg>
            </button>
            {/* minimising genies the window into the Dock, which is what closing does here */}
            <button
              type="button"
              className="tl tl-min"
              aria-label={`Minimise ${app.name}`}
              onClick={onClose}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3.3 6h5.4" />
              </svg>
            </button>
            <span className="tl tl-zoom" aria-hidden="true">
              <svg viewBox="0 0 12 12">
                <path className="tl-fill" d="M3.4 3.4h3L3.4 6.4zM8.6 8.6h-3l3-3z" />
              </svg>
            </span>
          </div>
          <div className="fs-title">
            <span className="fs-title-icon">
              <AppIcon id={app.icon} />
            </span>
            {app.name}
          </div>
          {/* Esc closes the app; a keycap hint for it, clickable too */}
          <button type="button" className="fs-esc" tabIndex={-1} onClick={onClose}>
            <kbd>esc</kbd>
            <span>to close</span>
          </button>
        </header>
        <main className="fs-body">
          <div className="mac-content">
            <Content />
          </div>
        </main>
      </div>
    </div>
  )
}
