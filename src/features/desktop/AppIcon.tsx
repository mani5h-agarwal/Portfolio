import { useId, type ReactNode } from 'react'

export type IconId =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'terminal'
  | 'contact'
  | 'resume'
  | 'github'
  | 'linkedin'

/** The macOS app icon shape: a rounded square (corners 22.5% of the size) in a 100×100 box. */
const SQUIRCLE =
  'M22.5 0h55A22.5 22.5 0 0 1 100 22.5v55A22.5 22.5 0 0 1 77.5 100h-55A22.5 22.5 0 0 1 0 77.5v-55A22.5 22.5 0 0 1 22.5 0Z'

interface Art {
  /** background gradient, top → bottom */
  bg: [string, string]
  /** the artwork, drawn in the 100×100 box; `id` prefixes any gradient ids it defines */
  art: (id: string) => ReactNode
}

/** Each app's icon, drawn in the style of macOS app icons: depth, gradients and soft shading. */
const ICONS: Record<IconId, Art> = {
  // a contact card in a rose cover
  about: {
    bg: ['#ff7a9c', '#f25f86'],
    art: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}-card`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#fff0f4" />
          </linearGradient>
        </defs>
        <rect
          x="20"
          y="15"
          width="62"
          height="72"
          rx="8"
          fill="#000"
          opacity="0.18"
          transform="translate(1.5 2.5)"
        />
        <rect x="20" y="15" width="62" height="72" rx="8" fill={`url(#${id}-card)`} />
        <rect x="20" y="15" width="11" height="72" rx="5" fill="#e04873" />
        <circle cx="56" cy="42" r="11" fill="#b8486a" />
        <path d="M36 74c1.6-11.5 9.6-17.5 20-17.5S74.4 62.5 76 74z" fill="#b8486a" />
        <rect x="82" y="26" width="5" height="10" rx="2" fill="#ffffff" />
        <rect x="82" y="40" width="5" height="10" rx="2" fill="#ffd60a" />
        <rect x="82" y="54" width="5" height="10" rx="2" fill="#5ac8fa" />
      </>
    ),
  },
  // a leather briefcase with a brass clasp
  experience: {
    bg: ['#ffa630', '#ff9100'],
    art: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}-case`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a4b24" />
            <stop offset="1" stopColor="#6a3e1b" />
          </linearGradient>
        </defs>
        <rect
          x="36"
          y="22"
          width="28"
          height="18"
          rx="6"
          fill="none"
          stroke="#5b3416"
          strokeWidth="5.5"
        />
        <rect
          x="16"
          y="36"
          width="68"
          height="46"
          rx="9"
          fill="#000"
          opacity="0.2"
          transform="translate(0 2.5)"
        />
        <rect x="16" y="36" width="68" height="46" rx="9" fill={`url(#${id}-case)`} />
        <path d="M16 54h68" stroke="#4a2a10" strokeWidth="3" />
        <rect
          x="44"
          y="49"
          width="12"
          height="11"
          rx="2.5"
          fill="#ffd27a"
          stroke="#b8862f"
          strokeWidth="1.5"
        />
      </>
    ),
  },
  // a grid of colourful app tiles
  projects: {
    bg: ['#9d5cf5', '#8a45ec'],
    art: () => (
      <>
        {(
          [
            [19, 19, '#ffffff'],
            [53, 19, '#ffd60a'],
            [19, 53, '#64d2ff'],
            [53, 53, '#ff7eb6'],
          ] as const
        ).map(([x, y, c]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y + 2} width="28" height="28" rx="8" fill="#000" opacity="0.18" />
            <rect x={x} y={y} width="28" height="28" rx="8" fill={c} />
            <rect x={x} y={y} width="28" height="14" rx="8" fill="#fff" opacity="0.25" />
          </g>
        ))}
      </>
    ),
  },
  // a silicon chip with a golden die
  skills: {
    bg: ['#34c759', '#29b14c'],
    art: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}-chip`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3a3c" />
            <stop offset="1" stopColor="#2c2c2e" />
          </linearGradient>
          <linearGradient id={`${id}-die`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2c75c" />
            <stop offset="1" stopColor="#dcae42" />
          </linearGradient>
        </defs>
        <g fill="#e5e5ea">
          {[34, 45, 56].map((p) => (
            <g key={p}>
              <rect x={p} y="17" width="6" height="12" rx="2" />
              <rect x={p} y="71" width="6" height="12" rx="2" />
              <rect x="17" y={p} width="12" height="6" rx="2" />
              <rect x="71" y={p} width="12" height="6" rx="2" />
            </g>
          ))}
        </g>
        <rect x="26" y="26" width="48" height="48" rx="8" fill={`url(#${id}-chip)`} />
        <rect x="38" y="38" width="24" height="24" rx="4" fill={`url(#${id}-die)`} />
      </>
    ),
  },
  // the Mac terminal: black, with a white prompt
  terminal: {
    bg: ['#1c1c1e', '#111112'],
    art: () => (
      <>
        <path
          d="M21 25l11 8.5-11 8.5"
          fill="none"
          stroke="#fff"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M37 42h15" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
      </>
    ),
  },
  // an envelope
  contact: {
    bg: ['#3aa0ff', '#1d89ff'],
    art: (id) => (
      <>
        <defs>
          <linearGradient id={`${id}-env`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eef3fa" />
          </linearGradient>
        </defs>
        <rect
          x="15"
          y="27"
          width="70"
          height="48"
          rx="7"
          fill="#000"
          opacity="0.18"
          transform="translate(0 2.5)"
        />
        <rect x="15" y="27" width="70" height="48" rx="7" fill={`url(#${id}-env)`} />
        <path
          d="M18 73l24-21M82 73L58 52"
          stroke="#c3d2e6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M17 30l33 25 33-25"
          fill="none"
          stroke="#8fa9cc"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  // a page of a résumé with a folded corner
  resume: {
    bg: ['#ffa01f', '#ff8a00'],
    art: () => (
      <>
        <path
          d="M28 14h32l16 16v54a5 5 0 0 1-5 5H28a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5z"
          fill="#000"
          opacity="0.18"
          transform="translate(1.5 2.5)"
        />
        <path d="M28 14h32l16 16v54a5 5 0 0 1-5 5H28a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5z" fill="#fff" />
        <path d="M60 14v11a5 5 0 0 0 5 5h11z" fill="#d9d9de" />
        <circle cx="36" cy="33" r="6" fill="#ff9f0a" />
        <rect x="46" y="29" width="10" height="3.5" rx="1.75" fill="#3a3a3c" />
        <rect x="46" y="35" width="7" height="3" rx="1.5" fill="#aeaeb2" />
        {[48, 55, 62, 69].map((y, i) => (
          <rect key={y} x="31" y={y} width={i % 2 ? 30 : 38} height="3.2" rx="1.6" fill="#c7c7cc" />
        ))}
      </>
    ),
  },
  // the GitHub mark (Octocat)
  github: {
    bg: ['#2d333b', '#1f242b'],
    art: () => (
      <path
        fill="#fff"
        fillRule="evenodd"
        transform="translate(21 21) scale(3.625)"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    ),
  },
  // "in"
  linkedin: {
    bg: ['#1b78d0', '#0a66c2'],
    art: () => (
      <g fill="#fff" transform="translate(10 8) scale(3.3)">
        <rect x="5" y="9.5" width="3" height="9" rx="0.6" />
        <circle cx="6.5" cy="6.4" r="1.7" />
        <path d="M10.5 9.5h2.8v1.3c.6-.9 1.6-1.6 3.1-1.6 2.3 0 3.6 1.5 3.6 4.2v5.1h-3v-4.6c0-1.3-.5-2-1.6-2s-1.9.8-1.9 2.1v4.5h-3z" />
      </g>
    ),
  },
}

/** A macOS-style app icon. Size it with the `.app-icon` class (it fills its box). */
export function AppIcon({ id }: { id: IconId }) {
  const icon = ICONS[id]
  const uid = `ai${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <span className="app-icon" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={icon.bg[0]} />
            <stop offset="1" stopColor={icon.bg[1]} />
          </linearGradient>
          {/* soft light from above */}
          <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <path d={SQUIRCLE} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}-clip)`}>
          <path d={SQUIRCLE} fill={`url(#${uid}-bg)`} />
          {icon.art(uid)}
          <path d={SQUIRCLE} fill={`url(#${uid}-gloss)`} />
        </g>
      </svg>
    </span>
  )
}
