"use client"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="text-3xl tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted">Refresh the page. If this is a new setup, check that the database is running and seeded.</p>
      <button
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </div>
  )
}
