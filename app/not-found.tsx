import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <h1 className="text-3xl tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">That task or profile is not on Taska.</p>
      <Link className="mt-6 inline-flex text-sm font-semibold text-accent" href="/tasks">
        Browse tasks
      </Link>
    </div>
  )
}
