import { Fragment, memo, type CSSProperties } from 'react'

/** Corner radii in cqw: top-left, top-right, bottom-right, bottom-left. */
export type Radii = [number, number, number, number]

interface EdgesProps {
  /** Size of the flat face these edges hang from, in cqw. */
  width: number
  height: number
  radii: Radii
  /** How deep the edges go behind the face, in cqw. */
  depth: number
  /** Straight segments used to approximate each rounded corner. */
  segments?: number
  /** Round the bottom edge inward with this radius (cqw), like a machined unibody. */
  bottomRadius?: number
}

/** Strips used to approximate the rounded bottom edge. */
const BEVEL_STEPS = 4

/** Extra darkness along the profile: where the wall meets the curve, and fully under the body. */
const DARK_WALL_END = 0.2
const DARK_UNDER = 0.75
const darkAt = (angle: number) =>
  DARK_WALL_END + (DARK_UNDER - DARK_WALL_END) * (1 - Math.cos(angle))

// Light comes from the front-left (screen left, toward the viewer's side of the laptop).
const LIGHT = (() => {
  const [x, y] = [-0.55, 0.85]
  const l = Math.hypot(x, y)
  return [x / l, y / l]
})()

/** Points around a rounded rectangle, counter-clockwise on screen (so edge normals face out). */
function outline(w: number, h: number, [tl, tr, br, bl]: Radii, segments: number) {
  const pts: [number, number][] = []
  const arc = (cx: number, cy: number, r: number, from: number) => {
    for (let i = 0; i <= segments; i++) {
      const a = ((from + (90 * i) / segments) * Math.PI) / 180
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
  }
  // clockwise on screen (y points down), then reversed
  arc(tl, tl, tl, 180)
  arc(w - tr, tr, tr, 270)
  arc(w - br, h - br, br, 0)
  arc(bl, h - bl, bl, 90)
  return pts.reverse()
}

/**
 * The thickness of a slab: a ring of thin faces around a rounded rectangle, each one hinged
 * down from the outline and turned back into depth (−z). Must sit inside an element with
 * `transform-style: preserve-3d` whose box is the slab's top face.
 */
export const Edges = memo(function Edges({
  width,
  height,
  radii,
  depth,
  segments = 7,
  bottomRadius = 0,
}: EdgesProps) {
  const pts = outline(width, height, radii, segments)
  const r = Math.min(bottomRadius, depth)
  const wall = depth - r // straight part before the bottom starts curving in
  // quarter-circle from vertical (0°) to horizontal (90°), as a few angled strips
  const bevel = Array.from({ length: r > 0 ? BEVEL_STEPS : 0 }, (_, k) => {
    const a0 = (Math.PI / 2) * (k / BEVEL_STEPS)
    const a1 = (Math.PI / 2) * ((k + 1) / BEVEL_STEPS)
    return {
      down: wall + r * Math.sin(a0),
      inward: r * (1 - Math.cos(a0)),
      length: 2 * r * Math.sin((a1 - a0) / 2),
      tilt: (((a0 + a1) / 2) * 180) / Math.PI,
      // shade runs continuously from one strip into the next
      dark0: darkAt(a0),
      dark1: darkAt(a1),
    }
  })
  return (
    <>
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % pts.length]
        const dx = nx - x
        const dy = ny - y
        const len = Math.hypot(dx, dy)
        if (len < 0.001) return null
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        // outward normal is the direction rotated +90° (y down): (−dy, dx)
        const shade = 0.5 + 0.5 * ((-dy / len) * LIGHT[0] + (dx / len) * LIGHT[1])
        const place = {
          left: `${x}cqw`,
          top: `${y}cqw`,
          // a hair longer than the segment so neighbouring faces don't show seams
          width: `${len + 0.08}cqw`,
          '--shade': shade.toFixed(3),
        }
        const side = `rotateZ(${angle}deg) rotateX(-90deg)`
        return (
          <Fragment key={i}>
            <div
              className="mb-edge"
              style={
                {
                  ...place,
                  height: `${wall + 0.05}cqw`,
                  transform: side,
                  // with a curved bottom, the wall's shading hands over smoothly to the curve
                  ...(r > 0 && { '--wall-end': DARK_WALL_END }),
                } as CSSProperties
              }
            />
            {bevel.map((b, k) => (
              <div
                key={k}
                className="mb-edge mb-edge-bevel"
                style={
                  {
                    ...place,
                    // overlap the next strip slightly so no hairline gaps show
                    height: `${b.length + 0.05}cqw`,
                    // move down the wall and in toward the middle, then tip the strip inward
                    transform: `${side} translate3d(0, ${b.down}cqw, ${-b.inward}cqw) rotateX(${-b.tilt}deg)`,
                    // the more it faces down, the less light it catches
                    '--dark0': b.dark0.toFixed(3),
                    '--dark1': b.dark1.toFixed(3),
                  } as CSSProperties
                }
              />
            ))}
          </Fragment>
        )
      })}
    </>
  )
})
