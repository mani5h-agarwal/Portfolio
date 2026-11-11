import { NavLink, Outlet } from 'react-router'
import { env } from '@/lib/env'

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <span className="brand">{env.appName}</span>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
