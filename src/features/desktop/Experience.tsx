import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { portfolio, type Job } from '@/config/portfolio'
import { CompanyLogo } from './CompanyLogo'
import { skillLogo } from './skillIcons'
import './experience.css'

const JOBS: Job[] = portfolio.experience

/* ── dates: 'YYYY-MM' as a month number, so spans can be measured and drawn ── */

const month = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}
const NOW = (() => {
  const d = new Date()
  return d.getFullYear() * 12 + d.getMonth()
})()
const endOf = (j: Job) => (j.end ? month(j.end) : j.upcoming ? month(j.start) + 6 : NOW)

/** how long it lasted (or has so far): "3 mos", "1 yr 10 mos" */
function duration(j: Job) {
  if (j.upcoming) return null
  const n = endOf(j) - month(j.start) + 1
  const y = Math.floor(n / 12)
  const m = n % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`]
    .filter(Boolean)
    .join(' ')
}

const status = (j: Job) => (j.upcoming ? 'upcoming' : j.end ? 'done' : 'now')
const STATUS_LABEL = { upcoming: 'Upcoming', now: 'Current', done: 'Completed' }
const GROUPS: { key: ReturnType<typeof status>; title: string }[] = [
  { key: 'upcoming', title: 'Upcoming' },
  { key: 'now', title: 'Now' },
  { key: 'done', title: 'Before' },
]

/** the colour a role is drawn in on the timeline */
const accent = (j: Job) => (j.company === 'Amazon' ? '#ff9f2e' : '#4aa3ff')

/** "**bold**" in a point becomes the highlighted parts */
function rich(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))
}

/** A company's logo on a rounded tile, like a small app icon */
function Mark({ job, size }: { job: Job; size: number }) {
  return (
    <span className="xp-mark" style={{ width: size, height: size }} aria-hidden="true">
      <CompanyLogo id={job.logo} name={job.company} />
    </span>
  )
}

/** the roles in the order they began: the timeline's rows, top to bottom */
const BY_START = JOBS.map((_, i) => i).sort((a, b) => month(JOBS[a].start) - month(JOBS[b].start))

/**
 * Every role on a line of time, a row each in the order they began (so they step down to the
 * right): the years along the top, a red line for today. The chosen role is lit; an upcoming one is
 * striped, fading into the future. Click a row or its bar to open it.
 */
function Timeline({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const from = Math.min(...JOBS.map((j) => month(j.start)))
  const first = Math.floor(from / 12) * 12
  const last = Math.max(...JOBS.map(endOf), NOW)
  const end = (Math.floor(last / 12) + 1) * 12
  const pct = (m: number) => `${((m - first) / (end - first)) * 100}%`
  const years = Array.from({ length: (end - first) / 12 }, (_, i) => first / 12 + i)

  return (
    <div className="xp-timeline">
      {/* the years, the hairlines between them, and today: behind every row */}
      <div className="xp-axis" aria-hidden="true">
        {years.map((y) => (
          <span key={y} className="xp-year" style={{ left: pct(y * 12) }}>
            {y}
          </span>
        ))}
        <span className="xp-today" style={{ left: pct(NOW + 0.5) }}>
          <b>Today</b>
        </span>
      </div>

      {BY_START.map((i) => {
        const j = JOBS[i]
        const s = month(j.start)
        return (
          <div
            key={i}
            className="xp-row"
            data-status={status(j)}
            data-short={endOf(j) - s < 6 || undefined}
            aria-current={i === selected || undefined}
            style={{ '--c': accent(j) } as CSSProperties}
          >
            <button type="button" className="xp-row-label" onClick={() => onSelect(i)}>
              <strong>{j.short ?? j.role}</strong>
              <span>{j.company}</span>
            </button>
            <div className="xp-track">
              <button
                type="button"
                className="xp-bar"
                aria-label={`${j.role}, ${j.company}, ${j.period}`}
                style={{ left: pct(s), width: `calc(${pct(endOf(j) + 1)} - ${pct(s)})` }}
                onClick={() => onSelect(i)}
              >
                <span>{j.period}</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Experience, as a macOS split-view app: the roles listed in a sidebar (upcoming, now, before), and
 * the chosen one in full on the right, under a timeline of everything. ↑ ↓ step through the roles.
 */
export function Experience() {
  // open on what's happening now
  const [selected, setSelected] = useState(() =>
    Math.max(
      0,
      JOBS.findIndex((j) => !j.upcoming),
    ),
  )
  const job = JOBS[selected]
  const related = job.related && JOBS.findIndex((j) => j.role === job.related?.role)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
      e.preventDefault()
      setSelected((i) => Math.min(JOBS.length - 1, Math.max(0, i + (e.key === 'ArrowUp' ? -1 : 1))))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="xp">
      <nav className="xp-side" aria-label="Roles">
        {GROUPS.map((g) => {
          const items = JOBS.map((j, i) => [j, i] as const).filter(([j]) => status(j) === g.key)
          if (!items.length) return null
          return (
            <section key={g.key}>
              <h4>{g.title}</h4>
              <ul>
                {items.map(([j, i]) => (
                  <li key={i}>
                    <button
                      type="button"
                      aria-current={i === selected || undefined}
                      onClick={() => setSelected(i)}
                    >
                      <Mark job={j} size={36} />
                      <span className="xp-side-text">
                        <strong>{j.short ?? j.role}</strong>
                        <span>
                          {j.company} · {j.period}
                        </span>
                      </span>
                      {g.key === 'now' && <i className="xp-live" aria-label="Current" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </nav>

      <section className="xp-main">
        <Timeline selected={selected} onSelect={setSelected} />

        {/* keyed by role, so switching replays its entrance */}
        <article key={selected} className="xp-detail">
          <header className="xp-hero">
            <Mark job={job} size={64} />
            <div>
              <h2>{job.role}</h2>
              <p className="xp-company">
                {job.link ? (
                  <a href={job.link} target="_blank" rel="noreferrer">
                    {job.company} ↗
                  </a>
                ) : (
                  job.company
                )}
                {job.location && <span> · {job.location}</span>}
              </p>
              <p className="xp-when">
                <span className="xp-badge" data-status={status(job)}>
                  {STATUS_LABEL[status(job)]}
                </span>
                <span>{job.period}</span>
                {duration(job) && <span className="xp-dur">{duration(job)}</span>}
              </p>
            </div>
          </header>

          <h3>{job.upcoming ? 'What’s next' : 'Highlights'}</h3>
          <ul className="xp-points">
            {job.points.map((p, i) => (
              <li key={i} style={{ '--i': i, '--c': accent(job) } as CSSProperties}>
                {rich(p)}
              </li>
            ))}
          </ul>

          {job.tech && (
            <>
              <h3>Built with</h3>
              <ul className="xp-tech">
                {job.tech.map((t) => {
                  const logo = skillLogo(t)
                  return (
                    <li key={t}>
                      {logo && <img src={logo} alt="" />}
                      {t}
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {related !== undefined && related >= 0 && (
            <button type="button" className="xp-related" onClick={() => setSelected(related)}>
              <span>{job.related?.label}</span>
              <Mark job={JOBS[related]} size={22} />
              <strong>{JOBS[related].role}</strong>
              <span className="xp-related-go">{related < selected ? '↑' : '↓'}</span>
            </button>
          )}
        </article>
      </section>
    </div>
  )
}
