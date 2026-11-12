import { NavLink, Outlet, useLocation } from 'react-router'
import { profile } from '@/config/profile'

export function Layout() {
  // The home screen is a full-screen MacBook, so it has no header bar.
  const isHome = useLocation().pathname === '/'
  return (
    <div className="layout">
      {!isHome && (
        <header className="header">
          <NavLink to="/" className="brand">
            {profile.name}
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
