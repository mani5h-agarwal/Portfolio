/**
 * Calls `frame` on every animation frame, but only while it's worth drawing: `isActive()` says so
 * and the tab is in front. Otherwise it requests no frames at all, so a hidden animation costs
 * nothing (not even a wake-up 60 times a second to check). It looks again whenever the page's
 * state changes: the Mac sleeping or waking (`data-asleep`), an app opening or closing
 * (`data-app-open`), or the tab being hidden or shown. Returns a function that stops it.
 */
export function activeLoop(isActive: () => boolean, frame: (t: number) => void) {
  let raf = 0
  let running = false

  const run = (t: number) => {
    raf = requestAnimationFrame(run)
    frame(t)
  }
  const update = () => {
    const on = !document.hidden && isActive()
    if (on && !running) {
      running = true
      raf = requestAnimationFrame(run)
    } else if (!on && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const observer = new MutationObserver(update)
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-asleep', 'data-app-open'],
  })
  document.addEventListener('visibilitychange', update)
  update()

  return () => {
    observer.disconnect()
    document.removeEventListener('visibilitychange', update)
    cancelAnimationFrame(raf)
    running = false
  }
}
