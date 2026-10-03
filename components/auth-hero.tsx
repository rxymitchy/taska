"use client"

import type { CSSProperties, ReactNode } from "react"

export function AuthHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
      }}
      style={{ ["--mx"]: "70%", ["--my"]: "30%" } as CSSProperties}
      className={className}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(460px circle at var(--mx) var(--my), rgba(240,172,110,.26), transparent 70%)" }}
      />
      {children}
    </section>
  )
}