"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"

type Variant = "primary" | "secondary"

const variants: Record<Variant, { surface: string; chip: string; glow: string }> = {
  // orange: evaluators / sign up
  primary: {
    surface:
      "border-[#c8732a]/40 bg-[linear-gradient(135deg,#f6c9a0,#f0ac6e_45%,#e0883a)] text-[#12382b] shadow-[0_14px_30px_-14px_rgba(224,136,58,.95)] hover:shadow-[0_22px_40px_-14px_rgba(224,136,58,1)]",
    chip: "bg-[#12382b] text-[#f6c9a0]",
    glow: "rgba(255,238,214,.65)",
  },
  // green: companies / log in
  secondary: {
    surface:
      "border-[#8fb8a3]/35 bg-[linear-gradient(135deg,#2f6b53,#12382b)] text-[#f7f3e8] shadow-[0_14px_30px_-14px_rgba(18,56,43,.95)] hover:shadow-[0_22px_40px_-14px_rgba(18,56,43,1)]",
    chip: "bg-[#f0ac6e] text-[#12382b]",
    glow: "rgba(143,184,163,.5)",
  },
}

const sizes = {
  md: "px-7 py-3.5 text-[15px]",
  sm: "px-5 py-2.5 text-[14px]",
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function Ripple({ x, y }: { x: number; y: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    ref.current?.animate(
      [
        { transform: "scale(0)", opacity: 0.55 },
        { transform: "scale(6)", opacity: 0 },
      ],
      { duration: 650, easing: "ease-out", fill: "forwards" },
    )
  }, [])
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute size-16 rounded-full bg-[#fff1de]/60"
      style={{ left: x - 32, top: y - 32 }}
    />
  )
}

type Props = {
  children: ReactNode
  variant?: Variant
  size?: keyof typeof sizes
  block?: boolean
  href?: string
  type?: "submit" | "button"
  pending?: boolean
  pendingLabel?: string
  disabled?: boolean
}

export function AuthBtn({
  children,
  variant = "primary",
  size = "md",
  block = false,
  href,
  type = "button",
  pending = false,
  pendingLabel,
  disabled = false,
}: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const v = variants[variant]
  const off = disabled || pending

  const className = `group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border font-semibold transition duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53] ${sizes[size]} ${block ? "w-full" : ""} ${v.surface}`

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (off || e.pointerType !== "mouse" || reduced()) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty("--bx", `${x}px`)
    el.style.setProperty("--by", `${y}px`)
    // leans a little toward the cursor
    el.style.transform = `translate(${((x / r.width - 0.5) * 8).toFixed(1)}px, ${((y / r.height - 0.5) * 6 - 2).toFixed(1)}px)`
  }

  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ""
  }

  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (off || reduced()) return
    const r = e.currentTarget.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
    setTimeout(() => setRipples((rs) => rs.filter((q) => q.id !== id)), 650)
  }

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(110px circle at var(--bx, 50%) var(--by, 50%), ${v.glow}, transparent 70%)` }}
      />
      {ripples.map((r) => (
        <Ripple key={r.id} x={r.x} y={r.y} />
      ))}
      <span className="relative z-10 inline-flex items-center">
        {pending ? (
          <>
            <svg viewBox="0 0 24 24" className="mr-2.5 size-4 animate-spin motion-reduce:animate-none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
            {pendingLabel ?? children}
          </>
        ) : (
          <>
            {children}
            <span
              aria-hidden="true"
              className={`grid h-6 w-0 place-items-center overflow-hidden rounded-full opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:w-6 group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:w-6 group-focus-visible:opacity-100 ${v.chip}`}
            >
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </>
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} style={{ transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .3s" }} onPointerMove={onMove} onPointerLeave={onLeave} onPointerDown={onDown}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={off}
      aria-busy={pending || undefined}
      className={className}
      style={{ transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .3s" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
    >
      {inner}
    </button>
  )
}