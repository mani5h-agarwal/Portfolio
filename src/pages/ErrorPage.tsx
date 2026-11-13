export function ErrorPage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return (
    <section className="page">
      <h1>Something went wrong</h1>
      <pre>{message}</pre>
    </section>
  )
}
