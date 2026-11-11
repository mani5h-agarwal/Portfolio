import { screen } from '@testing-library/react'
import { renderRoute } from '@/test/render'

describe('app', () => {
  it('renders the home page and counter', async () => {
    const { user } = renderRoute('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('It works')

    await user.click(screen.getByRole('button', { name: /count is 0/i }))
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })

  it('navigates to about', async () => {
    const { user } = renderRoute('/')
    await user.click(screen.getByRole('link', { name: 'About' }))
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
  })

  it('shows 404 for unknown routes', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })
})
