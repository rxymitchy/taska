import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 lg:px-0">
      <section className="content-surface">
        <h1 className="text-3xl tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted">That task or profile is not on Taska.</p>
        <Link className="mt-6 inline-flex h-11 items-center rounded-md border border-line bg-card px-4 text-sm font-bold text-accent hover:bg-tint" href="/tasks">
          Browse tasks
        </Link>
      </section>
    </div>
  )
}
