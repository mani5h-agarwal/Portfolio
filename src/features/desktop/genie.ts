/**
 * The macOS "genie" effect: a window pours out of its Dock icon (or back into it). The window is
 * squashed vertically between its rising top edge and its bottom edge, and its sides are clipped to
 * a funnel that narrows down into the icon. Driven every frame by `genieFrame`.
 */

/** Played together with the camera zoom (useLaunch), so a touch longer than it, to settle last. */
export const GENIE_OPEN_MS = 520
export const GENIE_CLOSE_MS = 500

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const smooth = (t: number) => t * t * (3 - 2 * t)

/** The icon's box, in the window's own coordinates (px). */
export interface IconBox {
  left: number
  right: number
  top: number
  bottom: number
}

const STEPS = 24 // points down each side of the funnel

/** Shape `win` at genie progress p: 0 = tucked into the icon, 1 = the full window. `target` is
 *  where it grows to (default: its own full box), e.g. the Mac's screen while that zooms in. */
export function genieFrame(win: HTMLElement, icon: IconBox, p: number, target?: IconBox | null) {
  if (p >= 1) {
    win.style.transform = ''
    win.style.clipPath = ''
    win.style.opacity = ''
    return
  }
  const W = win.offsetWidth
  const H = win.offsetHeight
  const to = target ?? { left: 0, right: W, top: 0, bottom: H }
  // the top edge climbs out of the icon first; the bottom follows, settling last
  const top = lerp(icon.top, to.top, easeOut(clamp(p / 0.7)))
  const bottom = lerp(icon.bottom, to.bottom, easeInOut(clamp((p - 0.2) / 0.8)))
  const height = Math.max(1, bottom - top)
  // how wide the top has opened (m), and how much the sides still funnel into the icon (k)
  const m = easeOut(clamp(p / 0.45))
  const k = 1 - easeInOut(clamp((p - 0.3) / 0.7))
  const left0 = lerp(icon.left, to.left, m)
  const right0 = lerp(icon.right, to.right, m)

  const leftSide: string[] = []
  const rightSide: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS
    const f = smooth(u) * k
    const y = `${(u * 100).toFixed(2)}%`
    leftSide.push(`${lerp(left0, icon.left, f).toFixed(1)}px ${y}`)
    rightSide.unshift(`${lerp(right0, icon.right, f).toFixed(1)}px ${y}`)
  }
  win.style.transformOrigin = '0 0'
  win.style.transform = `translateY(${top.toFixed(1)}px) scaleY(${(height / H).toFixed(4)})`
  win.style.clipPath = `polygon(${[...leftSide, ...rightSide].join(', ')})`
  win.style.opacity = String(clamp(p / 0.12))
}

/** Run the genie from progress `from` to `to` over `ms`. The icon is re-measured every frame: it
 *  moves and grows while the camera zooms in or out at the same time. */
export function genie(
  win: HTMLElement,
  getIcon: () => IconBox | null,
  getTarget: () => IconBox | null,
  from: number,
  to: number,
  ms: number,
  /** called every frame, after the window is shaped */
  onFrame?: () => void,
) {
  return new Promise<void>((resolve) => {
    const t0 = performance.now()
    let icon = getIcon()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      icon = getIcon() ?? icon
      if (icon) genieFrame(win, icon, from + (to - from) * t, getTarget())
      onFrame?.()
      if (t < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}
