import { useEffect, useRef } from 'react'
import { activeLoop } from './activeLoop'

/**
 * Digital rain as a quiet background: streams of glyphs falling in three depths. Near streams are
 * bigger, brighter and faster; far ones small, dim and slow, so it reads as space rather than a
 * flat wall. Warm greys, like the page's text, each stream led by a lighter glyph. It paints its
 * own soft, dark gradient underneath, and the trails fade back into that gradient.
 */
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789'
const STEP_MS = 55 // it moves in discrete steps, not smooth motion
const FADE = 0.07 // how much of the trail fades each step: lower = longer trails
const DENSITY = 0.75 // streams per 16px of width
/** ✦ Polish: glyphs that fall near the mouse light up (with CursorLight), within this radius */
const TORCH_R = 230

/** The depths: glyph size (px at a 1440px-wide page), speed, and trail/head colour. */
const DEPTHS = [
  { size: 11, speed: 0.45, body: 'rgba(150, 144, 138, 0.3)', head: 'rgba(220, 214, 206, 0.52)' },
  { size: 14, speed: 0.7, body: 'rgba(160, 154, 147, 0.48)', head: 'rgba(230, 224, 216, 0.78)' },
  { size: 18, speed: 1, body: 'rgba(170, 164, 156, 0.64)', head: 'rgba(240, 234, 226, 0.95)' },
] as const
/** how many streams fall in each depth: mostly far, a few near */
const DEPTH_WEIGHTS = [0.45, 0.35, 0.2]

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

/** Few cores or little memory: draw the rain at 1× (a quarter of the pixels on a Retina screen). */
const lowEnd = () => {
  const n = navigator as Navigator & { deviceMemory?: number }
  return (n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory ?? 8) <= 4
}

const pickDepth = () => {
  let r = Math.random()
  for (let i = 0; i < DEPTH_WEIGHTS.length; i++) if ((r -= DEPTH_WEIGHTS[i]) < 0) return i
  return 0
}

interface Drop {
  depth: number
  x: number // left edge, px
  y: number // in rows of its own size
  speed: number
}

export function MatrixRain({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let scale = 1 // glyph sizes follow the page width a little
    let drops: Drop[] = []
    let backdrop: CanvasGradient | string = '#08080a'
    // the mouse, in the canvas's coordinates (null: no mouse over the page)
    let mouse: { x: number; y: number } | null = null
    let box = canvas.getBoundingClientRect()

    const sizeOf = (d: Drop) => Math.round(DEPTHS[d.depth].size * scale)
    const newDrop = (fromTop: boolean): Drop => {
      const depth = pickDepth()
      const size = Math.round(DEPTHS[depth].size * scale)
      const rows = height / size
      return {
        depth,
        x: Math.floor((Math.random() * width) / size) * size, // on its own depth's grid
        y: fromTop ? -Math.random() * rows * 0.5 : Math.random() * rows,
        speed: DEPTHS[depth].speed * (0.75 + Math.random() * 0.5),
      }
    }

    const resize = () => {
      // the rain is soft by nature: 1.5× is plenty sharp, and far fewer pixels than 2×
      const dpr = Math.min(window.devicePixelRatio || 1, lowEnd() ? 1 : 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scale = Math.max(0.8, Math.min(1.15, width / 1440))
      // a soft, dark backdrop: a touch of light up high, falling off to near-black
      const cx = width / 2
      const cy = height * 0.36
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.75)
      g.addColorStop(0, '#0e0c10') // a hint of the wallpaper's violet in the middle
      g.addColorStop(0.55, '#060507')
      g.addColorStop(1, '#020202')
      backdrop = g
      ctx.fillStyle = backdrop
      ctx.fillRect(0, 0, width, height)
      drops = Array.from({ length: Math.round((width / 16) * DENSITY) }, () => newDrop(false))
    }

    const cell = (d: Drop, row: number, color: string) => {
      const size = sizeOf(d)
      const y = row * size
      ctx.fillStyle = backdrop
      ctx.fillRect(d.x, y, size, size)
      ctx.font = `${size}px ui-monospace, "SF Mono", Menlo, monospace`
      ctx.fillStyle = color
      const glyph = randomChar()
      ctx.fillText(glyph, d.x + size / 2, y)
      // near the mouse: drawn again in warm light, brighter the closer it is
      if (mouse) {
        const dist = Math.hypot(d.x + size / 2 - mouse.x, y + size / 2 - mouse.y)
        if (dist < TORCH_R) {
          ctx.globalAlpha = (1 - dist / TORCH_R) ** 1.5 * (0.35 + d.depth * 0.25)
          ctx.fillStyle = '#ffe9dc'
          ctx.fillText(glyph, d.x + size / 2, y)
          ctx.globalAlpha = 1
        }
      }
    }

    // One discrete step: every trail fades a little back into the backdrop, then each stream that
    // has reached a new row draws its glyph there.
    const step = () => {
      ctx.globalAlpha = FADE
      ctx.fillStyle = backdrop
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      drops.forEach((d, i) => {
        const prev = Math.floor(d.y)
        d.y += d.speed
        const row = Math.floor(d.y)
        if (row === prev) return
        const { body, head } = DEPTHS[d.depth]
        if (prev >= 0) cell(d, prev, body) // the last head becomes part of the trail
        if (row >= 0) cell(d, row, head)
        // now and then a glyph further up the trail changes
        if (row > 4 && Math.random() < 0.06) cell(d, row - 2 - Math.floor(Math.random() * 6), body)
        if (row * sizeOf(d) > height && Math.random() < 0.15) drops[i] = newDrop(true)
      })
    }

    // Reduced motion: paint one still frame of rain instead of animating.
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const setup = () => {
      resize()
      if (still) for (let i = 0; i < 120; i++) step()
    }
    setup()
    const observer = new ResizeObserver(setup)
    observer.observe(canvas)
    if (still) return () => observer.disconnect()

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return void (mouse = null)
      // measured here, when the cursor moves, not on every step of the rain
      box = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - box.left, y: e.clientY - box.top }
    }
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) mouse = null // left the window
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut)

    // stopped altogether while an app covers the whole page (or the tab is hidden)
    let last = 0
    const stopLoop = activeLoop(
      () => !canvas.closest('[data-app-open]'),
      (t) => {
        if (t - last < STEP_MS) return
        last = t
        step()
      },
    )

    return () => {
      stopLoop()
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onOut)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
