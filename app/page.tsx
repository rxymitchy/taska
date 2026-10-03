"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Bricolage_Grotesque, Figtree } from "next/font/google"
import { LandingDemoCard } from "@/components/landing-demo-card"
import { LandingDock } from "@/components/landing-dock"

/*
  Palette: calm greens, one soft orange accent, lots of white
  paper     #fdfcf9   page background
  mist      #eaf2ed   #f4f8f5   pale green surfaces
  sage      #8fb8a3   #cfe3d8   soft green details
  green     #2f6b53   #1c4a3a   #12382b   mid to deep forest
  peach     #fdf0e3   #f6c9a0   pale orange surfaces
  orange    #f0ac6e   #e8964f   the single warm accent
  amber     #c9732a             orange used for text and icons on white
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

const topics = ["Greetings", "Slang", "Mobile money", "Jokes", "Paying bills", "Asking for help", "Street talk"]

const questions = [
  { title: "Does the slang land?", body: "Words and jokes change fast." },
  { title: "Would someone from here say it?", body: "Not textbook. How people talk." },
  { title: "Does it know how things work here?", body: "Bills, money, help, the local way." },
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
      <div className="h-full origin-left bg-[linear-gradient(90deg,#2f6b53,#8fb8a3,#e8964f)]" style={{ transform: `scaleX(${p})` }} />
    </div>
  )
}

type Variant = "primary" | "outline"

const btnBase =
  "landing-btn relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-semibold transition duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53]"

const btnVariants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#f0ac6e,#e8964f)] text-[#12382b] shadow-[0_12px_28px_-14px_rgba(232,150,79,.9)] hover:shadow-[0_18px_34px_-14px_rgba(232,150,79,1)]",
  outline: "border border-[#12382b]/25 bg-white/60 text-[#12382b] hover:border-[#12382b] hover:bg-white",
}

function Btn({ href, variant, children }: { href: string; variant: Variant; children: ReactNode }) {
  return (
    <Link href={href} className={`${btnBase} ${btnVariants[variant]}`}>
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

function StepIcon({ i, className = "" }: { i: number; className?: string }) {
  const p = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (i === 0)
    return (
      <svg {...p} stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  if (i === 1)
    return (
      <svg {...p} stroke="currentColor">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    )
  if (i === 2)
    return (
      <svg {...p} stroke="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  return (
    <svg {...p} stroke="currentColor">
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

  return (
    <div
      className={`landing-home ${display.variable} ${body.variable} bg-[#fdfcf9] font-[family-name:var(--landing-body)] text-[#12382b] antialiased max-[899px]:pb-[92px]`}
    >
      <style>{`
        @keyframes landing-rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
        @keyframes landing-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes landing-orbit { to { transform: rotate(360deg) } }
        @keyframes landing-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .landing-rise { opacity: 0; animation: landing-rise .9s cubic-bezier(.2,.7,.2,1) forwards }
        .landing-progress { transform-origin: left; animation: landing-fill 4.2s linear forwards }
        .landing-orbit { animation: landing-orbit 40s linear infinite }
        .landing-bob { animation: landing-bob 6s ease-in-out infinite }
        .landing-btn::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.45) 50%, transparent 62%); transform: translateX(-120%); transition: transform .7s ease }
        .landing-btn:hover::after { transform: translateX(120%) }
        @media (prefers-reduced-motion: reduce) {
          .landing-rise { opacity: 1; animation: none }
          .landing-progress { animation: none; transform: scaleX(1) }
          .landing-orbit, .landing-bob { animation: none }
          .landing-btn::after { display: none }
        }
      `}</style>

      <ScrollBar />

      {/* ───────── HERO ───────── */}
      <section
        id="top"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
        }}
        style={{ ["--mx"]: "70%", ["--my"]: "30%" } as CSSProperties}
        className="relative isolate overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(520px circle at var(--mx) var(--my), rgba(246,201,160,.28), transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,#eaf2ed,transparent_68%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-52 bottom-[-220px] -z-10 size-[560px] rounded-full bg-[radial-gradient(circle,#fdf0e3,transparent_68%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(180deg,#000,transparent_85%)]"
          style={{ backgroundImage: "radial-gradient(rgba(18,56,43,.12) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />

        <div className="mx-auto grid w-full max-w-[1120px] items-center gap-16 px-5 pb-24 pt-28 min-[900px]:grid-cols-[1.1fr_0.9fr] min-[900px]:gap-14 min-[900px]:pb-36 min-[900px]:pt-40">
          <div>
            <h1 className={`${D} max-w-2xl text-[clamp(42px,6.4vw,82px)] font-bold leading-[0.98] tracking-[-0.045em] text-[#12382b]`}>
              <span className="landing-rise block" style={{ animationDelay: "80ms" }}>
                Make AI sound
              </span>
              <span
                className="landing-rise block bg-[linear-gradient(90deg,#2f6b53,#5f9a80_45%,#e8964f)] bg-clip-text pb-[0.1em] text-transparent"
                style={{ animationDelay: "220ms" }}
              >
                like it belongs.
              </span>
            </h1>
            <p className="landing-rise mt-7 max-w-[30rem] text-[18px] leading-[1.6] text-[#3d5a49]" style={{ animationDelay: "380ms" }}>
              Native speakers fix what AI gets wrong, in everyday language. You get paid in Bitcoin the moment it&apos;s approved.
            </p>
            <div className="landing-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "520ms" }}>
              <Btn href="/signup" variant="primary">
                Sign me up
              </Btn>
              <Btn href="/signup?as=company" variant="outline">
                For companies
              </Btn>
            </div>
          </div>

          <div className="landing-rise relative w-full min-[900px]:justify-self-end" style={{ animationDelay: "640ms" }}>
            <div aria-hidden="true" className="absolute inset-0 -z-10 translate-x-4 translate-y-5 rotate-[3deg] rounded-[32px] border border-[#f6c9a0]/60 bg-[#fdf0e3]" />
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
              className="rounded-[28px] bg-[linear-gradient(160deg,#1c4a3a,#12382b)] p-3 shadow-[0_44px_80px_-36px_rgba(18,56,43,.6)] transition-transform duration-200 ease-out will-change-transform"
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
            {/* visual that follows the active step */}
            <Reveal className="min-[900px]:h-full">
              <div className="relative grid min-h-[300px] place-items-center overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,#f4f8f5,#eaf2ed)] min-[900px]:h-full min-[900px]:min-h-[460px]">
                <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute inset-0 size-full">
                  <g fill="none" stroke="#2f6b53" strokeOpacity=".18">
                    <circle cx="200" cy="200" r="190" strokeDasharray="2 9" />
                    <circle cx="200" cy="200" r="140" />
                    <circle cx="200" cy="200" r="92" strokeDasharray="30 12" />
                  </g>
                </svg>
                <div aria-hidden="true" className="landing-orbit absolute inset-0">
                  <span className="absolute left-1/2 top-[5%] size-3 -translate-x-1/2 rounded-full bg-[#e8964f] shadow-[0_0_0_6px_rgba(232,150,79,.2)]" />
                </div>
                <div aria-hidden="true" className="absolute left-[12%] top-[14%] size-24 rounded-full bg-[radial-gradient(circle,#fdf0e3,transparent_70%)]" />

                <div className="landing-bob relative grid size-40 place-items-center rounded-full bg-white shadow-[0_34px_60px_-30px_rgba(18,56,43,.4)] min-[900px]:size-48">
                  {steps.map((_, i) => (
                    <StepIcon
                      key={i}
                      i={i}
                      className={`absolute size-16 transition-all duration-500 ease-out min-[900px]:size-[72px] ${
                        i === 3 ? "text-[#c9732a]" : "text-[#12382b]"
                      } ${i === active ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* the steps */}
            <ol className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const on = i === active
                const done = i < active
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={on ? "step" : undefined}
                      className={`relative flex w-full items-start gap-5 overflow-hidden rounded-2xl border p-5 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b53] min-[900px]:p-6 ${
                        on
                          ? "border-[#e8964f]/35 bg-white shadow-[0_24px_50px_-26px_rgba(18,56,43,.4)]"
                          : "border-transparent hover:bg-[#f4f8f5]"
                      }`}
                    >
                      <span
                        className={`${D} grid size-10 shrink-0 place-items-center rounded-full text-base font-bold transition duration-300 ${
                          on ? "bg-[#12382b] text-white" : done ? "bg-[#cfe3d8] text-[#12382b]" : "bg-[#eaf2ed] text-[#2f6b53]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="block">
                        <h3 className={`${D} text-[20px] font-bold leading-[1.15] tracking-[-0.02em] transition-colors ${on ? "text-[#12382b]" : "text-[#2f6b53]"}`}>
                          {s.title}
                        </h3>
                        <p className="mt-1.5 text-[15px] leading-[1.5] text-[#4a6556]">{s.body}</p>
                      </span>

                      {on && (
                        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-[#12382b]/5">
                          <span
                            key={active}
                            onAnimationEnd={() => setActive((a) => (a + 1) % steps.length)}
                            style={{ animationPlayState: paused ? "paused" : "running" }}
                            className="landing-progress block h-full bg-[linear-gradient(90deg,#2f6b53,#e8964f)]"
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
        <div className="mx-auto w-full max-w-[1120px] rounded-[36px] bg-[linear-gradient(170deg,#f4f8f5,#eaf2ed)] px-6 py-16 min-[900px]:px-14 min-[900px]:py-24">
          <Reveal>
            <h2 className={`${H2} mx-auto max-w-lg text-center`}>Not just correct. True here.</h2>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {topics.map((t) => {
                const on = picked.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    aria-pressed={on}
                    className={`${D} inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[15px] font-semibold transition duration-300 hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53] ${
                      on
                        ? "border-[#12382b] bg-[#12382b] text-white shadow-[0_12px_24px_-12px_rgba(18,56,43,.7)]"
                        : "border-[#12382b]/15 bg-white text-[#12382b] hover:border-[#e8964f] hover:bg-[#fdf0e3]"
                    }`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className={`overflow-hidden transition-all duration-300 ${on ? "w-3.5 opacity-100" : "w-0 opacity-0"}`}
                      height="14"
                      fill="none"
                      stroke="#f0ac6e"
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
                <article className="group h-full rounded-3xl border border-white bg-white p-7 transition duration-300 hover:-translate-y-1.5 hover:border-[#f6c9a0] hover:shadow-[0_28px_50px_-28px_rgba(18,56,43,.35)]">
                  <span aria-hidden="true" className="block h-1 w-8 rounded-full bg-[linear-gradient(90deg,#2f6b53,#e8964f)] transition-all duration-500 group-hover:w-14" />
                  <h3 className={`${D} mt-6 text-[22px] font-bold leading-[1.12] tracking-[-0.02em] text-[#12382b]`}>{q.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.5] text-[#4a6556]">{q.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PAY ───────── */}
      <section id="pay" className="px-5 pb-24 min-[900px]:pb-32">
        <div className="relative isolate mx-auto w-full max-w-[1120px] overflow-hidden rounded-[36px] bg-[linear-gradient(160deg,#1c4a3a,#12382b)] px-6 py-16 text-white min-[900px]:px-14 min-[900px]:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(143,184,163,.28),transparent_68%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(240,172,110,.18),transparent_68%)]" />

          <Reveal>
            <h2 className={`${H2} max-w-md !text-white`}>Good work pays promptly.</h2>
          </Reveal>

          <div ref={payRef} className="mt-14 grid gap-4 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:grid-rows-2">
            <article className="group relative flex flex-col justify-between gap-14 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-7 transition duration-500 hover:border-[#f0ac6e]/50 hover:bg-white/[0.09] min-[900px]:row-span-2 min-[900px]:p-10">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute -right-8 -top-8 size-52 rotate-12 fill-white opacity-[0.05] transition duration-700 group-hover:opacity-[0.1]">
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
                  <span className="ml-1.5 inline-block -translate-y-[0.4em] rounded-full border border-[#f0ac6e]/40 bg-[#f0ac6e]/10 px-3 py-1 font-[family-name:var(--landing-body)] text-xs font-semibold tracking-normal text-[#f6c9a0]">
                    Lightning
                  </span>
                </h3>
                <p className="mt-3 text-[16px] leading-[1.5] text-white/75">Paid in seconds, no bank.</p>
              </div>
            </article>

            {[
              ["Like mobile money", "Phone to phone, nothing to clear."],
              ["No balance to hold", "No minimum, no frozen funds."],
            ].map(([t, b]) => (
              <article
                key={t}
                className="group flex flex-col justify-between gap-8 rounded-3xl border border-white/10 bg-white/[0.06] p-7 transition duration-500 hover:-translate-y-1 hover:border-[#f0ac6e]/50 hover:bg-white/[0.09]"
              >
                <span aria-hidden="true" className="h-1 w-8 rounded-full bg-[linear-gradient(90deg,#8fb8a3,#f0ac6e)] transition-all duration-500 group-hover:w-16" />
                <div>
                  <h3 className={`${D} text-[24px] font-bold leading-[1.1] tracking-[-0.02em]`}>{t}</h3>
                  <p className="mt-2 text-[15px] leading-[1.5] text-white/75">{b}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── JOIN ───────── */}
      <section id="join" className="px-5 pb-16 min-[900px]:pb-24">
        <Reveal>
          <div className="relative isolate mx-auto w-full max-w-[1120px] overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#fdf0e3,#f4f8f5_55%,#eaf2ed)] px-6 py-20 text-center min-[900px]:py-28">
            <svg aria-hidden="true" viewBox="0 0 600 600" className="landing-orbit pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]">
              <g fill="none" stroke="#2f6b53">
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
                Join as an evaluator
              </Btn>
              <Btn href="/signup?as=company" variant="outline">
                For companies
              </Btn>
            </div>
          </div>
        </Reveal>

        <footer className="mx-auto mt-14 w-full max-w-[1120px] border-t border-[#12382b]/10 pt-6 text-[13px] text-[#4a6556]">
          <div className="flex flex-wrap justify-between gap-2">
            <p>Taska · Hack4Freedom 2026</p>
            <p>Get paid in Bitcoin, instantly over Lightning.</p>
          </div>
        </footer>
      </section>
      <LandingDock />
    </div>
  )
}
