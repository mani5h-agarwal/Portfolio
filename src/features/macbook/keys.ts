// MacBook Pro (Apple silicon) US-English keyboard layout.
// Widths are in key units; every row adds up to 14.5 units, like the real thing.
// Key ids match KeyboardEvent.code so physical key presses map straight onto keys.

import type { IconName } from './icons'

export type KeyKind =
  'letter' | 'dual' | 'word' | 'mod' | 'fn' | 'globe' | 'space' | 'arrow' | 'touchid'

export interface KeyDef {
  id: string
  kind: KeyKind
  /** Width in key units. */
  w: number
  /** Main legend: letter, unshifted symbol, or word ("shift", "delete"…). */
  label?: string
  /** Upper legend: shifted symbol or modifier symbol (⌘, ⌥…). */
  top?: string
  icon?: IconName
  /** Which side the legends hug (word & modifier keys). */
  align?: 'left' | 'right'
  /** Caps lock indicator light. */
  led?: boolean
}

const letter = (c: string): KeyDef => ({ id: `Key${c}`, kind: 'letter', w: 1, label: c })
const dual = (id: string, top: string, label: string): KeyDef => ({
  id,
  kind: 'dual',
  w: 1,
  top,
  label,
})
const word = (id: string, label: string, w: number, align: 'left' | 'right'): KeyDef => ({
  id,
  kind: 'word',
  w,
  label,
  align,
})
const mod = (
  id: string,
  label: string,
  top: string,
  w: number,
  align: 'left' | 'right',
): KeyDef => ({
  id,
  kind: 'mod',
  w,
  label,
  top,
  align,
})
const fkey = (n: number, icon: IconName): KeyDef => ({
  id: `F${n}`,
  kind: 'fn',
  w: 1,
  label: `F${n}`,
  icon,
})

export const ROWS: KeyDef[][] = [
  [
    word('Escape', 'esc', 1.5, 'left'),
    fkey(1, 'brightnessDown'),
    fkey(2, 'brightnessUp'),
    fkey(3, 'missionControl'),
    fkey(4, 'spotlight'),
    fkey(5, 'dictation'),
    fkey(6, 'doNotDisturb'),
    fkey(7, 'rewind'),
    fkey(8, 'playPause'),
    fkey(9, 'fastForward'),
    fkey(10, 'mute'),
    fkey(11, 'volumeDown'),
    fkey(12, 'volumeUp'),
    { id: 'TouchID', kind: 'touchid', w: 1 },
  ],
  [
    dual('Backquote', '~', '`'),
    ...'!@#$%^&*()'
      .split('')
      .map((top, i) => dual(`Digit${(i + 1) % 10}`, top, String((i + 1) % 10))),
    dual('Minus', '_', '-'),
    dual('Equal', '+', '='),
    word('Backspace', 'delete', 1.5, 'right'),
  ],
  [
    word('Tab', 'tab', 1.5, 'left'),
    ...'QWERTYUIOP'.split('').map(letter),
    dual('BracketLeft', '{', '['),
    dual('BracketRight', '}', ']'),
    dual('Backslash', '|', '\\'),
  ],
  [
    { ...word('CapsLock', 'caps lock', 1.8, 'left'), led: true },
    ...'ASDFGHJKL'.split('').map(letter),
    dual('Semicolon', ':', ';'),
    dual('Quote', '"', "'"),
    word('Enter', 'return', 1.7, 'right'),
  ],
  [
    word('ShiftLeft', 'shift', 2.3, 'left'),
    ...'ZXCVBNM'.split('').map(letter),
    dual('Comma', '<', ','),
    dual('Period', '>', '.'),
    dual('Slash', '?', '/'),
    word('ShiftRight', 'shift', 2.2, 'right'),
  ],
  [
    { id: 'Fn', kind: 'globe', w: 1, top: 'fn', icon: 'globe' },
    mod('ControlLeft', 'control', '⌃', 1, 'right'),
    mod('AltLeft', 'option', '⌥', 1, 'right'),
    mod('MetaLeft', 'command', '⌘', 1.25, 'right'),
    { id: 'Space', kind: 'space', w: 5 },
    mod('MetaRight', 'command', '⌘', 1.25, 'left'),
    mod('AltRight', 'option', '⌥', 1, 'left'),
    // the inverted-T arrow cluster (3 units) is rendered after this row
  ],
]

/** Inverted-T arrow cluster: all four keys are half height. */
export const ARROWS = {
  left: { id: 'ArrowLeft', kind: 'arrow', w: 1, label: '◀' },
  up: { id: 'ArrowUp', kind: 'arrow', w: 1, label: '▲' },
  down: { id: 'ArrowDown', kind: 'arrow', w: 1, label: '▼' },
  right: { id: 'ArrowRight', kind: 'arrow', w: 1, label: '▶' },
} satisfies Record<string, KeyDef>

export const ALL_KEYS: KeyDef[] = [...ROWS.flat(), ...Object.values(ARROWS)]
export const KEY_BY_ID = new Map(ALL_KEYS.map((k) => [k.id, k]))

/** Keys that make a deeper "thock" sound. */
export const LARGE_KEYS = new Set(['Space', 'Enter', 'Backspace', 'ShiftLeft', 'ShiftRight'])
