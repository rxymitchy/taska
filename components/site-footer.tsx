import { brand } from "@/lib/brand"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#12382b]/10 group-has-[.landing-home,.auth-page]:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[#3d5a49] sm:flex-row sm:items-center sm:justify-between">
        <p>{brand.name} · Hack4Freedom 2026</p>
        <p>{brand.footer}</p>
      </div>
    </footer>
  )
}