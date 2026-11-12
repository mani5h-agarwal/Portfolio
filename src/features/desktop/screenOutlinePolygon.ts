/** The screen's outline on the page, as a CSS polygon relative to `box`; null if not rendered. */
export function screenOutlinePolygon(box: DOMRect) {
  const marks = document.querySelectorAll('.screen-outline > i')
  if (!marks.length) return null
  const pts = [...marks].map((m) => {
    const r = m.getBoundingClientRect()
    return `${(r.left - box.left).toFixed(1)}px ${(r.top - box.top).toFixed(1)}px`
  })
  return `polygon(${pts.join(', ')})`
}
