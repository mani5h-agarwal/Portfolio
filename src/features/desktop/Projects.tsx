import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { portfolio, type Project } from '@/config/portfolio'
import { IPhone } from './IPhone'
import { MacWindow } from './MacWindow'
import { ProjectFlow } from './ProjectFlow'
import { SmartGalleryDemo, type DemoPhase } from './SmartGalleryDemo'
import { skillLogo } from './skillIcons'
import './projects.css'

const PROJECTS: Project[] = portfolio.projects
const AUTO_MS = 2400

type Tab = 'overview' | 'highlights' | 'how'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'how', label: 'How it works' },
]

/** what the caption under the phone says while SmartGalleryX's screen plays */
const DEMO_CAPTION: Record<DemoPhase, string> = {
  indexing: 'Indexing: each photo becomes a vector on the phone',
  prompts: 'Describe a photo, or try a suggestion',
  typing: 'Describe a photo, or try a suggestion',
  searching: 'Your words become a vector too',
  results: 'Ranked on the phone, best matches first',
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** "**bold**" in a point becomes the highlighted parts */
const rich = (text: string): ReactNode[] =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))

/* ── the link buttons' icons: GitHub's mark, Google Play's, and a globe ── */

const LINK_ICONS = {
  github: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  ),
  // Google Play's triangle (Simple Icons, CC0), in its four colours
  play: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#00d7fe"
        d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z"
      />
      <path
        fill="#00f076"
        d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973z"
      />
      <path
        fill="#ffc900"
        d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z"
      />
      <path
        fill="#ff3a44"
        d="M13.544 13.056l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z"
      />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M2.5 12h19M12 2.5c2.8 2.8 4 6 4 9.5s-1.2 6.7-4 9.5c-2.8-2.8-4-6-4-9.5s1.2-6.7 4-9.5z" />
      </g>
    </svg>
  ),
}

const LINKS: { key: keyof Project['links']; label: string }[] = [
  { key: 'github', label: 'GitHub' },
  { key: 'play', label: 'Google Play' },
  { key: 'website', label: 'Website' },
]

/** A project's app icon: its own image, or a gradient tile with a mark */
function ProjectIcon({ p, size }: { p: Project; size: number }) {
  const { src, colors = ['#3a3a3c', '#1c1c1e'] } = p.icon
  return (
    <span
      className="pj-icon"
      style={
        {
          width: size,
          height: size,
          background: `linear-gradient(160deg, ${colors[0]}, ${colors[1]})`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {src ? (
        <img src={src} alt="" draggable={false} />
      ) : (
        <svg viewBox="0 0 40 40">
          <text
            x="18.5"
            y="27"
            textAnchor="middle"
            fontSize="19"
            fontWeight="800"
            fill="#fff"
            fontFamily="Anton, Impact, sans-serif"
          >
            M
          </text>
          <circle cx="29" cy="25" r="2.6" fill="#f2a39a" />
        </svg>
      )}
    </span>
  )
}

/**
 * Projects, as a macOS app: the projects in a sidebar with their app icons; the chosen one's
 * story in Overview, Highlights and How it works tabs; and an iPhone beside it playing the app
 * (real screenshots, or a live screen), leaning towards the cursor. ↑ ↓ change project, ← → the
 * screen.
 */
export function Projects() {
  const [sel, setSel] = useState(0)
  const [tab, setTab] = useState<Tab>('overview')
  const [shot, setShot] = useState(0)
  const [paused, setPaused] = useState(false)
  const [phase, setPhase] = useState<DemoPhase>('indexing')
  const phone = useRef<HTMLDivElement>(null)
  const p = PROJECTS[sel]
  const screens = Array.isArray(p.screens) ? p.screens : null
  const count = screens?.length ?? 0
  const onPhase = useCallback((ph: DemoPhase) => setPhase(ph), [])

  const choose = (i: number) => {
    setSel(i)
    setShot(0)
    setTab('overview')
  }

  // the screens play by themselves, unless you're pointing at the phone; choosing one restarts
  // the wait, so it never moves on straight after you picked it
  useEffect(() => {
    if (!count || paused || reducedMotion()) return
    const t = window.setTimeout(() => setShot((s) => (s + 1) % count), AUTO_MS)
    return () => window.clearTimeout(t)
  }, [count, paused, sel, shot])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea')) return
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const i = Math.min(PROJECTS.length - 1, Math.max(0, sel + (e.key === 'ArrowUp' ? -1 : 1)))
        if (i !== sel) choose(i)
      } else if (count && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        setShot((s) => (s + (e.key === 'ArrowLeft' ? -1 : 1) + count) % count)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sel, count])

  // the phone leans towards the cursor (a few degrees), and settles back when it leaves
  const lean = (e: PointerEvent<HTMLDivElement>) => {
    const el = phone.current
    if (!el || reducedMotion() || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
  }
  const settle = () => {
    phone.current?.style.setProperty('--ry', '0deg')
    phone.current?.style.setProperty('--rx', '0deg')
  }

  const tabIndex = TABS.findIndex((t) => t.id === tab)

  return (
    <div className="pj" style={{ '--accent': p.accent } as CSSProperties}>
      <nav className="pj-side" aria-label="Projects">
        <h4>Projects</h4>
        <ul>
          {PROJECTS.map((x, i) => (
            <li key={x.name}>
              <button
                type="button"
                aria-current={i === sel || undefined}
                onClick={() => i !== sel && choose(i)}
              >
                <ProjectIcon p={x} size={40} />
                <span>
                  <strong>{x.name}</strong>
                  <small>{x.platforms.join(' · ')}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <a
          className="pj-more"
          href={portfolio.projects[0].links.github?.replace(/\/[^/]+$/, '')}
          target="_blank"
          rel="noreferrer"
        >
          {LINK_ICONS.github} More on GitHub
        </a>
      </nav>

      <section className="pj-main" data-device={p.device ?? 'iphone'}>
        {/* keyed by project, so switching replays the entrance */}
        <article key={sel} className="pj-info">
          <header className="pj-head">
            <ProjectIcon p={p} size={80} />
            <div>
              <h2>{p.name}</h2>
              <p className="pj-tagline">{p.tagline}</p>
              <p className="pj-meta">
                <span>{p.period}</span>
                {p.platforms.map((pl) => (
                  <span key={pl} className="pj-platform">
                    {pl}
                  </span>
                ))}
              </p>
            </div>
          </header>

          <div className="pj-links">
            {LINKS.filter((l) => p.links[l.key]).map((l, i) => (
              <a
                key={l.key}
                href={p.links[l.key]}
                target="_blank"
                rel="noreferrer"
                data-primary={i === 0 || undefined}
              >
                {LINK_ICONS[l.key]}
                {l.label}
              </a>
            ))}
          </div>

          <div
            className="pj-tabs"
            role="tablist"
            style={{ '--tabs': TABS.length, '--at': tabIndex } as CSSProperties}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
            <i className="pj-tabs-thumb" aria-hidden="true" />
          </div>

          {tab === 'overview' && (
            <div key="overview" className="pj-tab">
              <p className="pj-desc">{p.description}</p>
              <dl className="pj-stats">
                {p.stats.map((s, i) => (
                  <div key={s.label} style={{ '--i': i } as CSSProperties}>
                    <dt>{s.value}</dt>
                    <dd>{s.label}</dd>
                  </div>
                ))}
              </dl>
              <ul className="pj-tech">
                {p.tech.map((t, i) => {
                  const logo = skillLogo(t)
                  return (
                    <li key={t} style={{ '--i': i } as CSSProperties}>
                      {logo && <img src={logo} alt="" />}
                      {t}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {tab === 'highlights' && (
            <ul key="highlights" className="pj-tab pj-points">
              {p.points.map((pt, i) => (
                <li key={i} style={{ '--i': i } as CSSProperties}>
                  {rich(pt)}
                </li>
              ))}
            </ul>
          )}
          {tab === 'how' && (
            <div key="how" className="pj-tab">
              <ProjectFlow how={p.how} tint={p.accent} />
            </div>
          )}
        </article>

        <div
          className="pj-stage"
          onPointerMove={lean}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => {
            setPaused(false)
            settle()
          }}
        >
          <div key={sel} ref={phone} className="pj-phone">
            {screens && p.device === 'mac' ? (
              <MacWindow screens={screens} index={shot} onIndex={setShot} title="Manish Agarwal" />
            ) : screens ? (
              <IPhone screens={screens} index={shot} onIndex={setShot} />
            ) : (
              <IPhone darkStatus>
                <SmartGalleryDemo onPhase={onPhase} />
              </IPhone>
            )}
          </div>

          <div className="pj-caption">
            {screens ? (
              <>
                <button
                  type="button"
                  aria-label="Previous screen"
                  onClick={() => setShot((s) => (s - 1 + count) % count)}
                >
                  ‹
                </button>
                <div>
                  <p key={`${sel}-${shot}`}>{screens[shot]?.caption}</p>
                  <span className="pj-dots">
                    {screens.map((s, i) => (
                      <button
                        key={s.src}
                        type="button"
                        aria-label={`Screen ${i + 1}`}
                        aria-current={i === shot || undefined}
                        onClick={() => setShot(i)}
                      />
                    ))}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Next screen"
                  onClick={() => setShot((s) => (s + 1) % count)}
                >
                  ›
                </button>
              </>
            ) : (
              <div>
                <p key={DEMO_CAPTION[phase]}>{DEMO_CAPTION[phase]}</p>
                <span className="pj-live">
                  <i /> Live demo · illustrated photos
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
