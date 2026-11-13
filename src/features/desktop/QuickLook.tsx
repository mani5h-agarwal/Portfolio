import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { highlight, type Lang } from './highlight'
import { PREVIEWS, type TermLine } from './skillPreviews'
import { skillLogo } from './skillIcons'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const OPEN_MS = 420
const CLOSE_MS = 280

/** Code, highlighted, with line numbers; the lines slide in one after another. Never scrolls
 *  sideways: if its longest line doesn't fit, the text gets a little smaller until it does. */
function Code({ code, lang }: { code: string; lang: Lang }) {
  const lines = highlight(code, lang)
  const ref = useRef<HTMLPreElement>(null)
  useLayoutEffect(() => {
    const pre = ref.current
    if (!pre) return
    pre.style.fontSize = ''
    const over = pre.scrollWidth / pre.clientWidth
    if (over > 1) {
      const size = parseFloat(getComputedStyle(pre).fontSize)
      pre.style.fontSize = `${Math.max(10, Math.floor((size / over) * 10) / 10)}px`
    }
  }, [code])
  return (
    <pre className="ql-code" ref={ref}>
      {lines.map((tokens, i) => (
        <div key={i} className="ql-line" style={{ '--i': i } as CSSProperties}>
          <span className="ql-ln">{i + 1}</span>
          <code>
            {tokens.map((t, j) =>
              t.kind ? (
                <span key={j} className={`tk-${t.kind}`}>
                  {t.text}
                </span>
              ) : (
                t.text
              ),
            )}
            {tokens.length === 0 && ' '}
          </code>
        </div>
      ))}
    </pre>
  )
}

/** A terminal session, printing line by line after `start` steps */
function Terminal({ lines, start = 0 }: { lines: TermLine[]; start?: number }) {
  return (
    <div className="ql-term">
      {lines.map((l, i) => (
        <div
          key={i}
          className={'cmd' in l ? 'ql-term-cmd' : 'ql-term-out'}
          style={{ '--i': start + i } as CSSProperties}
        >
          {'cmd' in l ? (
            <>
              <span className="ql-prompt">~ %</span> {l.cmd}
            </>
          ) : (
            l.out
          )}
        </div>
      ))}
    </div>
  )
}

function Table({ head, rows, start = 0 }: { head: string[]; rows: string[][]; start?: number }) {
  return (
    <div className="ql-table-wrap" style={{ '--i': start } as CSSProperties}>
      <table className="ql-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** One skill's preview: its code, and what it does when it runs */
function PreviewBody({ name }: { name: string }) {
  const p = PREVIEWS[name]
  if (!p) return <p className="ql-empty">No preview yet.</p>
  const codeLines = p.code ? p.code.split('\n').length : 0

  if (p.terminal) return <Terminal lines={p.terminal} />

  if (p.notebook)
    return (
      <div className="ql-notebook">
        {p.notebook.map((cell, i) => (
          <div key={i} className="ql-cell" style={{ '--i': i * 4 } as CSSProperties}>
            <div className="ql-cell-in">
              <span className="ql-cell-label">[{i + 1}]:</span>
              <Code code={cell.code} lang={p.lang} />
            </div>
            {cell.out && <div className="ql-cell-out">{cell.out}</div>}
            {cell.table && <Table {...cell.table} start={i * 4 + 2} />}
          </div>
        ))}
      </div>
    )

  return (
    <>
      {p.bar}
      <div className={`ql-main${p.render ? ' has-render' : ''}`}>
        {p.code && <Code code={p.code} lang={p.lang} />}
        {p.render && (
          <div className="ql-render" style={{ '--i': codeLines + 1 } as CSSProperties}>
            {p.render}
          </div>
        )}
      </div>
      {p.run && <Terminal lines={p.run} start={codeLines + 2} />}
      {p.table && <Table {...p.table} start={codeLines + 2} />}
    </>
  )
}

/**
 * macOS Quick Look for a skill: the preview window zooms out of its folder, shows the skill's
 * code and what it does, and zooms back in when closed. ← → step through all the skills; Esc,
 * Space or a click outside closes it (only it: the Skills app stays open).
 */
export function QuickLook({
  names,
  index,
  origin,
  onMove,
  onClose,
}: {
  names: string[]
  index: number
  /** where the chosen folder is on the page, to zoom from and back into */
  origin: (name: string) => DOMRect | null
  onMove: (delta: number) => void
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const name = names[index]
  const logo = skillLogo(name)

  /** the transform that shrinks the panel onto the folder */
  const fromFolder = () => {
    const p = panel.current?.getBoundingClientRect()
    const f = origin(name)
    if (!p || !f) return 'scale(0.6)'
    const s = Math.max(0.05, f.width / p.width)
    const dx = f.left + f.width / 2 - (p.left + p.width / 2)
    const dy = f.top + f.height / 2 - (p.top + p.height / 2)
    return `translate(${dx}px, ${dy}px) scale(${s})`
  }

  // zoom out of the folder when it opens
  useLayoutEffect(() => {
    if (reducedMotion()) return
    panel.current?.animate(
      [
        { transform: fromFolder(), opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: OPEN_MS, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1.05)' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on open
  }, [])

  const close = () => {
    if (closing.current) return
    closing.current = true
    const el = panel.current
    if (!el || reducedMotion()) return onClose()
    el.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: fromFolder(), opacity: 0 },
      ],
      {
        duration: CLOSE_MS,
        easing: 'cubic-bezier(0.4, 0, 0.8, 0.4)',
        fill: 'forwards',
      },
    ).onfinish = onClose
  }

  // keys: Esc / Space close it (and only it), ← → move to the previous / next skill
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k !== 'Escape' && k !== ' ' && k !== 'ArrowLeft' && k !== 'ArrowRight') return
      e.preventDefault()
      e.stopPropagation() // captured first, so the app's own Esc (close the app) never sees it
      if (k === 'ArrowLeft') onMove(-1)
      else if (k === 'ArrowRight') onMove(1)
      else closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onMove])

  return (
    <div className="ql-backdrop" onClick={close}>
      <div
        ref={panel}
        className="ql-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${name} preview`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ql-bar">
          <button type="button" className="ql-close" aria-label="Close preview" onClick={close} />
          <div className="ql-title">
            {logo && <img src={logo} alt="" />}
            <span>{PREVIEWS[name]?.file ?? name}</span>
          </div>
          <div className="ql-nav">
            <button type="button" aria-label="Previous skill" onClick={() => onMove(-1)}>
              ‹
            </button>
            <span>
              {index + 1} / {names.length}
            </span>
            <button type="button" aria-label="Next skill" onClick={() => onMove(1)}>
              ›
            </button>
          </div>
        </header>
        {/* keyed by skill, so stepping to another replays its lines sliding in */}
        <div key={name} className="ql-body">
          <PreviewBody name={name} />
        </div>
      </div>
    </div>
  )
}
