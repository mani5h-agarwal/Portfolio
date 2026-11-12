import { Icon, type IconName } from './icons'

export type HudState =
  | { kind: 'brightness'; level: number }
  | { kind: 'volume'; level: number; muted: boolean }
  | { kind: 'touchid'; label: string }

/** The translucent macOS overlay shown when changing brightness or volume. */
export function Hud({ state, visible }: { state: HudState | null; visible: boolean }) {
  if (!state) return null

  let icon: IconName = 'touchId'
  let text = state.kind === 'touchid' ? state.label : ''
  if (state.kind === 'brightness') {
    icon = 'brightnessUp'
    text = `Brightness ${Math.round(state.level * 100)}%`
  } else if (state.kind === 'volume') {
    icon = state.muted || state.level === 0 ? 'mute' : state.level < 0.5 ? 'volumeDown' : 'volumeUp'
    text = state.muted ? 'Sound off' : `Volume ${Math.round(state.level * 100)}%`
  }
  const filled =
    state.kind === 'touchid'
      ? 0
      : Math.round((state.kind === 'volume' && state.muted ? 0 : state.level) * 16)

  return (
    <div className={`hud${visible ? ' show' : ''}`} role="status">
      <Icon name={icon} className="hud-icon" />
      {state.kind === 'touchid' ? (
        <span className="hud-label">{text}</span>
      ) : (
        <>
          <span className="sr-only">{text}</span>
          <div className="hud-bar" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} className={i < filled ? 'on' : undefined} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
