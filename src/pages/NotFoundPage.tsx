import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="page">
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/">Go home</Link>
    </section>
  )
}
