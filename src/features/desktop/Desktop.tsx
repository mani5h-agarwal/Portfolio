import { useRef, type PointerEvent } from 'react'
import { AppIcon } from './AppIcon'
import { APPS, LINKS, type AppDef } from './apps'
import './desktop.css'

/* ───────────────────────── Dock ───────────────────────── */

const MAGNIFY = 0.55 // how much an icon grows right under the cursor
const REACH = 110 // px: how far the magnification spreads

export function Dock({
  openIds,
  launching,
  onLaunch,
}: {
  openIds: string[]
  launching: string | null
  onLaunch: (app: AppDef) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const centers = useRef<number[]>([])
  const frame = useRef(0)
  const items = () => [...(ref.current?.querySelectorAll<HTMLElement>('.dock-item') ?? [])]

  // macOS-style magnification: icons near the cursor grow, smoothly falling off with distance.
  // Icon positions are measured once (at rest) when the cursor enters, and sizes are written
  // once per frame, so moving the mouse never forces repeated layout work.
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    centers.current = items().map((el) => {
      const r = el.getBoundingClientRect()
      return r.left + r.width / 2
    })
    ref.current?.classList.add('is-magnifying')
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !centers.current.length) return
    const x = e.clientX
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      items().forEach((el, i) => {
        const t = Math.max(0, 1 - Math.abs(x - centers.current[i]) / REACH)
        el.style.setProperty('--mag', (1 + MAGNIFY * Math.sin((t * Math.PI) / 2)).toFixed(3))
      })
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(frame.current)
    centers.current = []
    ref.current?.classList.remove('is-magnifying') // the shrink-back is animated
    items().forEach((el) => el.style.removeProperty('--mag'))
  }

  const item = (app: AppDef) => (
    <button
      key={app.id}
      type="button"
      className={`dock-item${launching === app.id ? ' is-launching' : ''}`}
      data-app={app.id}
      onClick={() => onLaunch(app)}
      aria-label={app.href ? `${app.name} (opens in a new tab)` : `Open ${app.name}`}
    >
      <span className="dock-label">{app.name}</span>
      <AppIcon id={app.icon} />
      <span className={`dock-dot${openIds.includes(app.id) ? ' is-on' : ''}`} />
    </button>
  )

  return (
    <nav className="dock-wrap" aria-label="Apps">
      <div
        className="dock"
        ref={ref}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {APPS.map(item)}
        {LINKS.length > 0 && <span className="dock-divider" aria-hidden="true" />}
        {LINKS.map(item)}
      </div>
    </nav>
  )
}
