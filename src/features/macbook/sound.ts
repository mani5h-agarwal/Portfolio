// Synthesised scissor-switch key sounds (no audio files needed).
// Browsers only allow audio after a user gesture, so call unlockAudio() from one.

let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

export function unlockAudio() {
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state !== 'running') {
    void ctx.resume().catch(() => {})
    // Safari only opens audio output if something actually plays inside the gesture:
    // a one-sample silent buffer does it.
    const silent = ctx.createBufferSource()
    silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
    silent.connect(ctx.destination)
    silent.start(0)
  }
}

const GESTURES = ['pointerdown', 'mousedown', 'touchend', 'keydown', 'click'] as const

/**
 * Unlock audio on the visitor's first interaction anywhere on the page (any click, tap or key),
 * not just on the keyboard. Returns a cleanup function.
 */
export function installAudioUnlock() {
  const onGesture = () => {
    unlockAudio()
    if (ctx?.state === 'running') remove()
  }
  const remove = () => GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true))
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, true))
  return remove
}

/** Play a key click. `large` keys (space, return…) sound deeper. */
export function playKey(phase: 'down' | 'up', large: boolean, volume: number) {
  if (!ctx || !noise || volume <= 0) return
  // Still starting up (e.g. the very first click): queue the sound; it plays once audio resumes.
  if (ctx.state !== 'running') void ctx.resume().catch(() => {})
  const t = ctx.currentTime
  const level = volume * (phase === 'down' ? 0.55 : 0.22)
  const length = phase === 'down' ? 0.045 : 0.026

  const src = ctx.createBufferSource()
  src.buffer = noise
  src.playbackRate.value = 0.9 + Math.random() * 0.2

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.4
  band.frequency.value = phase === 'up' ? 5200 : large ? 1700 : 2800 + Math.random() * 1400

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(level, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)

  src.connect(band).connect(gain).connect(ctx.destination)
  src.start(t)
  src.stop(t + length + 0.01)

  // a soft low "thock" under the bigger keys
  if (phase === 'down' && large) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.06)
    g.gain.setValueAtTime(volume * 0.25, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    osc.connect(g).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.08)
  }
}
