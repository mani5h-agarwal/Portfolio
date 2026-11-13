import type { CSSProperties, ReactNode, Ref } from 'react'
import { Edges, type Radii } from './Edges'
import { Key } from './Key'
import { ARROWS, ROWS, type KeyDef } from './keys'
import type { Finish } from './useSettings'

/** Laptop proportions in cqw (percent of the laptop's width). The lid closes flush on the deck. */
export const DECK_H = 75.14
export const LID_H = DECK_H
const DECK_T = 2 // body thickness
const LID_T = 0.55 // lid thickness
// corner radii (cqw), made once: a new array each render would redraw the memoised edges
const LID_RADII: Radii = [5.5, 5.5, 3, 3]
const DECK_RADII: Radii = [3, 3, 5.5, 5.5]

interface MacBookProps {
  pressed: ReadonlySet<string>
  capsOn: boolean
  backlight: number
  finish: Finish
  /** Display brightness, 0–1. */
  screenBrightness: number
  onPress: (id: string) => void
  onRelease: (id: string) => void
  onTrackpad: () => void
  /** Rendered on the display. */
  children?: ReactNode
  /** Elements the opening animation moves (see useOpening.ts). */
  sceneRef?: Ref<HTMLDivElement>
  cameraRef?: Ref<HTMLDivElement>
  laptopRef?: Ref<HTMLDivElement>
  lidRef?: Ref<HTMLDivElement>
}

/**
 * A 14" MacBook Pro built as a 3D object: the lid (display, aluminium back, edges) hinges on the
 * deck (keyboard, trackpad, body edges). At rest it's open and seen from directly above.
 */
export function MacBook({
  pressed,
  capsOn,
  backlight,
  finish,
  screenBrightness,
  onPress,
  onRelease,
  onTrackpad,
  children,
  sceneRef,
  cameraRef,
  laptopRef,
  lidRef,
}: MacBookProps) {
  const key = (def: KeyDef, half = false) => (
    <Key
      key={def.id}
      def={def}
      half={half}
      pressed={pressed.has(def.id)}
      capsOn={def.led ? capsOn : undefined}
      onPress={onPress}
      onRelease={onRelease}
    />
  )

  return (
    <div
      ref={sceneRef}
      className={`mb-scene finish-${finish}`}
      style={
        {
          '--bl-base': backlight,
          '--deck-h': DECK_H,
          '--lid-h': LID_H,
          '--lid-t': LID_T,
          '--deck-t': DECK_T,
        } as CSSProperties
      }
    >
      <div className="mb-camera" ref={cameraRef}>
        <div className="mb-laptop" ref={laptopRef}>
          <div className="mb-lid" ref={lidRef}>
            <div className="mb-screen">
              <div className="mb-screen-content">{children}</div>
              <div
                className="mb-screen-dim"
                style={{ opacity: (1 - screenBrightness) * 0.92 }}
                aria-hidden="true"
              />
              <div className="mb-screen-glare" aria-hidden="true" />
              {/* black until the laptop wakes up as it opens (--wake) */}
              <div className="mb-screen-wake" aria-hidden="true" />
            </div>
            {/* outside of the lid: aluminium back and edges, seen when it's closed */}
            <div className="mb-lid-back" aria-hidden="true" />
            <Edges width={100} height={LID_H} radii={LID_RADII} depth={LID_T} />
          </div>

          <div className="mb-deck">
            <div className="mb-hinge" />
            <div className="mb-top">
              <div className="mb-grille" />
              <div
                className="mb-well"
                role="img"
                aria-label="Backlit MacBook keyboard. Press or click the keys."
              >
                <div className="kb">
                  {ROWS.map((row, i) => (
                    <div className="kb-row" key={i}>
                      {row.map((def) => key(def))}
                      {i === ROWS.length - 1 && (
                        <div className="kb-arrows">
                          {key(ARROWS.left, true)}
                          <div className="kb-arrows-mid">
                            {key(ARROWS.up, true)}
                            {key(ARROWS.down, true)}
                          </div>
                          {key(ARROWS.right, true)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-grille" />
            </div>
            <div className="mb-trackpad" onPointerDown={onTrackpad} />
            <div className="mb-notch" />
            {/* seen from outside: finger scoop in the front edge, and the laptop's shadow */}
            <div className="mb-front-scoop" aria-hidden="true" />
            <div className="mb-contact-shadow" aria-hidden="true" />
            <Edges
              width={100}
              height={DECK_H}
              radii={DECK_RADII}
              depth={DECK_T}
              bottomRadius={DECK_T * 0.55}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
