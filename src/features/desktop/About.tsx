import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { portfolio } from '@/config/portfolio'
import { profile } from '@/config/profile'
import { CompanyLogo } from './CompanyLogo'
import { skillLogo } from './skillIcons'
import './about.css'

const { about, education: edu, achievements, values, experience } = portfolio
const next = experience.find((j) => j.upcoming)
const fact = (label: string) => about.facts.find((f) => f.label === label)?.value

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** A number that counts up to `to` once, after `delay` ms (as widgets fill in on a Mac) */
function useCountUp(to: number, { ms = 1100, delay = 0, decimals = 0 } = {}) {
  const [n, setN] = useState(() => (reducedMotion() ? to : 0))
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ms))
      setN(to * (1 - Math.pow(1 - t, 3))) // ease out
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms, delay])
  return n.toFixed(decimals)
}

/* ── small glyphs for the widgets' headers ── */

const GLYPHS = {
  education: (
    <path d="M12 4 1.5 9 12 14l8.5-4.05V16h2V9L12 4zm-6.5 9.3V17c0 1.8 2.9 3.2 6.5 3.2s6.5-1.4 6.5-3.2v-3.7L12 16.4z" />
  ),
  trophy: (
    <path d="M7 3h10v2h3.5v3a4.5 4.5 0 0 1-4.3 4.5A5 5 0 0 1 13 14.9V18h3.5v2.5h-9V18H11v-3.1a5 5 0 0 1-3.2-2.4A4.5 4.5 0 0 1 3.5 8V5H7V3zm0 4H5.5v1A2.5 2.5 0 0 0 7 10.3V7zm10 0v3.3A2.5 2.5 0 0 0 18.5 8V7H17z" />
  ),
  heart: (
    <path d="M12 20.5s-7.6-4.5-9.6-9C1 8.2 3.1 4.8 6.6 4.8c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.5 0 5.6 3.4 4.2 6.7-2 4.5-9.6 9-9.6 9z" />
  ),
  calendar: (
    <path d="M7 2h2v2h6V2h2v2h2.5A1.5 1.5 0 0 1 21 5.5v14a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-14A1.5 1.5 0 0 1 4.5 4H7V2zM5 9v10h14V9H5z" />
  ),
  code: (
    <path d="m8.6 16.6-4.6-4.6 4.6-4.6L7.2 6 1.2 12l6 6 1.4-1.4zm6.8 0 4.6-4.6-4.6-4.6L16.8 6l6 6-6 6-1.4-1.4z" />
  ),
  power: <path d="M11 2h2v10h-2zM6.3 5.3l1.4 1.4A7 7 0 1 0 16.3 6.7l1.4-1.4A9 9 0 1 1 6.3 5.3z" />,
  github: (
    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.8c-2.92.63-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.07 1.61 1.09 1.61 1.09.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.08 1.08-2.82-.1-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.26 0c2-1.36 2.88-1.08 2.88-1.08.58 1.45.21 2.52.1 2.79.68.74 1.08 1.67 1.08 2.82 0 4.03-2.45 4.91-4.79 5.17.38.33.71.97.71 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5z" />
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3zm7 0h3.8v1.6h.05c.53-1 1.84-2 3.78-2 4.04 0 4.79 2.66 4.79 6.12V20.5h-4v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48v4.78h-4z" />
  ),
  doc: (
    <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5L13 3.5zM8 12v1.6h8V12H8zm0 3.5v1.6h8v-1.6H8z" />
  ),
  pin: (
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  ),
} satisfies Record<string, ReactNode>

type GlyphName = keyof typeof GLYPHS

function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  )
}

/** A macOS desktop widget: a rounded glass card with a small coloured header */
function Widget({
  area,
  title,
  icon,
  tint,
  n,
  children,
}: {
  area: string
  title?: string
  icon?: GlyphName
  tint?: string
  /** its place in the pop-in order */
  n: number
  children: ReactNode
}) {
  return (
    <section
      className={`wg wg--${area}`}
      style={{ gridArea: area, '--tint': tint, '--n': n } as CSSProperties}
    >
      {title && (
        <h3 className="wg-head">
          {icon && <Glyph name={icon} />}
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}

/* ── the widgets ── */

/** Me: my name as on the home page, my line, where I am now, and where to find me */
function ProfileWidget() {
  const { github, linkedin } = profile.links
  const { year } = degreeProgress()
  const [first, ...rest] = profile.name.split(' ')
  const now = [
    `${year === 4 ? 'Final year' : `Year ${year}`} at ${edu.short}`,
    next && `Joining ${next.company} in ${next.start.slice(0, 4)}`,
  ].filter(Boolean)
  return (
    <Widget area="me" n={0}>
      <header className="wg-me-head">
        {profile.photo && (
          <span className="wg-avatar">
            <img src={profile.photo} alt={profile.name} />
          </span>
        )}
        <div>
          <p className="wg-eyebrow">{profile.greeting}</p>
          {/* the name as the home page sets it: Anton, the last name darker, a round full stop */}
          <h2 className="wg-name" aria-label={profile.name}>
            <span className="wg-name-first">{first}</span>{' '}
            <span className="wg-name-last">{rest.join(' ')}</span>
            <i className="wg-name-dot" aria-hidden="true" />
          </h2>
          <p className="wg-role">
            {profile.role}
            <span className="wg-love">
              <Glyph name="heart" /> loves building mobile apps
            </span>
          </p>
        </div>
      </header>

      <div className="wg-statement">
        <blockquote>
          <span>“{profile.quote[0]}</span>
          {profile.quote.slice(1).map((line, i, all) => (
            <span key={line}>
              {line}
              {i === all.length - 1 && '”'}
            </span>
          ))}
        </blockquote>
        <p className="wg-bio">{about.paragraphs[0]}</p>
      </div>

      <footer className="wg-me-foot">
        <p className="wg-now">
          <i aria-hidden="true" />
          {now.join(' · ')}
        </p>
        <div className="wg-me-links">
          <span className="wg-place">
            <Glyph name="pin" />
            {fact('Based in')}
          </span>
          <span className="wg-links">
            {github && (
              <a href={github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Glyph name="github" /> GitHub
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Glyph name="linkedin" /> LinkedIn
              </a>
            )}
            <a href={portfolio.resumeUrl} target="_blank" rel="noreferrer" aria-label="Résumé">
              <Glyph name="doc" /> Résumé
            </a>
          </span>
        </div>
      </footer>
    </Widget>
  )
}

/** where the degree is: which year, and how much of the four is done */
function degreeProgress() {
  const [y, m] = edu.start.split('-').map(Number)
  const now = new Date()
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
  const total = (edu.graduates - y) * 12 - (m - 1) + 5 // through to the summer of the final year
  return {
    year: Math.min(4, Math.floor(months / 12) + 1),
    done: Math.min(1, Math.max(0, months / total)),
  }
}

function EducationWidget() {
  const { year, done } = degreeProgress()
  const cgpa = useCountUp(edu.cgpa, { decimals: 2, delay: 250 })
  return (
    <Widget area="edu" title="Education" icon="education" tint="#4aa3ff" n={1}>
      <div className="wg-edu">
        <div className="wg-edu-text">
          <strong>{edu.short}</strong>
          <span>{edu.degree}</span>
          <small>{edu.place}</small>
        </div>
        <div className="wg-ring" style={{ '--v': edu.cgpa / 10 } as CSSProperties}>
          <b>{cgpa}</b>
          <small>CGPA</small>
        </div>
      </div>
      <div className="wg-progress">
        <div className="wg-progress-bar" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i
              key={i}
              style={
                { '--fill': Math.min(1, Math.max(0, done * 4 - i)), '--i': i } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="wg-progress-foot">
          <span>Year {year} of 4</span>
          <span>Graduating {edu.graduates}</span>
        </div>
      </div>
    </Widget>
  )
}

/** "Up next", like the Calendar widget: the role I'm joining */
function NextWidget() {
  if (!next) return null
  const intern = experience.find((j) => j.role === next.related?.role)
  return (
    <Widget area="next" title="Up next" icon="calendar" tint="#ff6961" n={2}>
      <div className="wg-next">
        <div className="wg-next-who">
          <span className="wg-next-logo">
            <CompanyLogo id={next.logo} name={next.company} />
          </span>
          <span>
            <strong>{next.short ?? next.role}</strong>
            <small>{next.company} · full-time</small>
          </span>
        </div>
        {/* the way here: the internship (done), then the offer it turned into */}
        {intern && (
          <ol className="wg-journey">
            <li data-done>
              <i />
              <strong>{intern.short ?? intern.role}</strong>
              <small>{intern.period}</small>
            </li>
            <li>
              <i />
              <strong>{next.short ?? next.role}</strong>
              <small>{next.period}</small>
            </li>
          </ol>
        )}
        <div className="wg-next-when">
          <strong>{next.start.slice(0, 4)}</strong>
          {next.related && <span className="wg-chip">Return offer</span>}
        </div>
      </div>
    </Widget>
  )
}

function StackWidget() {
  return (
    <Widget area="stack" title="Builds with" icon="code" tint="#5dd39e" n={3}>
      <ul className="wg-stack">
        {about.stack.map((s, i) => {
          const logo = skillLogo(s)
          return (
            <li key={s} style={{ '--i': i } as CSSProperties}>
              <span className="wg-stack-tile">{logo && <img src={logo} alt="" />}</span>
              <small>{s}</small>
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

/** One achievement: a rank counts up; a place pops in */
function Win({ a, i }: { a: (typeof achievements)[number]; i: number }) {
  const rank = a.kind === 'rank'
  const counted = useCountUp(rank ? Number(a.value.replace(/\D/g, '')) : 0, {
    ms: 1300,
    delay: 300 + i * 120,
  })
  return (
    <div className="wg-win" data-kind={a.kind} style={{ '--i': i } as CSSProperties}>
      <b>{rank ? counted : a.value.split(' ')[0]}</b>
      <span>{rank ? a.title : a.title.replace(' Capture the Flag', ' CTF')}</span>
      <small>{rank ? 'All India Rank' : a.detail.split(' · ')[1]}</small>
    </div>
  )
}

/** Ranks as big numbers (like the Stocks widget), wins with their places */
function AchievementsWidget() {
  return (
    <Widget area="wins" title="Achievements" icon="trophy" tint="#ffb340" n={4}>
      <div className="wg-wins">
        {achievements.map((a, i) => (
          <Win key={a.title} a={a} i={i} />
        ))}
      </div>
    </Widget>
  )
}

/** What I care about, as switches that are always on: try one, and it springs back */
function CareWidget() {
  const [tried, setTried] = useState<number | null>(null)
  useEffect(() => {
    if (tried === null) return
    const t = window.setTimeout(() => setTried(null), 1400)
    return () => window.clearTimeout(t)
  }, [tried])
  return (
    <Widget area="care" title="Always on" icon="power" tint="#5dd39e" n={5}>
      <ul className="wg-care">
        {values.map((v, i) => (
          <li key={v} style={{ '--i': i } as CSSProperties}>
            {/* both texts share one cell, so swapping them never moves anything */}
            <span className="wg-care-text" data-tried={tried === i || undefined}>
              <span>{v[0].toUpperCase() + v.slice(1)}</span>
              <span aria-hidden={tried !== i}>Can’t turn this off</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked="true"
              aria-label={v}
              className="wg-switch"
              data-tried={tried === i || undefined}
              onClick={() => setTried(i)}
            />
          </li>
        ))}
      </ul>
    </Widget>
  )
}

/**
 * About Me as a wall of macOS desktop widgets, all on one screen: who I am, my degree, what's
 * next, what I build with, my ranks and wins, and the things I care about (switches that won't
 * turn off).
 */
export function About() {
  return (
    <div className="wgs">
      <ProfileWidget />
      <EducationWidget />
      <NextWidget />
      <StackWidget />
      <AchievementsWidget />
      <CareWidget />
    </div>
  )
}
