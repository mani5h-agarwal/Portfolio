import { useEffect, useState, type CSSProperties } from 'react'
import { byId, PHOTOS, SEARCHES } from './smartGalleryData'
import { Photo } from './SmartGalleryPhotos'

/** the app's own "Try" suggestions (GalleryScreen.js) */
const SUGGESTIONS = [
  'sunset at the beach',
  'my dog playing outside',
  'friends at a dinner table',
  'mountains and snow',
  'a birthday cake',
]

export type DemoPhase = 'indexing' | 'prompts' | 'typing' | 'searching' | 'results'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * SmartGalleryX's gallery screen in its dark theme, recreated from the app's source: the title
 * and settings, "Describe a photo…", the indexing banner, the Try chips, and the 3-column grid.
 * It plays a loop: indexing, then a suggestion is picked, typed, searched and ranked. (The photos
 * are illustrations, not anyone's real photos.)
 */
export function SmartGalleryDemo({ onPhase }: { onPhase?: (p: DemoPhase) => void }) {
  const [phase, setPhase] = useState<DemoPhase>(reducedMotion() ? 'results' : 'indexing')
  const [search, setSearch] = useState(0)
  const [typed, setTyped] = useState(reducedMotion() ? SEARCHES[0].query : '')
  const [indexed, setIndexed] = useState(1240)

  useEffect(() => onPhase?.(phase), [phase, onPhase])

  // the loop: each phase waits its turn, then hands over to the next
  useEffect(() => {
    if (reducedMotion()) return
    const q = SEARCHES[search].query
    let t = 0
    if (phase === 'indexing') {
      const start = performance.now()
      const tick = () => {
        const k = Math.min(1, (performance.now() - start) / 2200)
        setIndexed(Math.round(1240 + k * 632))
        t = k < 1 ? window.setTimeout(tick, 40) : window.setTimeout(() => setPhase('prompts'), 300)
      }
      tick()
    } else if (phase === 'prompts') {
      t = window.setTimeout(() => setPhase('typing'), 1500)
    } else if (phase === 'typing') {
      let n = 0
      const type = () => {
        n++
        setTyped(q.slice(0, n))
        t =
          n < q.length
            ? window.setTimeout(type, 45)
            : window.setTimeout(() => setPhase('searching'), 350)
      }
      type()
    } else if (phase === 'searching') {
      t = window.setTimeout(() => setPhase('results'), 800)
    } else {
      t = window.setTimeout(() => {
        setTyped('')
        setSearch((s) => (s + 1) % SEARCHES.length)
        setPhase('prompts')
      }, 3600)
    }
    return () => window.clearTimeout(t)
  }, [phase, search])

  const current = SEARCHES[search]
  const showPrompts = phase === 'prompts' || phase === 'typing'
  const photos = phase === 'results' ? current.ids.map(byId) : PHOTOS

  return (
    <div className="sg">
      <div className="sg-top">
        <div className="sg-title-row">
          <h4>SmartGalleryX</h4>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="sg-gear">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm7.4-3.2c0-.5 0-1-.1-1.4l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.4-1.4L14 2.6h-4l-.5 2.6a7.5 7.5 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.4 1.4l.5 2.6h4l.5-2.6a7.5 7.5 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.4z"
            />
          </svg>
        </div>

        <div className="sg-bar" data-focused={showPrompts || phase === 'searching' || undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" />
            <path
              d="M21 21l-4.3-4.3"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          <span data-placeholder={!typed || undefined}>
            {typed || 'Describe a photo…'}
            {phase === 'typing' && <i className="sg-caret" />}
          </span>
          {typed && phase !== 'typing' && <b className="sg-clear">×</b>}
        </div>

        {phase === 'indexing' && (
          <div className="sg-banner">
            <div>
              <span className="sg-spark">✦</span>
              Indexing {indexed.toLocaleString()} of 1,872 photos
              <span className="sg-pause">❚❚</span>
            </div>
            <i style={{ '--k': indexed / 1872 } as CSSProperties} />
          </div>
        )}
      </div>

      {showPrompts ? (
        <div className="sg-prompts">
          <p>Try</p>
          <div className="sg-chips">
            {SUGGESTIONS.map((s, i) => (
              <span
                key={s}
                style={{ '--i': i } as CSSProperties}
                data-picked={(s === current.query && phase === 'typing') || undefined}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : phase === 'searching' ? (
        <div className="sg-spinner" aria-hidden="true" />
      ) : (
        <>
          {phase === 'results' && (
            <p className="sg-summary">Best {photos.length} matches from 1,872 indexed photos</p>
          )}
          <div className="sg-grid" key={phase === 'results' ? current.query : 'all'}>
            {photos.map((p, i) => (
              <div key={p.id} className="sg-tile" style={{ '--i': i } as CSSProperties}>
                <Photo p={p} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
