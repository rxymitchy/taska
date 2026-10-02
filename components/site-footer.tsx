import { brand } from "@/lib/brand"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line group-has-[.landing-home]:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{brand.name} · Hack4Freedom 2026</p>
        <p>{brand.footer}</p>
      </div>
    </footer>
  )
}
