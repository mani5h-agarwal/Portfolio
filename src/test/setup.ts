import '@testing-library/jest-dom/vitest'

// jsdom has no canvas; return no context instead of logging "not implemented" errors.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext
