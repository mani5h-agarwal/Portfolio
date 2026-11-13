import { screen } from '@testing-library/react'
import { profile } from '@/config/profile'
import { renderRoute } from '@/test/render'

describe('app', () => {
  it('renders the MacBook home screen', () => {
    const { container } = renderRoute('/')
    // full MacBook layout: 78 keys including Touch ID and the four arrows
    expect(container.querySelectorAll('[data-key]')).toHaveLength(78)
    expect(container.querySelector('.mb-screen')).toBeInTheDocument()
    expect(container.querySelector('.mb-trackpad')).toBeInTheDocument()
  })

  it('shows my name as the page heading', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: profile.name })).toBeInTheDocument()
  })

  it('lights up keys pressed on the real keyboard', async () => {
    const { user, container } = renderRoute('/')
    const keyA = container.querySelector('[data-key="KeyA"]')
    await user.keyboard('[KeyA>]')
    expect(keyA).toHaveClass('is-pressed')
    await user.keyboard('[/KeyA]')
    expect(keyA).not.toHaveClass('is-pressed')
  })

  it('shows the brightness HUD on the display when F2 is clicked', async () => {
    const { user, container } = renderRoute('/')
    await user.click(container.querySelector('[data-key="F2"]')!)
    expect(screen.getByRole('status')).toHaveTextContent(/brightness/i)
  })

  it('toggles the caps lock light when clicked', async () => {
    const { user, container } = renderRoute('/')
    await user.click(container.querySelector('[data-key="CapsLock"]')!)
    expect(container.querySelector('.led')).toHaveClass('on')
  })

  it('shows 404 for unknown routes', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })
})
