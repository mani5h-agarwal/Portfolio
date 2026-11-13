import { Component, type ReactNode } from 'react'
import { ErrorPage } from '@/pages/ErrorPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/** The site is one page: the MacBook. Any other address gets the 404 page. */
function isHome(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const rest = path.startsWith(base) ? path.slice(base.length) : path
  return rest === '' || rest === '/' || rest === '/index.html'
}

/** Shows the error page instead of a blank screen if something throws while rendering. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }
  static getDerivedStateFromError(error: unknown) {
    return { error }
  }
  render() {
    return this.state.error ? <ErrorPage error={this.state.error} /> : this.props.children
  }
}

export function App({ path = window.location.pathname }: { path?: string }) {
  return (
    <ErrorBoundary>
      <div className="layout">
        <main>{isHome(path) ? <HomePage /> : <NotFoundPage />}</main>
      </div>
    </ErrorBoundary>
  )
}
