"use client"

import Link from "next/link"
import { useState } from "react"
import { LandingDemoCard } from "@/components/landing-demo-card"
import { LandingDock } from "@/components/landing-dock"
import { btnGlass, btnPrimary } from "@/lib/styles"

/*
  Palette (all literal so Tailwind picks them up, no config changes needed)
  forest   #031c12 / #06402a   deep backgrounds
  emerald  #0f8a56 / #19c37d   primary green
  sage     #dfeedd / #eef5e6   light green surfaces
  gold     #e8b83a             highlight gold
  mustard  #c9961a / #8a6410   deeper mustard for text and borders
  cream    #f7f2e1             page background
*/

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

const glassCard =
  "group flex flex-col justify-between gap-2.5 rounded-[18px] border border-[#e8b83a]/30 bg-[linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-3.5 shadow-[0_36px_70px_-30px_rgba(0,0,0,.6)] backdrop-blur-[22px] transition duration-300 hover:-translate-y-1.5 hover:border-[#e8b83a]/70 hover:shadow-[0_40px_70px_-26px_rgba(232,184,58,.35)]"

export default function HomePage() {
  const [active, setActive] = useState(1)
  const [picked, setPicked] = useState<string[]>(["Greetings", "Mobile money", "Paying bills"])
  const [glow, setGlow] = useState({ x: 70, y: 30 })

  const toggleTopic = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  return (
    <div className="landing-home bg-[#f7f2e1] text-[#082a1b] max-[899px]:pb-[92px]">
      <style>{`
        @keyframes landing-float { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-22px,0) } }
        @keyframes landing-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
        .landing-float { animation: landing-float 9s ease-in-out infinite }
        .landing-rise { animation: landing-rise .8s ease-out both }
        @media (prefers-reduced-motion: reduce) { .landing-float, .landing-rise { animation: none } }
      `}</style>

      {/* HERO */}
      <section
        id="top"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#031c12,#06402a_65%,#0a3a24)] text-white"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-[background] duration-300"
          style={{ background: `radial-gradient(420px circle at ${glow.x}% ${glow.y}%, rgba(232,184,58,.22), transparent 70%)` }}
          aria-hidden="true"
        />
        <div className="mesh" aria-hidden="true">
          <i className="landing-float right-[-120px] top-[-60px] h-[500px] w-[500px] bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="landing-float right-[140px] top-[220px] size-[380px] opacity-[0.55] bg-[radial-gradient(circle,#e8b83a,transparent_68%)]" />
          <i className="landing-float right-[-60px] top-[340px] size-[340px] opacity-40 bg-[radial-gradient(circle,#c9961a,transparent_68%)]" />
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-[1040px] items-center gap-7 px-5 pb-12 pt-[76px] min-[900px]:grid-cols-[1.1fr_0.9fr]">
          <div className="landing-rise">
            <h1 className="max-w-xl text-[clamp(34px,5.4vw,60px)] leading-none tracking-[-0.035em]">
              <span className="block">Make AI sound</span>
              <span className="block bg-[linear-gradient(90deg,#f3d37a,#e8b83a_35%,#19c37d_80%)] bg-clip-text text-transparent">like it belongs.</span>
            </h1>
            <p className="mt-3.5 max-w-xl text-base leading-relaxed text-white/75">
              Native speakers fix what AI gets wrong, in everyday language. You get paid in Bitcoin the moment it&apos;s approved.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={btnPrimary} href="/signup">
                Sign me up
              </Link>
              <Link className={btnGlass} href="/signup?as=company">
                For companies
              </Link>
            </div>
          </div>
          <LandingDemoCard />
        </div>
      </section>

      {/* HOW IT WORKS: hover or tap a step to bring it forward */}
      <section id="how" className="py-8 min-[900px]:py-10">
        <div className="mx-auto w-full max-w-[1040px] px-5">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em] text-[#06402a]">From AI answer to paid review.</h2>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#06402a]/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0f8a56,#19c37d,#e8b83a)] transition-[width] duration-500 ease-out"
              style={{ width: `${((active + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 min-[900px]:grid-cols-4">
            {steps.map((s, i) => {
              const on = i === active
              return (
                <button
                  key={s.title}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`flex flex-col gap-2.5 rounded-[18px] border p-4 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9961a] ${
                    on
                      ? "-translate-y-1.5 border-2 border-[#06402a] bg-[linear-gradient(150deg,#f3d37a,#e8b83a_55%,#c9961a)] text-[#06240f] shadow-[4px_4px_0_#06402a]"
                      : "border-[#06402a]/15 bg-[#fffaf0] hover:border-[#c9961a]/60"
                  }`}
                >
                  <span className={`font-display text-[28px] font-extrabold leading-none ${on ? "text-[#06402a]" : "text-[#0f8a56]"}`}>{i + 1}</span>
                  <div>
                    <h3 className="text-[17px] leading-[1.1]">{s.title}</h3>
                    <p className={`mt-1 text-[13.5px] leading-[1.4] ${on ? "text-[#3d4a0e]" : "text-[#4f6b5a]"}`}>{s.body}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* TRUE HERE: pick the topics, questions light up */}
      <section className="pt-0 pb-8 min-[900px]:pb-10">
        <div className="mx-auto w-full max-w-[1040px] px-5">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em] text-[#06402a]">Not just correct. True here.</h2>
          <div className="mt-4 flex flex-wrap gap-[7px]">
            {topics.map((t) => {
              const on = picked.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-1.5 font-display text-sm font-bold transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9961a] ${
                    on
                      ? "border-[#06402a] bg-[#0f8a56] text-white shadow-[2px_2px_0_#06402a]"
                      : "border-[#c9961a]/50 bg-[#fffaf0] text-[#06402a] hover:bg-[#f3d37a]/50"
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
          <div className="mt-4 grid gap-4 min-[900px]:grid-cols-3">
            {questions.map((q) => (
              <article
                key={q.title}
                className="group border-t-2 border-[#06402a] pt-2.5 transition-colors duration-300 hover:border-[#c9961a]"
              >
                <h3 className="text-base leading-[1.1] transition-colors group-hover:text-[#8a6410]">{q.title}</h3>
                <p className="mt-1 text-[13.5px] leading-[1.4] text-[#4f6b5a]">{q.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PAY */}
      <section id="pay" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#06402a,#031c12)] py-8 text-white min-[900px]:py-10">
        <div className="mesh" aria-hidden="true">
          <i className="landing-float left-[-150px] top-[-100px] h-[340px] w-[340px] opacity-60 bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="landing-float right-[-100px] top-[120px] size-[380px] opacity-[0.55] bg-[radial-gradient(circle,#e8b83a,transparent_68%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1040px] px-5">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Good work pays promptly.</h2>
          <div className="mt-[18px] grid gap-2.5 min-[900px]:grid-cols-[1.4fr_1fr_1fr]">
            <article className={glassCard}>
              <svg className="h-[34px] w-full" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="landing-payment-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#19c37d" />
                    <stop offset="1" stopColor="#e8b83a" />
                  </linearGradient>
                </defs>
                <path d="M0 58 C30 50 40 60 70 44 S120 48 150 30 S210 36 240 16 S280 14 300 6" fill="none" stroke="url(#landing-payment-gradient)" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div>
                <h3 className="font-display text-[26px] font-extrabold leading-none tracking-tight">Bitcoin <span className="ml-1.5 text-[11px] font-semibold tracking-normal text-[#e8b83a]">Lightning</span></h3>
                <p className="mt-1 text-[13.5px] leading-[1.4] text-white/80">Paid in seconds, no bank.</p>
              </div>
            </article>
            <article className={glassCard}>
              <h3 className="font-display text-base leading-[1.1]">Like mobile money</h3>
              <p className="text-[13.5px] leading-[1.4] text-white/80">Phone to phone, nothing to clear.</p>
            </article>
            <article className={glassCard}>
              <h3 className="font-display text-base leading-[1.1]">No balance to hold</h3>
              <p className="text-[13.5px] leading-[1.4] text-white/80">No minimum, no frozen funds.</p>
            </article>
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#031c12,#021209)] pt-10 text-center text-white min-[900px]:pt-11">
        <div className="mesh" aria-hidden="true">
          <i className="landing-float right-[-120px] top-[-140px] size-[340px] opacity-60 bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="landing-float left-[12%] top-[20px] size-[300px] opacity-[0.4] bg-[radial-gradient(circle,#e8b83a,transparent_68%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1040px] px-5">
          <h2 className="mx-auto max-w-[14em] text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Bring local knowledge into the conversation.</h2>
          <div className="mt-[18px] flex flex-wrap justify-center gap-3">
            <Link className={btnPrimary} href="/signup">
              Join as an evaluator
            </Link>
            <Link className={btnGlass} href="/signup?as=company">
              For companies
            </Link>
          </div>
        </div>
        <footer className="relative z-10 mt-7 border-t border-[#e8b83a]/25 py-4 text-[13px] text-white/60">
          <div className="mx-auto flex w-full max-w-[1040px] flex-wrap justify-between gap-2 px-5">
            <p>Taska · Hack4Freedom 2026</p>
            <p>Get paid in Bitcoin, instantly over Lightning.</p>
          </div>
        </footer>
      </section>
      <LandingDock />
    </div>
  )
}
