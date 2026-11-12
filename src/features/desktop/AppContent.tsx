// The content of each app window on the Mac. Text comes from src/config/portfolio.ts.
import { useEffect, useRef, useState } from 'react'
import { portfolio } from '@/config/portfolio'
import { profile } from '@/config/profile'

/** Placeholder content still to replace: shown muted so it's easy to spot. */
function isExample(s: string) {
  return s.startsWith('EXAMPLE')
}

/* ───────────── About ───────────── */

export function About() {
  return (
    <div className="app-about">
      <div className="about-head">
        <div className="about-avatar">{profile.initials}</div>
        <div>
          <h2>{profile.name}</h2>
          <p className="accent">{profile.role}</p>
          <p className="muted">{profile.tagline}</p>
        </div>
      </div>
      {portfolio.about.paragraphs.map((p, i) => (
        <p key={i} className={isExample(p) ? 'example' : undefined}>
          {p}
        </p>
      ))}
      <dl className="about-facts">
        {portfolio.about.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd className={isExample(f.value) ? 'example' : undefined}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ───────────── Experience ───────────── */

export function Experience() {
  return (
    <ol className="timeline">
      {portfolio.experience.map((job) => (
        <li key={job.company + job.period}>
          <div className="timeline-dot" aria-hidden="true" />
          <div className="timeline-meta">
            <span>{job.period}</span>
            {job.location && <span>{job.location}</span>}
          </div>
          <h3>
            {job.role} <span className="muted">· </span>
            <span className={isExample(job.company) ? 'example' : 'accent'}>{job.company}</span>
          </h3>
          <ul>
            {job.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {job.tech && <Tags items={job.tech} />}
        </li>
      ))}
    </ol>
  )
}

/* ───────────── Projects ───────────── */

export function Projects() {
  return (
    <div className="projects">
      {portfolio.projects.map((p) => (
        <article key={p.name} className="project">
          <div
            className="project-art"
            style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
            aria-hidden="true"
          >
            <span>{p.name.replace('EXAMPLE — ', '').slice(0, 1)}</span>
          </div>
          <div className="project-body">
            <h3 className={isExample(p.name) ? 'example' : undefined}>{p.name}</h3>
            <p>{p.description}</p>
            <Tags items={p.tech} />
            {(p.live || p.code) && (
              <div className="project-links">
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer">
                    Live ↗
                  </a>
                )}
                {p.code && (
                  <a href={p.code} target="_blank" rel="noreferrer">
                    Code ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

/* ───────────── Skills ───────────── */

export function Skills() {
  return (
    <div className="skills">
      {portfolio.skills.map((g) => (
        <section key={g.group}>
          <h3 className={isExample(g.group) ? 'example' : undefined}>{g.group}</h3>
          <Tags items={g.items} />
        </section>
      ))}
    </div>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/* ───────────── Contact ───────────── */

export function Contact() {
  const { email, linkedin } = portfolio.contact
  const github = profile.links.github
  return (
    <div className="contact">
      <h2>Let’s talk.</h2>
      <p className="muted">
        The fastest way to reach me is below. I usually reply within a day or two.
      </p>
      <div className="contact-list">
        {email && (
          <a className="contact-row" href={`mailto:${email}`}>
            <span>Email</span>
            <strong>{email}</strong>
          </a>
        )}
        {linkedin && (
          <a className="contact-row" href={linkedin} target="_blank" rel="noreferrer">
            <span>LinkedIn</span>
            <strong>Connect ↗</strong>
          </a>
        )}
        {github && (
          <a className="contact-row" href={github} target="_blank" rel="noreferrer">
            <span>GitHub</span>
            <strong>{github.replace(/^https?:\/\//, '')} ↗</strong>
          </a>
        )}
        {!email && !linkedin && (
          <p className="example">
            Add your email and LinkedIn in <code>src/config/portfolio.ts</code> → contact.
          </p>
        )}
      </div>
    </div>
  )
}

/* ───────────── Résumé ───────────── */

export function Resume() {
  const url = portfolio.resumeUrl
  if (!url)
    return (
      <div className="resume">
        <h2>Résumé</h2>
        <p className="example">
          Put your résumé at <code>public/resume.pdf</code> and set <code>resumeUrl</code> to
          <code>'/resume.pdf'</code> in <code>src/config/portfolio.ts</code>.
        </p>
      </div>
    )
  // the PDF right here in the window, like opening it in Preview
  return (
    <div className="resume is-viewer">
      {/* the browser's own PDF toolbar is hidden (no rotate / draw / edit); just a download */}
      <iframe
        className="resume-pdf"
        src={`${url}#toolbar=0&navpanes=0&view=FitH`}
        title="Résumé (PDF)"
      />
      <a className="resume-download" href={url} download aria-label="Download résumé">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
        </svg>
      </a>
    </div>
  )
}

/* ───────────── Terminal ───────────── */

const COMMANDS: Record<string, () => string[]> = {
  help: () => [
    'Commands: whoami, about, experience, projects, skills, contact, cat what_i_care_about.txt, clear',
  ],
  whoami: () => [`${profile.name} — ${profile.role}`, profile.tagline],
  'cat what_i_care_about.txt': () => portfolio.values.map((v) => `> ${v}`),
  about: () => portfolio.about.paragraphs,
  experience: () =>
    portfolio.experience.map((j) => `${j.period.padEnd(16)} ${j.role} — ${j.company}`),
  projects: () => portfolio.projects.map((p) => `• ${p.name} (${p.tech.join(', ')})`),
  skills: () => portfolio.skills.map((g) => `${g.group}: ${g.items.join(', ')}`),
  contact: () =>
    [
      portfolio.contact.email && `email     ${portfolio.contact.email}`,
      portfolio.contact.linkedin && `linkedin  ${portfolio.contact.linkedin}`,
      profile.links.github && `github    ${profile.links.github}`,
    ].filter(Boolean) as string[],
}

export function Terminal() {
  const user = profile.firstName.toLowerCase()
  const prompt = `${user}@macbook ~ %`
  // opens like my GitHub README: what I care about, then the prompt
  const [lines, setLines] = useState<{ text: string; cmd?: boolean }[]>(() => [
    { text: `Last login: ${new Date().toDateString()} on ttys000` },
    { text: 'cat what_i_care_about.txt', cmd: true },
    ...portfolio.values.map((v) => ({ text: `> ${v}` })),
    { text: '' },
    { text: 'Type "help" to see what else I can tell you.' },
  ])
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // focus the prompt once the window has finished growing in (without scrolling the page)
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 480)
    return () => window.clearTimeout(t)
  }, [])
  // keep the newest output in view; scroll only the window's own content
  // (scrollIntoView would also scroll the page, closing the laptop)
  useEffect(() => {
    const box = endRef.current?.closest('.fs-body')
    if (box) box.scrollTop = box.scrollHeight
  }, [lines])

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (cmd === 'clear') return setLines([])
    const out = cmd ? (COMMANDS[cmd]?.() ?? [`zsh: command not found: ${cmd}`]) : []
    setLines((l) => [...l, { text: raw, cmd: true }, ...out.map((text) => ({ text }))])
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => (
        <div key={i} className={l.cmd ? 'term-cmd' : undefined}>
          {/* every command keeps its green prompt, like the live one */}
          {l.cmd && <span className="term-prompt">{prompt} </span>}
          {l.text}
        </div>
      ))}
      <form
        className="term-input"
        onSubmit={(e) => {
          e.preventDefault()
          run(input)
          setInput('')
        }}
      >
        <label htmlFor="term">{prompt}</label>
        <input
          id="term"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </form>
      <div ref={endRef} />
    </div>
  )
}
