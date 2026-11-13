import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/app/App'

/** Render the full app at a given URL. */
export function renderRoute(path = '/') {
  return { user: userEvent.setup(), ...render(<App path={path} />) }
}
