"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Bricolage_Grotesque, Figtree } from "next/font/google"
import { LandingDemoCard } from "@/components/landing-demo-card"
import { LandingDock } from "@/components/landing-dock"

/*
  Colour system: green and orange blended, no pure white anywhere.

  GREEN  deep #12382b  forest #1c4a3a  leaf #2f6b53  olive #55864f  sage #8fb8a3  mist #d3e6da
  WARM   amber #c8923a  orange #e8964f  soft #f0ac6e  peach #f6c9a0  cream #fbdcbd
  TEXT   on light #12382b / #3d5a49     on dark #f7f3e8

  Colour code
  speakers  -> orange   (Sign me up, Join as a speaker)
  companies -> green    (For companies)
  the steps blend from green to orange, ending where the money is
*/

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--landing-display", display: "swap" })
const body = Figtree({ subsets: ["latin"], variable: "--landing-body", display: "swap" })

const D = "font-[family-name:var(--landing-display)]"
const H2 = `${D} text-[clamp(30px,4vw,50px)] font-bold leading-[1.05] tracking-[-0.035em] text-[#12382b]`

const steps = [
  { title: "Company sends an AI answer", body: "A greeting, slang or phrase." },
  { title: "You fix what's off", body: "Write it how people talk." },
  { title: "A speaker checks", body: "Not approved? Nobody pays." },
  { title: "You get paid", body: "Straight to your wallet. We never hold it." },
]

// each step takes the next shade on the way from green to orange
const tones = [
  { solid: "#2f6b53", soft: "#d3e6da", text: "#f4f8f0", icon: "#cfe3d8", wash: "linear-gradient(160deg,#cfe3d8,#e3eedc)" },
  { solid: "#55864f", soft: "#dfeacb", text: "#f4f8f0", icon: "#dcebc4", wash: "linear-gradient(160deg,#d9e8c1,#ebf0d3)" },
  { solid: "#c8923a", soft: "#f6e2bb", text: "#12382b", icon: "#f3d9a0", wash: "linear-gradient(160deg,#f3dfb2,#f8e9cb)" },
  { solid: "#e8964f", soft: "#fbdcbd", text: "#12382b", icon: "#f6c9a0", wash: "linear-gradient(160deg,#f7cfa8,#fbe4cb)" },
]

const topics = ["Greetings", "Slang", "Mobile money", "Jokes", "Paying bills", "Asking for help", "Street talk"]

const questions = [
  { title: "Does the slang land?", body: "Words and jokes change fast.", bg: "#d3e6da", line: "#2f6b53" },
  { title: "Would someone from here say it?", body: "Not textbook. How people talk.", bg: "#e4ebcb", line: "#55864f" },
  { title: "Does it know how things work here?", body: "Bills, money, help, the local way.", bg: "#fbdcbd", line: "#e8964f" },
]

/* ───────── helpers ───────── */

function useInView<T extends Element>(threshold = 0.3, once = false) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          if (once) io.disconnect()
        } else if (!once) setSeen(false)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])
  return [ref, seen] as const
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.12, true)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-700 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${
        seen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  )
}

function ScrollBar() {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const h = document.documentElement
        const max = h.scrollHeight - h.clientHeight
        setP(max > 0 ? h.scrollTop / max : 0)
      })
    }
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => {
      window.removeEventListener("scroll", on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]">
      <div className="h-full origin-left bg-[linear-gradient(90deg,#2f6b53,#55864f,#c8923a,#e8964f)]" style={{ transform: `scaleX(${p})` }} />
    </div>
  )
}

/* ───────── buttons ───────── */

type Variant = "primary" | "secondary"

const btnBase =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full border px-7 py-3.5 text-[15px] font-semibold active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53]"

const btnVariants: Record<Variant, { surface: string; chip: string; glow: string }> = {
  // speakers: warm orange blend, dark green text, strong enough to read on any light or dark surface
  primary: {
    surface:
      "border-[#c8732a]/40 bg-[linear-gradient(135deg,#f6c9a0,#f0ac6e_45%,#e0883a)] text-[#12382b] shadow-[0_14px_30px_-14px_rgba(224,136,58,.95)] hover:shadow-[0_22px_40px_-14px_rgba(224,136,58,1)]",
    chip: "bg-[#12382b] text-[#f6c9a0]",
    glow: "rgba(255,238,214,.65)",
  },
  // companies: deep green blend, cream text
  secondary: {
    surface:
      "border-[#8fb8a3]/35 bg-[linear-gradient(135deg,#2f6b53,#12382b)] text-[#f7f3e8] shadow-[0_14px_30px_-14px_rgba(18,56,43,.95)] hover:shadow-[0_22px_40px_-14px_rgba(18,56,43,1)]",
    chip: "bg-[#f0ac6e] text-[#12382b]",
    glow: "rgba(143,184,163,.5)",
  },
}

function Btn({ href, variant, children }: { href: string; variant: Variant; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const v = btnVariants[variant]

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <Link
      ref={ref}
      href={href}
      className={`${btnBase} ${v.surface}`}
      style={{ transition: "transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .3s" }}
      onPointerMove={(e) => {
        const el = ref.current
        if (!el || e.pointerType !== "mouse" || reduced()) return
        const r = el.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        el.style.setProperty("--bx", `${x}px`)
        el.style.setProperty("--by", `${y}px`)
        // the button leans a little toward the cursor
        el.style.transform = `translate(${((x / r.width - 0.5) * 8).toFixed(1)}px, ${((y / r.height - 0.5) * 6 - 2).toFixed(1)}px)`
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = ""
      }}
      onPointerDown={(e) => {
        const el = ref.current
        if (!el || reduced()) return
        const r = el.getBoundingClientRect()
        const id = Date.now() + Math.random()
        setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }])
        setTimeout(() => setRipples((rs) => rs.filter((q) => q.id !== id)), 650)
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(110px circle at var(--bx, 50%) var(--by, 50%), ${v.glow}, transparent 70%)` }}
      />
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="landing-ripple pointer-events-none absolute size-16 rounded-full bg-[#fff1de]/60"
          style={{ left: r.x - 32, top: r.y - 32 }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center">
        {children}
        <span
          aria-hidden="true"
          className={`grid h-6 w-0 place-items-center overflow-hidden rounded-full opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:w-6 group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:w-6 group-focus-visible:opacity-100 ${v.chip}`}
        >
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </span>
    </Link>
  )
}

function StepIcon({ i, color, className = "" }: { i: number; color: string; className?: string }) {
  const p = {
    className,
    style: { color } as CSSProperties,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (i === 0)
    return (
      <svg {...p}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  if (i === 1)
    return (
      <svg {...p}>
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    )
  if (i === 2)
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  return (
    <svg {...p}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
    </svg>
  )
}

/* ───────── page ───────── */

export default function HomePage() {
  const [active, setActive] = useState(0)
  const [hold, setHold] = useState(false)
  const [picked, setPicked] = useState<string[]>(["Greetings", "Mobile money", "Paying bills"])
  const [flowRef, flowInView] = useInView<HTMLDivElement>(0.35)
  const [payRef, payInView] = useInView<HTMLDivElement>(0.3)
  const tiltRef = useRef<HTMLDivElement>(null)

  const toggleTopic = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  const paused = hold || !flowInView
  const tone = tones[active]
  const nextTone = tones[(active + 1) % tones.length]

  return (
    <div
      className={`landing-home ${display.variable} ${body.variable} bg-[linear-gradient(180deg,#e6f0e6_0%,#f1f0dc_45%,#f8e6cf_100%)] font-[family-name:var(--landing-body)] text-[#12382b] antialiased max-[899px]:pb-[92px]`}
    >
      <style>{`
        @keyframes landing-rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
        @keyframes landing-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes landing-orbit { to { transform: rotate(360deg) } }
        @keyframes landing-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes landing-ripple { from { transform: scale(0); opacity: .55 } to { transform: scale(6); opacity: 0 } }
        .landing-rise { opacity: 0; animation: landing-rise .9s cubic-bezier(.2,.7,.2,1) forwards }
        .landing-progress { transform-origin: left; animation: landing-fill 4.2s linear forwards }
        .landing-orbit { animation: landing-orbit 40s linear infinite }
        .landing-bob { animation: landing-bob 6s ease-in-out infinite }
        .landing-ripple { animation: landing-ripple .65s ease-out forwards }
        @media (prefers-reduced-motion: reduce) {
          .landing-rise { opacity: 1; animation: none }
          .landing-progress { animation: none; transform: scaleX(1) }
          .landing-orbit, .landing-bob { animation: none }
          .landing-ripple { display: none }
        }
      `}</style>

      <ScrollBar />

      {/* ───────── HERO: green melting into orange ───────── */}
      <section
        id="top"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
        }}
        style={{ ["--mx"]: "70%", ["--my"]: "30%" } as CSSProperties}
        className="relative isolate overflow-hidden rounded-b-[44px] bg-[linear-gradient(120deg,#d3e6da_0%,#e6ecd0_45%,#f8d5ad_100%)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(520px circle at var(--mx) var(--my), rgba(240,172,110,.32), transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(232,150,79,.35),transparent_68%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-52 bottom-[-220px] -z-10 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(47,107,83,.28),transparent_68%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(180deg,#000,transparent_85%)]"
          style={{ backgroundImage: "radial-gradient(rgba(18,56,43,.16) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="mx-auto grid w-full max-w-[1120px] items-center gap-16 px-5 pb-24 pt-28 min-[900px]:grid-cols-[1.1fr_0.9fr] min-[900px]:gap-14 min-[900px]:pb-32 min-[900px]:pt-40">
          <div>
            <h1 className={`${D} max-w-2xl text-[clamp(42px,6.4vw,82px)] font-bold leading-[0.98] tracking-[-0.045em] text-[#12382b]`}>
              <span className="landing-rise block" style={{ animationDelay: "80ms" }}>
                Make AI sound
              </span>
              <span
                className="landing-rise block bg-[linear-gradient(90deg,#2f6b53,#55864f_40%,#c8732a)] bg-clip-text pb-[0.1em] text-transparent"
                style={{ animationDelay: "220ms" }}
              >
                like it belongs.
              </span>
            </h1>
            <p className="landing-rise mt-7 max-w-[30rem] text-[18px] leading-[1.6] text-[#2f4d3d]" style={{ animationDelay: "380ms" }}>
              Native speakers fix what AI gets wrong, in everyday language. You get paid in Bitcoin the moment it&apos;s approved.
            </p>
            <div className="landing-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "520ms" }}>
              <Btn href="/signup" variant="primary">
                Sign me up
              </Btn>
              <Btn href="/signup?as=company" variant="secondary">
                For companies
              </Btn>
            </div>
          </div>

          <div className="landing-rise relative w-full min-[900px]:justify-self-end" style={{ animationDelay: "640ms" }}>
            <div aria-hidden="true" className="absolute inset-0 -z-10 translate-x-4 translate-y-5 rotate-[3deg] rounded-[32px] border border-[#e8964f]/40 bg-[#f6c9a0]" />
            <div
              ref={tiltRef}
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || !tiltRef.current) return
                const r = tiltRef.current.getBoundingClientRect()
                const x = (e.clientX - r.left) / r.width - 0.5
                const y = (e.clientY - r.top) / r.height - 0.5
                tiltRef.current.style.transform = `perspective(1000px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`
              }}
              onPointerLeave={() => {
                if (tiltRef.current) tiltRef.current.style.transform = ""
              }}
              className="rounded-[28px] bg-[linear-gradient(160deg,#1c4a3a,#12382b)] p-3 shadow-[0_44px_80px_-36px_rgba(18,56,43,.7)] transition-transform duration-200 ease-out will-change-transform"
            >
              <LandingDemoCard />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── HOW ───────── */}
      <section id="how" className="py-24 min-[900px]:py-32">
        <div className="mx-auto w-full max-w-[1120px] px-5">
          <Reveal>
            <h2 className={`${H2} max-w-xl`}>From AI answer to paid review.</h2>
          </Reveal>

          <div
            ref={flowRef}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
            className="mt-14 grid items-stretch gap-8 min-[900px]:grid-cols-[0.9fr_1.1fr] min-[900px]:gap-14"
          >
            {/* visual that follows the active step and shifts colour with it */}
            <Reveal className="min-[900px]:h-full">
              <div className="relative grid min-h-[300px] place-items-center overflow-hidden rounded-[32px] border border-[#12382b]/10 min-[900px]:h-full min-[900px]:min-h-[460px]">
                {tones.map((t, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ background: t.wash, opacity: i === active ? 1 : 0 }}
                  />
                ))}
                <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 size-full">
                  <g fill="none" stroke="#12382b" strokeOpacity=".16">
                    <circle cx="200" cy="200" r="190" strokeDasharray="2 9" />
                    <circle cx="200" cy="200" r="140" />
                    <circle cx="200" cy="200" r="92" strokeDasharray="30 12" />
                  </g>
                </svg>
                <div aria-hidden="true" className="landing-orbit absolute inset-0">
                  <span
                    className="absolute left-1/2 top-[5%] size-3.5 -translate-x-1/2 rounded-full transition-colors duration-700"
                    style={{ background: tone.solid, boxShadow: `0 0 0 6px ${tone.solid}33` }}
                  />
                </div>

                <div className="landing-bob relative grid size-40 place-items-center rounded-full bg-[linear-gradient(160deg,#1c4a3a,#12382b)] shadow-[0_34px_60px_-26px_rgba(18,56,43,.7)] min-[900px]:size-48">
                  {steps.map((_, i) => (
                    <StepIcon
                      key={i}
                      i={i}
                      color={tones[i].icon}
                      className={`absolute size-16 transition-all duration-500 ease-out min-[900px]:size-[72px] ${
                        i === active ? "scale-100 opacity-100" : "scale-75 opacity-0"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* the steps */}
            <ol className="flex flex-col gap-2.5">
              {steps.map((s, i) => {
                const on = i === active
                const done = i < active
                const t = tones[i]
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={on ? "step" : undefined}
                      style={on ? { background: t.soft, borderColor: `${t.solid}66`, boxShadow: `0 24px 46px -28px ${t.solid}` } : undefined}
                      className={`relative flex w-full items-start gap-5 overflow-hidden rounded-2xl border p-5 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b53] min-[900px]:p-6 ${
                        on ? "" : "border-[#12382b]/10 bg-[#12382b]/[0.04] hover:bg-[#12382b]/[0.09]"
                      }`}
                    >
                      <span
                        style={on ? { background: t.solid, color: t.text } : done ? { background: t.soft, color: "#12382b" } : undefined}
                        className={`${D} grid size-10 shrink-0 place-items-center rounded-full text-base font-bold transition duration-300 ${
                          on || done ? "" : "bg-[#12382b]/10 text-[#2f6b53]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="block">
                        <h3 className={`${D} text-[20px] font-bold leading-[1.15] tracking-[-0.02em] transition-colors ${on ? "text-[#12382b]" : "text-[#2f6b53]"}`}>
                          {s.title}
                        </h3>
                        <p className="mt-1.5 text-[15px] leading-[1.5] text-[#3d5a49]">{s.body}</p>
                      </span>

                      {on && (
                        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[4px] bg-[#12382b]/10">
                          <span
                            key={active}
                            onAnimationEnd={() => setActive((a) => (a + 1) % steps.length)}
                            style={{ animationPlayState: paused ? "paused" : "running", background: `linear-gradient(90deg,${tone.solid},${nextTone.solid})` }}
                            className="landing-progress block h-full"
                          />
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── TRUE HERE ───────── */}
      <section className="px-5 pb-24 min-[900px]:pb-32">
        <div className="mx-auto w-full max-w-[1120px] rounded-[36px] border border-[#12382b]/10 bg-[linear-gradient(135deg,#d3e6da,#e6ecd0_50%,#f8d5ad)] px-6 py-16 min-[900px]:px-14 min-[900px]:py-24">
          <Reveal>
            <h2 className={`${H2} mx-auto max-w-lg text-center`}>Not just correct. True here.</h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {topics.map((t, i) => {
                const on = picked.includes(t)
                const warm = i % 2 === 1
                const look = warm
                  ? on
                    ? "border-[#c8732a]/50 bg-[#e8964f] text-[#12382b] shadow-[0_12px_24px_-12px_rgba(200,115,42,.8)]"
                    : "border-[#c8732a]/30 bg-[#fbdcbd] text-[#12382b] hover:bg-[#f8cfa5]"
                  : on
                    ? "border-[#12382b] bg-[#12382b] text-[#f7f3e8] shadow-[0_12px_24px_-12px_rgba(18,56,43,.8)]"
                    : "border-[#2f6b53]/30 bg-[#bcd8c8] text-[#12382b] hover:bg-[#a9cdb9]"
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    aria-pressed={on}
                    className={`${D} inline-flex items-center rounded-full border px-5 py-2.5 text-[15px] font-semibold transition duration-300 hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53] ${look}`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className={`shrink-0 overflow-hidden transition-all duration-300 ${on ? "mr-2 w-3.5 opacity-100" : "mr-0 w-0 opacity-0"}`}
                      height="14"
                      fill="none"
                      stroke={warm ? "#12382b" : "#f0ac6e"}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8.5l3.2 3L13 4.5" />
                    </svg>
                    {t}
                  </button>
                )
              })}
            </div>
          </Reveal>

          <div className="mt-14 grid gap-4 min-[900px]:mt-20 min-[900px]:grid-cols-3">
            {questions.map((q, i) => (
              <Reveal key={q.title} delay={i * 100}>
                <article
                  style={{ background: q.bg }}
                  className="group h-full rounded-3xl border border-[#12382b]/10 p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-28px_rgba(18,56,43,.55)]"
                >
                  <span aria-hidden="true" className="block h-1 w-8 rounded-full transition-all duration-500 group-hover:w-14" style={{ background: q.line }} />
                  <h3 className={`${D} mt-6 text-[22px] font-bold leading-[1.12] tracking-[-0.02em] text-[#12382b]`}>{q.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.5] text-[#2f4d3d]">{q.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PAY ───────── */}
      <section id="pay" className="px-5 pb-24 min-[900px]:pb-32">
        <div className="relative isolate mx-auto w-full max-w-[1120px] overflow-hidden rounded-[36px] bg-[linear-gradient(150deg,#1c4a3a,#12382b_60%,#2b3c1f)] px-6 py-16 text-[#f7f3e8] min-[900px]:px-14 min-[900px]:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(143,184,163,.32),transparent_68%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 -right-20 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(232,150,79,.34),transparent_68%)]" />

          <Reveal>
            <h2 className={`${H2} max-w-md !text-[#f7f3e8]`}>Good work pays promptly.</h2>
          </Reveal>

          <div ref={payRef} className="mt-14 grid gap-4 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:grid-rows-2">
            <article className="group relative flex flex-col justify-between gap-14 overflow-hidden rounded-3xl border border-[#f0ac6e]/30 bg-[linear-gradient(155deg,rgba(240,172,110,.18),rgba(143,184,163,.08))] p-7 transition duration-500 hover:border-[#f0ac6e]/70 min-[900px]:row-span-2 min-[900px]:p-10">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute -right-8 -top-8 size-52 rotate-12 fill-[#f0ac6e] opacity-[0.08] transition duration-700 group-hover:opacity-[0.16]">
                <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
              </svg>
              <svg className="h-24 w-full" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="landing-payment-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#8fb8a3" />
                    <stop offset="1" stopColor="#f0ac6e" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 58 C30 50 40 60 70 44 S120 48 150 30 S210 36 240 16 S280 14 300 6"
                  fill="none"
                  stroke="url(#landing-payment-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={payInView ? 0 : 1}
                  style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1)" }}
                />
              </svg>
              <div>
                <h3 className={`${D} text-[clamp(36px,5vw,60px)] font-bold leading-none tracking-[-0.04em]`}>
                  Bitcoin{" "}
                  <span className="ml-1.5 inline-block -translate-y-[0.4em] rounded-full border border-[#f0ac6e]/60 bg-[#f0ac6e]/20 px-3 py-1 font-[family-name:var(--landing-body)] text-xs font-semibold tracking-normal text-[#f6c9a0]">
                    Lightning
                  </span>
                </h3>
                <p className="mt-3 text-[16px] leading-[1.5] text-[#f7f3e8]/80">Paid in seconds, no bank.</p>
              </div>
            </article>

            {[
              ["Like mobile money", "Phone to phone, nothing to clear.", "border-[#8fb8a3]/30 bg-[#8fb8a3]/10 hover:border-[#8fb8a3]/70", "#8fb8a3"],
              ["No balance to hold", "No minimum, no frozen funds.", "border-[#c8923a]/35 bg-[#c8923a]/10 hover:border-[#c8923a]/75", "#c8923a"],
            ].map(([t, b, look, line]) => (
              <article key={t} className={`group flex flex-col justify-between gap-8 rounded-3xl border p-7 transition duration-500 hover:-translate-y-1 ${look}`}>
                <span aria-hidden="true" className="h-1 w-8 rounded-full transition-all duration-500 group-hover:w-16" style={{ background: line }} />
                <div>
                  <h3 className={`${D} text-[24px] font-bold leading-[1.1] tracking-[-0.02em]`}>{t}</h3>
                  <p className="mt-2 text-[15px] leading-[1.5] text-[#f7f3e8]/80">{b}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── JOIN ───────── */}
      <section id="join" className="px-5 pb-16 min-[900px]:pb-24">
        <Reveal>
          <div className="relative isolate mx-auto w-full max-w-[1120px] overflow-hidden rounded-[36px] border border-[#12382b]/10 bg-[linear-gradient(135deg,#bcd8c8,#e6ecd0_45%,#f6c9a0)] px-6 py-20 text-center min-[900px]:py-28">
            <svg aria-hidden="true" viewBox="0 0 600 600" className="landing-orbit pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.2]">
              <g fill="none" stroke="#12382b">
                <circle cx="300" cy="300" r="290" strokeDasharray="2 10" />
                <circle cx="300" cy="300" r="230" />
                <circle cx="300" cy="300" r="170" strokeDasharray="40 14" />
              </g>
            </svg>
            <h2 className={`${D} mx-auto max-w-[14em] text-[clamp(32px,5vw,58px)] font-bold leading-[1.02] tracking-[-0.04em] text-[#12382b]`}>
              Bring local knowledge into the conversation.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Btn href="/signup" variant="primary">
                Join as a speaker
              </Btn>
              <Btn href="/signup?as=company" variant="secondary">
                For companies
              </Btn>
            </div>
          </div>
        </Reveal>

        <footer className="mx-auto mt-14 w-full max-w-[1120px] border-t border-[#12382b]/15 pt-6 text-[13px] text-[#3d5a49]">
          <div className="flex flex-wrap justify-between gap-2">
            <p>Taska · Hack4Freedom 2026</p>
            <p>Get paid in Bitcoin, instantly over Lightning.</p>
          </div>
        </footer>
      </section>

      {/* backing for the dock on small screens, so its light text always has a dark surface behind it */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-[linear-gradient(0deg,rgba(18,56,43,.94),rgba(18,56,43,.65)_55%,transparent)] min-[900px]:hidden" />
      <LandingDock />
    </div>
  )
}
