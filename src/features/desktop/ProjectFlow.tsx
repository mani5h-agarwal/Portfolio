import type { CSSProperties } from 'react'
import type { Project } from '@/config/portfolio'

/**
 * How a project works, as a diagram: two flows running down side by side, each step a card with a
 * live connector (a dot travelling along it), meeting in one result at the bottom.
 */
export function ProjectFlow({ how, tint }: { how: Project['how']; tint: string }) {
  // every card's place in the build-up, across both lanes
  const starts = how.lanes.map((_, li) =>
    how.lanes.slice(0, li).reduce((sum, l) => sum + l.steps.length, 0),
  )
  const total = how.lanes.reduce((sum, l) => sum + l.steps.length, 0)
  return (
    <div className="flow" style={{ '--tint': tint } as CSSProperties}>
      <div className="flow-lanes">
        {how.lanes.map((lane, li) => (
          <div key={lane.title} className="flow-lane">
            <h5 style={{ '--n': li } as CSSProperties}>{lane.title}</h5>
            {lane.steps.map((s, si) => (
              <div key={s.title} className="flow-unit">
                <div className="flow-step" style={{ '--n': starts[li] + si + 1 } as CSSProperties}>
                  <strong>{s.title}</strong>
                  {s.detail && <small>{s.detail}</small>}
                </div>
                <i
                  className="flow-link"
                  style={{ '--n': starts[li] + si + 1 } as CSSProperties}
                  aria-hidden="true"
                />
              </div>
            ))}
            {/* the rest of the way down to where the lanes meet */}
            <i
              className="flow-link flow-tail"
              style={{ '--n': starts[li] + lane.steps.length } as CSSProperties}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <svg
        className="flow-merge"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M25 0C25 12 50 8 50 20M75 0C75 12 50 8 50 20" />
      </svg>

      <div className="flow-result" style={{ '--n': total + 1 } as CSSProperties}>
        <strong>{how.result.title}</strong>
        {how.result.detail && <small>{how.result.detail}</small>}
      </div>
    </div>
  )
}
