export function NotFoundPage() {
  return (
    <section className="page">
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <a href={import.meta.env.BASE_URL}>Go home</a>
    </section>
  )
}
