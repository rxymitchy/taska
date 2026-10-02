"use client"

import { useEffect, useState } from "react"

const sections = [
  ["top", "Home"],
  ["how", "How"],
  ["pay", "Pay"],
  ["join", "Join"],
] as const

export function LandingDock() {
  const [active, setActive] = useState("top")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)

        if (visibleSections[0]) {
          setActive(visibleSections[0].target.id)
        }
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: [0, 0.25, 0.5] },
    )

    for (const [id] of sections) {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed bottom-[calc(14px+env(safe-area-inset-bottom,0px))] left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-ink/80 p-1.5 shadow-[0_14px_30px_-10px_rgba(0,0,0,.6)] backdrop-blur-[18px] max-[899px]:flex"
    >
      {sections.map(([id, label]) => (
        <a
          key={id}
          aria-current={active === id ? "location" : undefined}
          className={`rounded-full px-3.5 py-[11px] text-[13px] font-semibold transition-colors ${active === id ? "bg-lime text-ink" : "text-[#cfe3d7] hover:bg-white/10"}`}
          href={`#${id}`}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}