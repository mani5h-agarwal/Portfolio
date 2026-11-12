// Function-row and HUD glyphs, drawn to match the macOS keycap icons.
import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'brightnessDown'
  | 'brightnessUp'
  | 'missionControl'
  | 'spotlight'
  | 'dictation'
  | 'doNotDisturb'
  | 'rewind'
  | 'playPause'
  | 'fastForward'
  | 'mute'
  | 'volumeDown'
  | 'volumeUp'
  | 'globe'
  | 'touchId'

const rays = (inner: number, outer: number) =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    const p = (r: number) => [12 + r * Math.cos(a), 12 + r * Math.sin(a)].map((n) => n.toFixed(2))
    const [x1, y1] = p(inner)
    const [x2, y2] = p(outer)
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
  })

const speaker = <path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="currentColor" stroke="none" />

const PATHS: Record<IconName, ReactNode> = {
  brightnessDown: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      {rays(5.6, 7.4)}
    </>
  ),
  brightnessUp: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      {rays(6, 9.6)}
    </>
  ),
  missionControl: (
    <>
      <rect x="2.5" y="4.5" width="8" height="6" rx="1" />
      <rect x="13.5" y="4.5" width="8" height="6" rx="1" />
      <rect x="5.5" y="13.5" width="13" height="6" rx="1" />
    </>
  ),
  spotlight: (
    <>
      <circle cx="10.5" cy="10.5" r="5.8" />
      <line x1="14.8" y1="14.8" x2="20.5" y2="20.5" />
    </>
  ),
  dictation: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0" />
      <line x1="12" y1="17.4" x2="12" y2="21" />
    </>
  ),
  doNotDisturb: <path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.6 6.6 0 0 0 10.1 10.1z" />,
  rewind: <path d="M11.5 6 3 12l8.5 6zM21 6l-8.5 6 8.5 6z" fill="currentColor" stroke="none" />,
  playPause: (
    <g fill="currentColor" stroke="none">
      <path d="M2.5 6v12l8.5-6z" />
      <rect x="13.5" y="6" width="2.6" height="12" rx=".4" />
      <rect x="18.4" y="6" width="2.6" height="12" rx=".4" />
    </g>
  ),
  fastForward: <path d="M3 6l8.5 6L3 18zM12.5 6 21 12l-8.5 6z" fill="currentColor" stroke="none" />,
  mute: speaker,
  volumeDown: (
    <>
      {speaker}
      <path d="M15.2 9.6a3.6 3.6 0 0 1 0 4.8" />
    </>
  ),
  volumeUp: (
    <>
      {speaker}
      <path d="M15.2 9.6a3.6 3.6 0 0 1 0 4.8" />
      <path d="M17.6 7.2a7 7 0 0 1 0 9.6" />
      <path d="M20 4.8a10.4 10.4 0 0 1 0 14.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <ellipse cx="12" cy="12" rx="3.8" ry="8.6" />
      <line x1="3.4" y1="12" x2="20.6" y2="12" />
      <path d="M5 7.2h14M5 16.8h14" />
    </>
  ),
  touchId: (
    <>
      <path d="M6.2 7.4A7.6 7.6 0 0 1 19.6 12v1.4" />
      <path d="M4.4 11.2a7.8 7.8 0 0 1 .8-2.4M4.6 15.2c.2-1 .2-2 .1-2.6" />
      <path d="M8.2 18.6c1-1.6 1.4-3.6 1.4-5.6a2.4 2.4 0 0 1 4.8 0c0 2.6-.6 5-1.8 7" />
      <path d="M7.4 10.2A4.8 4.8 0 0 1 16.8 12c0 2.8-.4 5.2-1.6 7.4" />
      <path d="M12 13c0 3-.8 5.4-2.4 7.6M19.4 16.4c-.2 1-.5 2-1 3" />
    </>
  ),
}

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}
