"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Bricolage_Grotesque, Figtree } from "next/font/google"
import { LandingDemoCard } from "@/components/landing-demo-card"
import { LandingDock } from "@/components/landing-dock"

/*
  Palette (literal hex values, so no Tailwind config changes are needed)
  forest    #031c12  #052e1d  #08432b  #0c5a3a
  emerald   #12a366  #19c37d
  sage      #e6f0df  #f2f6ea
  cream     #faf5e4
  gold      #f4d98a  #ecc050
  mustard   #d9a521  #c89516  #8a6410
*/

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--landing-display", display: "swap" })
const body = Figtree({ subsets: ["latin"], variable: "--landing-body", display: "swap" })

const D = "font-[family-name:var(--landing-display)]"

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

/* ---------- helpers ---------- */

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setSeen(e.isIntersecting)
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

type Variant = "gold" | "outline" | "forest" | "outlineDark"

const btnBase =
  "relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] transition duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ecc050]"

const btnVariants: Record<Variant, string> = {
  gold: "bg-[linear-gradient(135deg,#f4d98a,#ecc050_45%,#d9a521)] text-[#052e1d] shadow-[0_12px_32px_-12px_rgba(236,192,80,.75)] hover:shadow-[0_18px_38px_-12px_rgba(236,192,80,.95)]",
  outline: "border border-[#ecc050]/50 text-[#f4d98a] hover:border-[#ecc050] hover:bg-[#ecc050]/10",
  forest: "bg-[#052e1d] text-[#f4d98a] shadow-[0_12px_30px_-12px_rgba(3,28,18,.8)] hover:bg-[#08432b]",
  outlineDark: "border border-[#052e1d]/55 text-[#052e1d] hover:border-[#052e1d] hover:bg-[#052e1d]/10",
}

function Btn({ href, variant, children }: { href: string; variant: Variant; children: React.ReactNode }) {
  return (
    <Link href={href} className={`landing-btn ${btnBase} ${btnVariants[variant]}`}>
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

/* ---------- page ---------- */

export default function HomePage() {
  const [active, setActive] = useState(1)
  const [hold, setHold] = useState(false)
  const [picked, setPicked] = useState<string[]>(["Greetings", "Mobile money", "Paying bills"])
  const [flowRef, flowInView] = useInView<HTMLDivElement>(0.4)
  const [payRef, payInView] = useInView<HTMLDivElement>(0.3)

  // the payment flow replays on its own while visible, and pauses the moment someone touches it
  useEffect(() => {
    if (hold || !flowInView) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 3000)
    return () => clearInterval(t)
  }, [hold, flowInView])

  const toggleTopic = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  return (
    <div
      className={`landing-home ${display.variable} ${body.variable} bg-[#faf5e4] font-[family-name:var(--landing-body)] text-[#052e1d] antialiased max-[899px]:pb-[92px]`}
    >
      <style>{`
        @keyframes landing-rise { from { opacity: 0; transform: translateY(26px) } to { opacity: 1; transform: none } }
        @keyframes landing-spin { to { transform: rotate(360deg) } }
        @keyframes landing-pulse { 0%,100% { box-shadow: 0 0 0 5px rgba(236,192,80,.28) } 50% { box-shadow: 0 0 0 11px rgba(236,192,80,.1) } }
        .landing-rise { opacity: 0; animation: landing-rise .9s cubic-bezier(.2,.7,.2,1) forwards }
        .landing-spin { animation: landing-spin 90s linear infinite }
        .landing-pulse { animation: landing-pulse 2.4s ease-in-out infinite }
        .landing-btn::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%); transform: translateX(-120%); transition: transform .7s ease }
        .landing-btn:hover::after { transform: translateX(120%) }
        @media (prefers-reduced-motion: reduce) {
          .landing-rise { opacity: 1; animation: none }
          .landing-spin, .landing-pulse { animation: none }
          .landing-btn::after { display: none }
        }
      `}</style>

      {/* ───────── HERO ───────── */}
      <section
        id="top"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
        }}
        style={{ ["--mx" as string]: "72%", ["--my" as string]: "30%" }}
        className="relative isolate overflow-hidden bg-[linear-gradient(155deg,#031c12,#052e1d_55%,#08432b)] text-white"
      >
        {/* light that follows the cursor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: "radial-gradient(460px circle at var(--mx) var(--my), rgba(236,192,80,.16), transparent 70%)" }}
        />
        {/* soft color fields */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-32 z-0 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(25,195,125,.45),rgba(12,90,58,.2)_55%,transparent_72%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-[-120px] z-0 size-[460px] rounded-full bg-[radial-gradient(circle,rgba(217,165,33,.28),transparent_68%)]" />
        {/* slow coin rings */}
        <svg aria-hidden="true" viewBox="0 0 600 600" className="landing-spin pointer-events-none absolute -right-48 top-1/2 z-0 hidden size-[760px] -translate-y-1/2 opacity-[0.22] min-[900px]:block">
          <g fill="none" stroke="#ecc050">
            <circle cx="300" cy="300" r="290" strokeWidth="1" strokeDasharray="2 10" />
            <circle cx="300" cy="300" r="230" strokeWidth="1" />
            <circle cx="300" cy="300" r="170" strokeWidth="1" strokeDasharray="40 14" />
          </g>
        </svg>
        {/* grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1120px] items-center gap-10 px-5 pb-16 pt-[96px] min-[900px]:grid-cols-[1.15fr_0.85fr] min-[900px]:gap-12 min-[900px]:pb-24 min-[900px]:pt-[128px]">
          <div>
            <h1 className={`${D} max-w-2xl text-[clamp(42px,7.2vw,88px)] font-extrabold leading-[0.95] tracking-[-0.045em]`}>
              <span className="landing-rise block" style={{ animationDelay: "80ms" }}>
                Make AI sound
              </span>
              <span
                className="landing-rise block bg-[linear-gradient(90deg,#f4d98a,#ecc050_40%,#d9a521_62%,#19c37d)] bg-clip-text pb-[0.08em] text-transparent"
                style={{ animationDelay: "220ms" }}
              >
                like it belongs.
              </span>
            </h1>
            <p className="landing-rise mt-6 max-w-[34rem] text-[17px] leading-relaxed text-white/75" style={{ animationDelay: "380ms" }}>
              Native speakers fix what AI gets wrong, in everyday language. You get paid in Bitcoin the moment it&apos;s approved.
            </p>
            <div className="landing-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "520ms" }}>
              <Btn href="/signup" variant="gold">
                Sign me up
              </Btn>
              <Btn href="/signup?as=company" variant="outline">
                For companies
              </Btn>
            </div>
          </div>
          <div className="landing-rise w-full min-[900px]:justify-self-end" style={{ animationDelay: "640ms" }}>
            <LandingDemoCard />
          </div>
        </div>
      </section>

      {/* ───────── HOW: a payment travelling down a line ───────── */}
      <section id="how" className="relative py-16 min-[900px]:py-24">
        <div className="mx-auto w-full max-w-[1120px] px-5">
          <h2 className={`${D} max-w-xl text-[clamp(30px,4.4vw,52px)] font-extrabold leading-[1] tracking-[-0.04em] text-[#052e1d]`}>
            From AI answer to paid review.
          </h2>

          <div
            ref={flowRef}
            onMouseEnter={() => setHold(true)}
            onMouseLeave={() => setHold(false)}
            onFocus={() => setHold(true)}
            onBlur={() => setHold(false)}
            className="mt-12 grid gap-6 min-[900px]:grid-cols-4 min-[900px]:gap-3"
          >
            {steps.map((s, i) => {
              const isActive = i === active
              const isDone = i < active
              const last = i === steps.length - 1
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "step" : undefined}
                  className={`group relative flex items-start gap-4 rounded-2xl text-left transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#c89516] min-[900px]:flex-col min-[900px]:gap-5 ${
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`${D} relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 text-lg font-extrabold transition-all duration-500 ${
                      isActive
                        ? `landing-pulse scale-110 border-[#d9a521] bg-[linear-gradient(135deg,#f4d98a,#d9a521)] text-[#052e1d]`
                        : isDone
                          ? "border-[#12a366] bg-[#12a366] text-white"
                          : "border-[#052e1d]/25 bg-[#faf5e4] text-[#0c5a3a]"
                    }`}
                  >
                    {i + 1}
                  </span>

                  {!last && (
                    <span className="pointer-events-none absolute left-[44px] top-[21px] hidden h-[3px] w-[calc(100%-32px)] overflow-hidden rounded-full bg-[#052e1d]/12 min-[900px]:block">
                      <span
                        className="block h-full bg-[linear-gradient(90deg,#12a366,#ecc050)] transition-[width] duration-700 ease-out"
                        style={{ width: isDone ? "100%" : "0%" }}
                      />
                    </span>
                  )}

                  <span className="block pr-2">
                    <h3 className={`${D} text-[21px] font-bold leading-[1.1] tracking-[-0.02em] text-[#052e1d]`}>{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-[1.45] text-[#3d5a49]">{s.body}</p>
                    <span
                      aria-hidden="true"
                      className={`mt-4 block h-[3px] rounded-full bg-[linear-gradient(90deg,#ecc050,#d9a521)] transition-all duration-500 ${
                        isActive ? "w-12 opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────── TRUE HERE ───────── */}
      <section className="relative bg-[#e6f0df] py-16 min-[900px]:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#d9a521,transparent)]" aria-hidden="true" />
        <div className="mx-auto w-full max-w-[1120px] px-5">
          <div className="grid items-start gap-8 min-[900px]:grid-cols-[0.9fr_1.1fr] min-[900px]:gap-16">
            <h2 className={`${D} text-[clamp(30px,4.4vw,52px)] font-extrabold leading-[1] tracking-[-0.04em] text-[#052e1d]`}>
              Not just correct. True here.
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {topics.map((t) => {
                const on = picked.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    aria-pressed={on}
                    className={`${D} rounded-full border-2 px-5 py-2.5 text-[15px] font-bold transition duration-300 hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c89516] ${
                      on
                        ? "border-[#052e1d] bg-[#052e1d] text-[#f4d98a] shadow-[0_10px_24px_-10px_rgba(5,46,29,.7)]"
                        : "border-[#052e1d]/25 bg-transparent text-[#052e1d] hover:border-[#c89516] hover:bg-[#ecc050]/25"
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-14 grid gap-10 min-[900px]:mt-20 min-[900px]:grid-cols-3 min-[900px]:gap-8">
            {questions.map((q) => (
              <article key={q.title} className="group relative border-t-2 border-[#052e1d]/80 pt-5">
                <span
                  aria-hidden="true"
                  className="absolute -top-[2px] left-0 h-[2px] w-0 bg-[linear-gradient(90deg,#ecc050,#d9a521)] transition-all duration-700 ease-out group-hover:w-full"
                />
                <h3 className={`${D} text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-[#052e1d] transition-colors duration-300 group-hover:text-[#8a6410]`}>
                  {q.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.5] text-[#3d5a49]">{q.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PAY ───────── */}
      <section id="pay" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#052e1d,#031c12)] py-16 text-white min-[900px]:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 z-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(25,195,125,.35),transparent_68%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-[-160px] z-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,165,33,.3),transparent_68%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1120px] px-5">
          <h2 className={`${D} max-w-xl text-[clamp(30px,4.4vw,52px)] font-extrabold leading-[1] tracking-[-0.04em]`}>
            Good work pays promptly.
          </h2>

          <div ref={payRef} className="mt-12 grid gap-4 min-[900px]:grid-cols-[1.35fr_1fr] min-[900px]:grid-rows-2">
            <article className="group relative flex flex-col justify-between gap-12 overflow-hidden rounded-3xl border border-[#ecc050]/30 bg-[linear-gradient(155deg,rgba(236,192,80,.16),rgba(255,255,255,.04)_55%)] p-7 backdrop-blur-xl transition duration-500 hover:border-[#ecc050]/70 hover:shadow-[0_30px_80px_-30px_rgba(236,192,80,.45)] min-[900px]:row-span-2 min-[900px]:p-9">
              {/* lightning bolt watermark */}
              <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute -right-6 -top-6 size-48 rotate-12 fill-[#ecc050] opacity-[0.07] transition duration-700 group-hover:opacity-[0.14]">
                <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
              </svg>
              <svg className="h-24 w-full" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="landing-payment-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#19c37d" />
                    <stop offset="1" stopColor="#ecc050" />
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
                <h3 className={`${D} text-[clamp(36px,5.4vw,64px)] font-extrabold leading-none tracking-[-0.04em]`}>
                  Bitcoin{" "}
                  <span className="ml-1.5 inline-block translate-y-[-0.35em] rounded-full border border-[#ecc050]/60 px-3 py-1 font-[family-name:var(--landing-body)] text-xs font-semibold tracking-normal text-[#f4d98a]">
                    Lightning
                  </span>
                </h3>
                <p className="mt-3 text-[16px] leading-[1.45] text-white/80">Paid in seconds, no bank.</p>
              </div>
            </article>

            {["Like mobile money|Phone to phone, nothing to clear.", "No balance to hold|No minimum, no frozen funds."].map((c) => {
              const [t, b] = c.split("|")
              return (
                <article
                  key={t}
                  className="group flex flex-col justify-between gap-8 rounded-3xl border border-[#ecc050]/20 bg-white/[0.05] p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#ecc050]/60 hover:bg-white/[0.08] hover:shadow-[0_26px_60px_-28px_rgba(236,192,80,.4)]"
                >
                  <span aria-hidden="true" className="h-1 w-8 rounded-full bg-[linear-gradient(90deg,#19c37d,#ecc050)] transition-all duration-500 group-hover:w-16" />
                  <div>
                    <h3 className={`${D} text-[24px] font-bold leading-[1.1] tracking-[-0.02em]`}>{t}</h3>
                    <p className="mt-2 text-[15px] leading-[1.45] text-white/80">{b}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────── JOIN ───────── */}
      <section id="join" className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#f4d98a,#ecc050_48%,#d9a521)] pt-20 text-center text-[#052e1d] min-[900px]:pt-28">
        <svg aria-hidden="true" viewBox="0 0 600 600" className="landing-spin pointer-events-none absolute left-1/2 top-1/2 -z-0 size-[820px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
          <g fill="none" stroke="#052e1d">
            <circle cx="300" cy="300" r="290" strokeWidth="1.5" strokeDasharray="2 10" />
            <circle cx="300" cy="300" r="230" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="170" strokeWidth="1.5" strokeDasharray="40 14" />
          </g>
        </svg>

        <div className="relative z-10 mx-auto w-full max-w-[1120px] px-5 pb-20 min-[900px]:pb-28">
          <h2 className={`${D} mx-auto max-w-[14em] text-[clamp(32px,5.4vw,64px)] font-extrabold leading-[0.98] tracking-[-0.045em]`}>
            Bring local knowledge into the conversation.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Btn href="/signup" variant="forest">
              Join as an evaluator
            </Btn>
            <Btn href="/signup?as=company" variant="outlineDark">
              For companies
            </Btn>
          </div>
        </div>

        <footer className="relative z-10 bg-[#031c12] py-5 text-[13px] text-[#f4d98a]/70">
          <div className="mx-auto flex w-full max-w-[1120px] flex-wrap justify-between gap-2 px-5">
            <p>Taska · Hack4Freedom 2026</p>
            <p>Get paid in Bitcoin, instantly over Lightning.</p>
          </div>
        </footer>
      </section>
      <LandingDock />
    </div>
  )
}
