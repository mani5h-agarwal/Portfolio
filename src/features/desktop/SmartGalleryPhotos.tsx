import { useId } from 'react'
import type { DemoPhoto } from './smartGalleryData'

/** The "photos" in SmartGalleryX's demo, drawn as flat illustrations in the style of its icon */

function Scene({ p }: { p: DemoPhoto }) {
  const v = p.variant ?? 0
  switch (p.kind) {
    case 'mountain':
      return (
        <>
          <circle cx={v === 2 ? 30 : 72} cy="26" r="9" fill="#fff4d6" />
          <path d="M-5 100 30 38l18 26 14-20 43 56z" fill={v === 1 ? '#5a6fd6' : '#4a3aa8'} />
          <path d="M30 38 22 52l8-4 6 6 6-6z" fill="#fff" />
          <path d="M62 44 54 56l8-3 5 4 5-3z" fill="#fff" />
          <path d="M20 100 62 44l43 56z" fill={v === 1 ? '#3b4fb8' : '#2c2477'} />
        </>
      )
    case 'beach':
      return (
        <>
          <circle cx="50" cy="60" r="16" fill={v ? '#ffd27a' : '#fff1c1'} />
          <rect y="60" width="100" height="22" fill={v ? '#3b3f9e' : '#2f7fc1'} />
          <path
            d="M10 66h20M50 70h30M18 74h22M62 64h18"
            stroke="#fff"
            strokeOpacity="0.45"
            strokeWidth="1.6"
          />
          <path d="M0 82q30-8 60-2t40 0v20H0z" fill="#f2c98f" />
          {!v && (
            <path
              d="M78 82 82 60M82 60q-10-2-14 4M82 60q8-6 14-2"
              stroke="#3d2b1f"
              strokeWidth="2"
              fill="none"
            />
          )}
        </>
      )
    case 'dinner':
      return (
        <>
          <ellipse cx="50" cy="54" rx="34" ry="26" fill={v ? '#e9e4da' : '#c98a5b'} />
          {[
            [32, 42],
            [68, 42],
            [32, 66],
            [68, 66],
          ].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <circle cx={x} cy={y} r="8" fill="#fff" />
              <circle cx={x} cy={y} r="4.5" fill={v ? '#e85d4a' : '#7fb85a'} />
            </g>
          ))}
          <circle cx="50" cy="54" r="5" fill="#ffcf66" />
          {[
            [14, 30, '#f2c6a0'],
            [86, 30, '#8d5a3b'],
            [14, 80, '#c68b62'],
            [86, 80, '#f0d2b4'],
          ].map(([x, y, c]) => (
            <circle key={`${x}${y}`} cx={x as number} cy={y as number} r="9" fill={c as string} />
          ))}
        </>
      )
    case 'dog':
      return (
        <>
          <rect y="68" width="100" height="32" fill={v ? '#9ccc65' : '#7cb342'} />
          <circle cx={v ? 78 : 24} cy="78" r="5" fill="#ff7043" />
          <ellipse cx="52" cy="66" rx="18" ry="10" fill={v ? '#c98a4b' : '#f3e2c7'} />
          <circle cx="70" cy="54" r="9" fill={v ? '#c98a4b' : '#f3e2c7'} />
          <ellipse cx="74" cy="47" rx="3.5" ry="6" fill={v ? '#8a5a2b' : '#b07a4a'} />
          <circle cx="73" cy="53" r="1.4" fill="#222" />
          <path
            d="M38 74v10M46 75v9M58 75v9M65 74v10"
            stroke={v ? '#8a5a2b' : '#c9b08c'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M35 62q-8-8-4-14"
            stroke={v ? '#c98a4b' : '#f3e2c7'}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )
    case 'cake':
      return (
        <>
          <rect x="22" y="56" width="56" height="26" rx="4" fill="#fff" />
          <rect x="22" y="56" width="56" height="7" rx="3" fill="#ff8fb1" />
          <rect x="30" y="40" width="40" height="18" rx="4" fill="#ffe3ec" />
          <path d="M30 44q5 5 10 0t10 0 10 0 10 0" stroke="#ff8fb1" strokeWidth="3" fill="none" />
          {[38, 50, 62].map((x) => (
            <g key={x}>
              <rect x={x - 1.5} y="28" width="3" height="12" fill="#7e90ff" />
              <ellipse cx={x} cy="25" rx="2.4" ry="3.6" fill="#ffb300" />
            </g>
          ))}
          <rect x="14" y="82" width="72" height="4" rx="2" fill="#e0c2cf" />
        </>
      )
    case 'city':
      return (
        <>
          <circle cx="76" cy="22" r="7" fill="#fff6cc" />
          {[
            [6, 50, 16],
            [24, 38, 14],
            [40, 56, 18],
            [60, 30, 14],
            [76, 48, 18],
          ].map(([x, y, w]) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={100 - y} fill="#12152e" />
              {Array.from({ length: 6 }, (_, i) => (
                <rect
                  key={i}
                  x={x + 3 + (i % 2) * (w / 2 - 1)}
                  y={y + 6 + Math.floor(i / 2) * 9}
                  width="4"
                  height="4"
                  fill={(x + i) % 3 ? '#ffd56b' : '#3a3f6e'}
                />
              ))}
            </g>
          ))}
        </>
      )
    case 'lake':
      return (
        <>
          <path d="M0 58 20 30l14 20 16-26 22 34 12-12 16 12z" fill="#2e7d6b" />
          <rect y="58" width="100" height="42" fill="#7fc8d8" />
          <path d="M0 58 20 82l14-18 16 30 22-36 12 14 16-12z" fill="#2e7d6b" opacity="0.35" />
          <path d="M14 70h20M56 78h26" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" />
        </>
      )
  }
}

/** One photo tile: its sky, then its scene */
export function Photo({ p }: { p: DemoPhoto }) {
  const id = `sg${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
      <Scene p={p} />
    </svg>
  )
}
