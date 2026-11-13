// The content of each app window on the Mac. Text comes from src/config/portfolio.ts.
import { useEffect, useRef, useState } from 'react'
import { portfolio } from '@/config/portfolio'
import { profile } from '@/config/profile'

/** Placeholder content still to replace: shown muted so it's easy to spot. */
function isExample(s: string) {
  return s.startsWith('EXAMPLE')
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
  const { email } = portfolio.contact
  const { github, linkedin, instagram, x } = profile.links
  /** a profile link's address, short: github.com/name */
  const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
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
            <strong>{short(github)} ↗</strong>
          </a>
        )}
        {instagram && (
          <a className="contact-row" href={instagram} target="_blank" rel="noreferrer">
            <span>Instagram</span>
            <strong>{short(instagram)} ↗</strong>
          </a>
        )}
        {x && (
          <a className="contact-row" href={x} target="_blank" rel="noreferrer">
            <span>X</span>
            <strong>{short(x)} ↗</strong>
          </a>
        )}
        {!email && !linkedin && (
          <p className="example">
            Add your email in <code>src/config/portfolio.ts</code> → contact, and LinkedIn in{' '}
            <code>src/config/profile.ts</code> → links.
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
      {/* the browser's own PDF toolbar is hidden (no rotate / draw / edit) */}
      <iframe
        className="resume-pdf"
        src={`${url}#toolbar=0&navpanes=0&view=FitH`}
        title="Résumé (PDF)"
      />
    </div>
  )
}

/* ───────────── Terminal ───────────── */

const COMMANDS: Record<string, () => string[]> = {
  help: () => [
    'Commands: neofetch, whoami, about, experience, projects, skills, contact, cat what_i_care_about.txt, clear',
  ],
  whoami: () => [`${profile.name} — ${profile.role}`, profile.tagline],
  'cat what_i_care_about.txt': () => portfolio.values.map((v) => `> ${v}`),
  about: () => portfolio.about.paragraphs,
  experience: () =>
    portfolio.experience.map((j) => `${j.period.padEnd(20)} ${j.role} — ${j.company}`),
  projects: () => portfolio.projects.map((p) => `• ${p.name} (${p.tech.join(', ')})`),
  skills: () => portfolio.skills.map((g) => `${g.group}: ${g.items.join(', ')}`),
  contact: () =>
    [
      portfolio.contact.email && `email     ${portfolio.contact.email}`,
      profile.links.linkedin && `linkedin  ${profile.links.linkedin}`,
      profile.links.github && `github    ${profile.links.github}`,
      profile.links.instagram && `instagram ${profile.links.instagram}`,
      profile.links.x && `x         ${profile.links.x}`,
    ].filter(Boolean) as string[],
}

/** Buddy, the cat from the desktop, in ASCII: neofetch's logo */
const CAT = String.raw`
    /\             /\
   /  \___________/  \
  /                   \
 |    ██         ██    |
 |    ██         ██    |
 |  ~      ‿‿      ~   |
  \                   /
   '-._____________.-'
`.slice(1)

/** `neofetch`, about me: the cat on the left, "system info" on the right, then the colour blocks */
function Neofetch() {
  const user = `${profile.firstName.toLowerCase()}@macbook`
  return (
    <div className="neofetch">
      <pre className="neofetch-logo" aria-hidden="true">
        {CAT}
      </pre>
      <div className="neofetch-info">
        <div>
          <span className="nf-key">{user}</span>
        </div>
        <div className="nf-rule">{'-'.repeat(user.length)}</div>
        {portfolio.neofetch.map(([k, v]) => (
          <div key={k}>
            <span className="nf-key">{k}</span>: {v}
          </div>
        ))}
        <div className="nf-blocks" aria-hidden="true">
          {NF_COLORS.map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** neofetch's row of terminal colours, in this Mac's palette */
const NF_COLORS = [
  '#2a2733',
  '#ff6b7a',
  '#5dff8f',
  '#ffd36b',
  '#6ba8ff',
  '#c9a2ff',
  '#6be4ff',
  '#f1ece5',
]

export function Terminal() {
  const user = profile.firstName.toLowerCase()
  const prompt = `${user}@macbook ~ %`
  // opens like my GitHub README: what I care about, then the prompt
  const [lines, setLines] = useState<{ text: string; cmd?: boolean; fetch?: boolean }[]>(() => [
    { text: `Last login: ${new Date().toDateString()} on ttys000` },
    { text: 'neofetch', cmd: true },
    { text: '', fetch: true },
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
    if (cmd === 'neofetch')
      return setLines((l) => [...l, { text: raw, cmd: true }, { text: '', fetch: true }])
    const out = cmd ? (COMMANDS[cmd]?.() ?? [`zsh: command not found: ${cmd}`]) : []
    setLines((l) => [...l, { text: raw, cmd: true }, ...out.map((text) => ({ text }))])
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) =>
        l.fetch ? (
          <Neofetch key={i} />
        ) : (
          <div key={i} className={l.cmd ? 'term-cmd' : undefined}>
            {/* every command keeps its green prompt, like the live one */}
            {l.cmd && <span className="term-prompt">{prompt} </span>}
            {l.text}
          </div>
        ),
      )}
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
