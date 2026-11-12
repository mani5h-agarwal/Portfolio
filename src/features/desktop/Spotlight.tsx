import { AppIcon } from './AppIcon'
import { bestMatch, type LaunchPhase } from './useLaunch'

/**
 * The Spotlight search bar on the Mac's screen. Always there while nothing is open: type on your
 * keyboard (or click the laptop's keys) to search, and the best match is completed in grey with its
 * icon on the right; Return opens it. When an app is launched from the Dock, the keyboard types the
 * app's name here by itself. Steps aside while the brightness/volume indicator is showing.
 */
export function Spotlight({
  query,
  phase,
  hidden = false,
}: {
  query: string
  phase: LaunchPhase
  hidden?: boolean
}) {
  const shown = phase !== 'open' && phase !== 'closing' && !hidden
  const match = bestMatch(query)
  const name = match?.name ?? ''
  // the grey completion: the rest of the app's name, if the query is how it starts
  const rest =
    match && name.toLowerCase().startsWith(query.toLowerCase()) ? name.slice(query.length) : ''

  return (
    <div className={`spotlight${shown ? ' is-shown' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="spotlight-icon">
        <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M15 15l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="spotlight-text">
        {query}
        <span className="spotlight-caret" />
        {!query && <span className="spotlight-placeholder">Spotlight Search</span>}
        {query && rest && <span className="spotlight-rest">{rest}</span>}
      </span>
      {match && (
        <span className="spotlight-match">
          <AppIcon id={match.icon} />
        </span>
      )}
    </div>
  )
}
