import { memo } from 'react'

/**
 * Invisible markers around the Mac screen's outline, rounded corners included. While the camera
 * zooms, the screen is seen at an angle (narrower at the bottom), so its on-page shape isn't a box;
 * reading where these markers land gives that shape, and the app window opening on top of it is
 * cut to it, so it never spills onto the bezel. Corner radii match .mb-screen (in laptop cqw).
 */
const TOP_R = 3.8
const BOTTOM_R = 1.6
const ANGLES = [0, 30, 60, 90].map((d) => (d * Math.PI) / 180)

type Pos = { left?: string; right?: string; top?: string; bottom?: string }
const cq = (v: number) => `${v.toFixed(3)}cqw`

// clockwise from the top-left corner, each corner traced along its arc
const POINTS: Pos[] = [
  ...ANGLES.map((a) => ({
    left: cq(TOP_R * (1 - Math.cos(a))),
    top: cq(TOP_R * (1 - Math.sin(a))),
  })),
  ...ANGLES.map((a) => ({
    right: cq(TOP_R * (1 - Math.sin(a))),
    top: cq(TOP_R * (1 - Math.cos(a))),
  })),
  ...ANGLES.map((a) => ({
    right: cq(BOTTOM_R * (1 - Math.cos(a))),
    bottom: cq(BOTTOM_R * (1 - Math.sin(a))),
  })),
  ...ANGLES.map((a) => ({
    left: cq(BOTTOM_R * (1 - Math.sin(a))),
    bottom: cq(BOTTOM_R * (1 - Math.cos(a))),
  })),
]

/** Memoised: it never changes, so typing (which re-renders the laptop) skips it. */
export const ScreenOutline = memo(function ScreenOutline() {
  return (
    <div className="screen-outline" aria-hidden="true">
      {POINTS.map((p, i) => (
        <i key={i} style={p} />
      ))}
    </div>
  )
})
