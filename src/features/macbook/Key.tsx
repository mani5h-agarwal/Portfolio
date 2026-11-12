import { memo, type CSSProperties } from 'react'
import { Icon } from './icons'
import type { KeyDef } from './keys'

interface KeyProps {
  def: KeyDef
  pressed: boolean
  capsOn?: boolean
  half?: boolean
  onPress: (id: string) => void
  onRelease: (id: string) => void
}

export const Key = memo(function Key({ def, pressed, capsOn, half, onPress, onRelease }: KeyProps) {
  const release = () => onRelease(def.id)
  return (
    <div
      className={`key key-${def.kind}${half ? ' key-half' : ''}${pressed ? ' is-pressed' : ''}`}
      style={{ '--w': def.w } as CSSProperties}
      data-key={def.id}
      onPointerDown={(e) => {
        e.preventDefault()
        if (e.pointerType !== 'mouse') e.currentTarget.releasePointerCapture(e.pointerId)
        onPress(def.id)
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      <div className="cap">
        <Legend def={def} capsOn={capsOn} />
      </div>
    </div>
  )
})

function Legend({ def, capsOn }: { def: KeyDef; capsOn?: boolean }) {
  switch (def.kind) {
    case 'letter':
      return <span className="lg lg-letter">{def.label}</span>
    case 'dual':
      return (
        <span className="lg lg-dual">
          <span>{def.top}</span>
          <span>{def.label}</span>
        </span>
      )
    case 'word':
      return (
        <>
          {def.led ? <span className={`led${capsOn ? ' on' : ''}`} /> : <span />}
          <span className={`lg lg-word lg-${def.align}`}>{def.label}</span>
        </>
      )
    case 'mod':
      return (
        <>
          <span className={`lg lg-sym lg-${def.align}`}>{def.top}</span>
          <span className={`lg lg-word lg-${def.align}`}>{def.label}</span>
        </>
      )
    case 'globe':
      return (
        <>
          <span className="lg lg-sym lg-right">{def.top}</span>
          <Icon name="globe" className="lg lg-globe" />
        </>
      )
    case 'fn':
      return (
        <>
          <Icon name={def.icon!} className="lg lg-icon" />
          <span className="lg lg-fn">{def.label}</span>
        </>
      )
    case 'arrow':
      return <span className="lg lg-arrow">{def.label}</span>
    default:
      return null
  }
}
