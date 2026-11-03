import { brand } from "@/lib/brand"

export function SiteFooter() {
  return (
    <footer className="border-t border-[#12382b]/8 group-has-[.landing-home,.auth-page]:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-8 text-[13px] text-[#3d5a49] sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p>{brand.name} · Hack4Freedom 2026</p>
        <p>{brand.footer}</p>
      </div>
    </footer>
  )
}
