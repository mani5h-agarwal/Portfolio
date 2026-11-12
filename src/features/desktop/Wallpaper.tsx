import { memo, useId } from 'react'

/**
 * The Mac's wallpaper: a soft pastel night sky, deep blue fading to lavender and pink, with a
 * little crescent moon and a few twinkling sparkles. Pure SVG, sharp at any zoom.
 */

const W = 1600
const H = 1000

// sparkles: [x, y, size, twinkle delay in s]
const SPARKLES = [
  [210, 150, 16, 0],
  [760, 120, 13, 0.7],
  [1240, 140, 10, 1.8],
  // lower down, where they show while the laptop sits open
  [150, 640, 14, 0.4],
  [420, 760, 9, 1.6],
  [1030, 610, 12, 2.3],
  [1500, 760, 10, 1],
  [640, 590, 8, 2.8],
] as const

// tiny dots of starlight: [x, y, radius]
const DOTS = [
  [90, 90, 2.2],
  [330, 60, 1.6],
  [560, 190, 2],
  [880, 70, 1.8],
  [1120, 110, 2.2],
  [1500, 80, 1.6],
  [300, 380, 1.6],
  [840, 380, 2],
  [1560, 300, 2],
  [40, 260, 1.6],
  [260, 560, 2],
  [560, 690, 1.6],
  [900, 560, 1.8],
  [1180, 720, 1.6],
  [1400, 560, 2],
  [80, 820, 1.4],
  [1560, 640, 1.6],
  [760, 820, 1.4],
] as const

/** a four-pointed sparkle centred on (x, y) */
const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} ` +
  `Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z`

/** Memoised: it never changes, so typing (which re-renders the laptop) skips it. */
export const Wallpaper = memo(function Wallpaper({ className = '' }: { className?: string }) {
  // unique ids: there are two wallpapers on the page (the Mac's screen and behind an open app),
  // and shared ids made one borrow the other's moon, which vanished when that one was hidden
  const id = `wp${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <>
      <svg
        className={`wallpaper ${className}`}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            {/* twilight: deep navy, through indigo and violet, to orchid, rose and a warm horizon */}
            <stop offset="0" stopColor="#0b1033" />
            <stop offset="0.32" stopColor="#221f68" />
            <stop offset="0.56" stopColor="#4f3aa8" />
            <stop offset="0.76" stopColor="#a65fb8" />
            <stop offset="0.9" stopColor="#e98aa8" />
            <stop offset="1" stopColor="#ffbe9c" />
          </linearGradient>
          {/* soft glows for depth: warm light along the horizon, a cool haze up left, magenta right */}
          <radialGradient id={`${id}-horizon`} cx="0.5" cy="1.05" r="0.6">
            <stop offset="0" stopColor="#ffd6b5" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd6b5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-cool`} cx="0.12" cy="0.3" r="0.5">
            <stop offset="0" stopColor="#3f7bff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3f7bff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-magenta`} cx="0.92" cy="0.82" r="0.45">
            <stop offset="0" stopColor="#ff6fc4" stopOpacity="0.3" />
            <stop offset="1" stopColor="#ff6fc4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#fff4d6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
          </radialGradient>
          <mask id={`${id}-crescent`}>
            <circle cx="1300" cy="640" r="54" fill="#fff" />
            <circle cx="1326" cy="618" r="48" fill="#000" />
          </mask>
        </defs>

        <rect width={W} height={H} fill={`url(#${id}-sky)`} />
        <rect width={W} height={H} fill={`url(#${id}-cool)`} />
        <rect width={W} height={H} fill={`url(#${id}-magenta)`} />
        <rect width={W} height={H} fill={`url(#${id}-horizon)`} />

        {/* crescent moon */}
        <circle cx="1300" cy="640" r="170" fill={`url(#${id}-glow)`} />
        <circle cx="1300" cy="640" r="54" fill="#fff3d1" mask={`url(#${id}-crescent)`} />

        {DOTS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.7" />
        ))}
      </svg>
      {/* The twinkling sparkles are separate little elements over the picture, not part of it: the
        browser can then animate them on the GPU, instead of repainting the whole screen every
        frame. Laid out on the same 1600×1000 picture, scaled and anchored the same way. */}
      <div className="wp-sparkles" aria-hidden="true">
        <div className="wp-sparkles-frame">
          {SPARKLES.map(([x, y, s, d], i) => (
            <svg
              key={i}
              className="wp-sparkle"
              viewBox={`${-s} ${-s} ${2 * s} ${2 * s}`}
              style={{
                left: `${((x - s) / W) * 100}%`,
                top: `${((y - s) / H) * 100}%`,
                width: `${((2 * s) / W) * 100}%`,
                animationDelay: `${d}s`,
              }}
            >
              <path d={sparkle(0, 0, s)} fill="#fff" />
            </svg>
          ))}
        </div>
      </div>
    </>
  )
})
