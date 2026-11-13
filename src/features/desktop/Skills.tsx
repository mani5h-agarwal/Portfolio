import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { portfolio } from '@/config/portfolio'
import { QuickLook } from './QuickLook'
import { skillLogo } from './skillIcons'
import './skills.css'

/** every skill in order, across the groups */
const NAMES = portfolio.skills.flatMap((g) => g.items)
/** each skill's place in that list: its pop-in delay, and its view-transition name */
const ORDER = new Map(NAMES.map((name, i) => [name, i]))

/** what Finder's "Kind" column says for each */
const KIND: Record<string, string> = {
  MySQL: 'Database',
  HTML: 'Markup',
  CSS: 'Stylesheet',
  SwiftUI: 'UI framework',
  'React Native': 'Framework',
  React: 'Library',
  Firebase: 'Platform',
  'Tailwind CSS': 'CSS framework',
  NumPy: 'Library',
  pandas: 'Library',
  PyTorch: 'ML framework',
  FastAPI: 'Web framework',
  Xcode: 'IDE',
  'Android Studio': 'IDE',
  'VS Code': 'Editor',
  Git: 'Version control',
  Postman: 'API client',
  Expo: 'Platform',
  Kaggle: 'Notebooks',
}
const kindOf = (name: string) => KIND[name] ?? 'Language'

/** a skill's tags (colour dots), and the projects it was used in */
const TAGS = new Map(NAMES.map((n) => [n, portfolio.skillTags.filter((t) => t.items.includes(n))]))
const USED_IN = new Map(
  NAMES.map((n) => [
    n,
    Object.entries(portfolio.skillUse)
      .filter(([, items]) => items.includes(n))
      .map(([project]) => project),
  ]),
)

/** logos too dark to read on a blue folder get a soft light halo */
const DARK_LOGOS = new Set(['MySQL', 'Expo', 'pandas', 'NumPy', 'Kaggle'])

type Place = { kind: 'all' } | { kind: 'group'; name: string } | { kind: 'tag'; name: string }
type View = 'icons' | 'list'

const placeName = (p: Place) => (p.kind === 'all' ? 'All Skills' : p.name)
const samePlace = (a: Place, b: Place) =>
  a.kind === b.kind && (a.kind === 'all' || a.name === (b as { name: string }).name)

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Animates a change the way Finder does: folders glide to their new places, new ones fade in */
function transition(update: () => void) {
  if (!document.startViewTransition || reducedMotion()) return update()
  // a newer change (fast typing) skips the running one: that's fine, not an error
  document.startViewTransition(() => flushSync(update)).ready.catch(() => {})
}

/* ── small SF Symbol-like icons (feather-style strokes) ── */

function Icon({ d, size = 16 }: { d: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  )
}

const ICONS = {
  all: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  Languages: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  'Frameworks & libraries': <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  Tools: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  back: <path d="M15 18l-6-6 6-6" />,
  forward: <path d="M9 18l6-6-6-6" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  drive: (
    <>
      <rect x="2" y="13" width="20" height="8" rx="2" />
      <path d="M5.5 13 8 4h8l2.5 9M6 17h.01" />
    </>
  ),
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
} satisfies Record<string, ReactNode>

/** A macOS folder: its back with the tab, and the front panel */
function FolderShape() {
  return (
    <svg className="folder-shape" viewBox="0 0 400 320" aria-hidden="true">
      <path
        className="folder-back"
        d="M14 38a20 20 0 0 1 20-20h100a20 20 0 0 1 14.6 6.3l13.6 14.6a6 6 0 0 0 4.4 1.9H366a20 20 0 0 1 20 20V300H14z"
      />
      <rect className="folder-front" x="6" y="62" width="388" height="252" rx="22" />
      <rect className="folder-edge" x="6" y="62" width="388" height="252" rx="22" />
    </svg>
  )
}

/** A folder with the skill’s logo stamped on it (big in icon view, small in list view) */
function Folder({ name }: { name: string }) {
  const logo = skillLogo(name)
  return (
    <span className="skill-folder-icon" data-origin data-dark={DARK_LOGOS.has(name) || undefined}>
      <FolderShape />
      {logo && <img src={logo} alt="" draggable={false} />}
    </span>
  )
}

function TagDots({ name }: { name: string }) {
  const tags = TAGS.get(name) ?? []
  if (!tags.length) return null
  return (
    <span className="tag-dots" aria-label={tags.map((t) => t.tag).join(', ')}>
      {tags.map((t) => (
        <i key={t.tag} style={{ background: t.color }} />
      ))}
    </span>
  )
}

/**
 * Skills as a Finder window: a sidebar of categories and coloured tags, a toolbar (back / forward,
 * icon or list view, search), the skills grouped by category, and a path bar. Every skill is a
 * folder with its logo on it; clicking one opens it in Quick Look, a preview of it in action.
 */
export function Skills() {
  const [history, setHistory] = useState<{ list: Place[]; at: number }>({
    list: [{ kind: 'all' }],
    at: 0,
  })
  const place = history.list[history.at]
  const [view, setView] = useState<View>('icons')
  /** what's typed in the search field (updates at once), and what the grid shows (animates) */
  const [typed, setTyped] = useState('')
  const [query, setQuery] = useState('')
  const clearSearch = () => {
    setTyped('')
    setQuery('')
  }
  const [open, setOpen] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)

  const go = (p: Place) =>
    transition(() => {
      clearSearch()
      setHistory((h) =>
        samePlace(h.list[h.at], p) ? h : { list: [...h.list.slice(0, h.at + 1), p], at: h.at + 1 },
      )
    })
  const step = (delta: number) =>
    transition(() => {
      clearSearch()
      setHistory((h) => ({ ...h, at: Math.min(h.list.length - 1, Math.max(0, h.at + delta)) }))
    })

  /** what's showing: the place's skills, narrowed by the search, still grouped by category */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const inPlace = (name: string) =>
      // (a category is narrowed below, by its group; a tag picks across all of them)
      place.kind !== 'tag' || (TAGS.get(name) ?? []).some((t) => t.tag === place.name)
    const matches = (name: string) =>
      !q ||
      [
        name,
        kindOf(name),
        ...(TAGS.get(name) ?? []).map((t) => t.tag),
        ...(USED_IN.get(name) ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    return portfolio.skills
      .filter((g) => place.kind !== 'group' || g.group === place.name)
      .map((g) => ({ group: g.group, items: g.items.filter((n) => inPlace(n) && matches(n)) }))
      .filter((g) => g.items.length)
  }, [place, query])
  const visible = useMemo(() => groups.flatMap((g) => g.items), [groups])

  // ⌘F / Ctrl+F jumps to the search field, as in Finder
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        search.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const origin = useCallback(
    (name: string) =>
      root.current
        ?.querySelector(`[data-skill="${CSS.escape(name)}"] [data-origin]`)
        ?.getBoundingClientRect() ?? null,
    [],
  )
  const move = useCallback(
    (delta: number) =>
      setOpen((cur) => {
        if (cur === null) return cur
        const i = visible.indexOf(cur)
        return visible[(i + delta + visible.length) % visible.length]
      }),
    [visible],
  )

  const sideItem = (p: Place, icon: ReactNode, count: number) => (
    <li key={placeName(p)}>
      <button type="button" aria-current={samePlace(place, p) || undefined} onClick={() => go(p)}>
        <span className="side-icon">{icon}</span>
        <span className="side-label">{placeName(p)}</span>
        <span className="side-count">{count}</span>
      </button>
    </li>
  )

  const count = visible.length

  return (
    <div className="finder" ref={root}>
      <nav className="finder-side" aria-label="Skill categories">
        <h4>Favourites</h4>
        <ul>
          {sideItem({ kind: 'all' }, <Icon d={ICONS.all} />, NAMES.length)}
          {portfolio.skills.map((g) =>
            sideItem(
              { kind: 'group', name: g.group },
              <Icon d={ICONS[g.group as keyof typeof ICONS] ?? ICONS.all} />,
              g.items.length,
            ),
          )}
        </ul>
        <h4>Tags</h4>
        <ul>
          {portfolio.skillTags.map((t) =>
            sideItem(
              { kind: 'tag', name: t.tag },
              <i className="side-tag" style={{ background: t.color }} />,
              t.items.length,
            ),
          )}
        </ul>
      </nav>

      <section className="finder-main">
        <header className="finder-toolbar">
          <div className="glass-group">
            <button
              type="button"
              aria-label="Back"
              disabled={history.at === 0}
              onClick={() => step(-1)}
            >
              <Icon d={ICONS.back} size={17} />
            </button>
            <button
              type="button"
              aria-label="Forward"
              disabled={history.at === history.list.length - 1}
              onClick={() => step(1)}
            >
              <Icon d={ICONS.forward} size={17} />
            </button>
          </div>
          <h2 className="finder-place">{placeName(place)}</h2>

          <div className="glass-group finder-views" role="group" aria-label="View">
            <button
              type="button"
              aria-label="Icons"
              aria-pressed={view === 'icons'}
              onClick={() => view !== 'icons' && transition(() => setView('icons'))}
            >
              <Icon d={ICONS.all} size={15} />
            </button>
            <button
              type="button"
              aria-label="List"
              aria-pressed={view === 'list'}
              onClick={() => view !== 'list' && transition(() => setView('list'))}
            >
              <Icon d={ICONS.list} size={15} />
            </button>
          </div>

          <label className="glass-group finder-search">
            <Icon d={ICONS.search} size={14} />
            <input
              ref={search}
              type="search"
              placeholder="Search"
              aria-label="Search skills"
              value={typed}
              spellCheck={false}
              data-no-autofocus
              onChange={(e) => {
                const v = e.target.value
                setTyped(v)
                transition(() => setQuery(v))
              }}
              onKeyDown={(e) => {
                // Esc clears the search first; only an empty search lets it close the app
                if (e.key === 'Escape' && typed) {
                  e.preventDefault()
                  e.stopPropagation()
                  setTyped('')
                  transition(() => setQuery(''))
                }
              }}
            />
          </label>
        </header>

        <div className="finder-content" data-view={view}>
          {count === 0 ? (
            <p className="finder-empty">No skills match “{query.trim()}”.</p>
          ) : view === 'icons' ? (
            <div className="skill-groups">
              {groups.map((g) => (
                <section
                  key={g.group}
                  className="skill-group"
                  style={{ viewTransitionName: `skg-${slug(g.group)}` } as CSSProperties}
                >
                  <h3>
                    {g.group}
                    <span>{g.items.length}</span>
                  </h3>
                  <ul className="skill-folders">
                    {g.items.map((name) => {
                      const n = ORDER.get(name) ?? 0
                      return (
                        <li
                          key={name}
                          className="skill-folder"
                          data-skill={name}
                          data-open={open === name || undefined}
                          style={{ '--n': n, viewTransitionName: `sk-${n}` } as CSSProperties}
                        >
                          <button
                            type="button"
                            aria-label={`Preview ${name}`}
                            onClick={() => setOpen(name)}
                          >
                            <Folder name={name} />
                            <span className="skill-folder-name">
                              <span>{name}</span>
                              <TagDots name={name} />
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <table className="finder-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Kind</th>
                  <th>Tags</th>
                  <th>Used in</th>
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.group}>
                  <tr className="finder-list-group">
                    <th colSpan={4}>
                      {g.group} <span>{g.items.length}</span>
                    </th>
                  </tr>
                  {g.items.map((name) => {
                    const used = USED_IN.get(name) ?? []
                    const n = ORDER.get(name) ?? 0
                    return (
                      <tr
                        key={name}
                        data-skill={name}
                        data-open={open === name || undefined}
                        style={{ '--n': n } as CSSProperties}
                        tabIndex={0}
                        aria-label={`Preview ${name}`}
                        onClick={() => setOpen(name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setOpen(name)
                        }}
                      >
                        <td className="finder-list-name">
                          <Folder name={name} />
                          {name}
                        </td>
                        <td>{kindOf(name)}</td>
                        <td>
                          <TagDots name={name} />
                          <span className="tag-names">
                            {(TAGS.get(name) ?? []).map((t) => t.tag).join(', ') || '—'}
                          </span>
                        </td>
                        <td className={used.length ? undefined : 'finder-dim'}>
                          {used.join(', ') || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              ))}
            </table>
          )}
        </div>

        <footer className="finder-path">
          <ol>
            <li>
              <Icon d={ICONS.drive} size={13} /> Macintosh HD
            </li>
            <li>Users</li>
            <li>
              <Icon d={ICONS.home} size={13} /> manish
            </li>
            <li>Skills</li>
            {place.kind !== 'all' && <li>{place.name}</li>}
          </ol>
          <span>
            {count} {count === 1 ? 'item' : 'items'}
            {query.trim() && ` matching “${query.trim()}”`}
          </span>
        </footer>
      </section>

      {open !== null && visible.includes(open) && (
        <QuickLook
          names={visible}
          index={visible.indexOf(open)}
          origin={origin}
          onMove={move}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  )
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '-')
