import Link from "next/link"
import CheckDemo from "@/components/CheckDemo"
// import { LandingDemoCard } from "@/components/landing-demo-card"
import { LandingDock } from "@/components/landing-dock"
import { btnGlass, btnPrimary } from "@/lib/styles"

const people = [
  ["Companies", "Ship AI that works for local customers, with proof that real speakers checked it."],
  ["Local speakers", "Earn from the language they speak. Paid in seconds, and their name stays private."],
  ["Reviewers", "Keep the checks honest and get paid for each approved answer."],
  ["People using AI", "Get answers that are right, natural and made for where they live."],
]

const split = [
  ["Speaker", 500, "bg-lime"],
  ["Reviewer", 400, "bg-accent"],
  ["Taska fee (2%)", 18, "bg-white/50"],
] as const

export default function HomePage() {
  return (
    <div className="landing-home max-[899px]:pb-[92px]">
      <section id="top" className="relative isolate overflow-hidden bg-deep text-white">
        <div className="mesh" aria-hidden="true">
          <i className="right-[-120px] top-[-60px] h-[500px] w-[500px] bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="right-[140px] top-[220px] size-[380px] opacity-30 bg-[radial-gradient(circle,#c6f24a,transparent_68%)]" />
          {/* amber blob removed to keep the colours calmer
          <i className="right-[-60px] top-[340px] size-[340px] opacity-40 bg-[radial-gradient(circle,#ffb82e,transparent_68%)]" />
          */}
        </div>
        <div className="relative z-10 mx-auto grid w-full max-w-[1040px] items-center gap-8 px-6 pb-20 pt-24 min-[900px]:grid-cols-1">
          <div>
            <h1 className="max-w-xl text-[clamp(34px,5.4vw,60px)] leading-none tracking-[-0.035em]">
              <span className="block">Make AI sound</span>
              <span className="block bg-[linear-gradient(90deg,#c6f24a,#19c37d_60%,#ffb82e)] bg-clip-text text-transparent">like it belongs.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              Native speakers fix what AI gets wrong, in everyday language. You get paid in Bitcoin the moment it&apos;s approved.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href="/signup">
                Sign me up
              </Link>
              <Link className={btnGlass} href="/signup?as=company">
                For companies
              </Link>
            </div>
            <a href="#demo" className="mt-6 inline-block text-sm font-medium text-white/80 underline underline-offset-4">
              Try the demo first
            </a>
          </div>
          {/* <LandingDemoCard /> */}
        </div>
      </section>

      {/* TRY IT: the problem, complication and solution story */}
      <section id="demo" className="scroll-mt-20 py-14 min-[900px]:py-20">
        <div className="mx-auto w-full max-w-[1040px] px-6">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Try it yourself.</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            Pick a language, play the speaker, play the reviewer, and watch the payment arrive.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <CheckDemo />
          </div>
        </div>
      </section>

      <section id="how" className="py-14 min-[900px]:py-20">
        <div className="mx-auto w-full max-w-[1040px] px-6">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">From AI answer to paid review.</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 min-[900px]:grid-cols-4">
            <article className="flex flex-col gap-3 rounded-[18px] border border-line bg-card p-6">
              <span className="font-display text-[28px] font-extrabold leading-none text-accent">1</span>
              <div>
                <h3 className="text-[17px] leading-[1.1]">Company sends an AI answer</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">A greeting, slang or phrase.</p>
              </div>
            </article>
            <article className="flex flex-col gap-3 rounded-[18px] border border-transparent bg-lime p-6 text-ink">
              <span className="font-display text-[28px] font-extrabold leading-none">2</span>
              <div>
                <h3 className="text-[17px] leading-[1.1]">You fix what&apos;s off</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#2c4a1a]">Write it how people talk.</p>
              </div>
            </article>
            <article className="flex flex-col gap-3 rounded-[18px] border border-line bg-card p-6">
              <span className="font-display text-[28px] font-extrabold leading-none text-accent">3</span>
              <div>
                <h3 className="text-[17px] leading-[1.1]">A speaker checks</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Not approved? Nobody pays.</p>
              </div>
            </article>
            <article className="flex flex-col gap-3 rounded-[18px] border border-transparent bg-deep p-6 text-[#eef6f1]">
              <span className="font-display text-[28px] font-extrabold leading-none text-hl">4</span>
              <div>
                <h3 className="text-[17px] leading-[1.1]">You get paid</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#a9bfb2]">Straight to your wallet. We never hold it.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="pt-2 pb-14 min-[900px]:pb-20">
        <div className="mx-auto w-full max-w-[1040px] px-6">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Not just correct. True here.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-transparent bg-accent px-3.5 py-1.5 font-display text-sm font-bold text-white">Greetings</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Slang</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Mobile money</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Jokes</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Paying bills</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Asking for help</span>
            <span className="rounded-full border border-line bg-card px-3.5 py-1.5 font-display text-sm font-bold">Street talk</span>
          </div>
          <div className="mt-8 grid gap-6 min-[900px]:grid-cols-3">
            <article className="border-t-2 border-ink pt-4">
              <h3 className="text-base leading-[1.1]">Does the slang land?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Words and jokes change fast.</p>
            </article>
            <article className="border-t-2 border-ink pt-4">
              <h3 className="text-base leading-[1.1]">Would someone from here say it?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Not textbook. How people talk.</p>
            </article>
            <article className="border-t-2 border-ink pt-4">
              <h3 className="text-base leading-[1.1]">Does it know how things work here?</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">Bills, money, help, the local way.</p>
            </article>
          </div>
        </div>
      </section>

      {/* WHO WE HELP */}
      <section className="pb-14 min-[900px]:pb-20">
        <div className="mx-auto w-full max-w-[1040px] px-6">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Who Taska helps.</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 min-[900px]:grid-cols-4">
            {people.map(([title, copy]) => (
              <article key={title} className="rounded-[18px] border border-line bg-card p-6">
                <h3 className="text-[17px] leading-[1.1]">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pay" className="relative isolate overflow-hidden bg-deep py-14 text-white min-[900px]:py-20">
        <div className="mesh" aria-hidden="true">
          <i className="left-[-150px] top-[-100px] h-[340px] w-[340px] opacity-60 bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="right-[-100px] top-[120px] size-[380px] opacity-30 bg-[radial-gradient(circle,#c6f24a,transparent_68%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1040px] px-6">
          <h2 className="text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Good work pays promptly.</h2>
          <div className="mt-8 grid gap-4 min-[900px]:grid-cols-[1.4fr_1fr_1fr]">
            <article className="flex flex-col justify-between gap-4 rounded-[18px] border border-white/22 bg-[linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-6 shadow-[0_36px_70px_-30px_rgba(0,0,0,.6)] backdrop-blur-[22px]">
              <svg className="h-[34px] w-full" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="landing-payment-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#19c37d" />
                    <stop offset="1" stopColor="#c6f24a" />
                  </linearGradient>
                </defs>
                <path d="M0 58 C30 50 40 60 70 44 S120 48 150 30 S210 36 240 16 S280 14 300 6" fill="none" stroke="url(#landing-payment-gradient)" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div>
                <h3 className="font-display text-[26px] font-extrabold leading-none tracking-tight">Bitcoin <span className="ml-1.5 text-[11px] font-semibold tracking-normal text-hl">Lightning</span></h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">Paid in seconds, no bank.</p>
              </div>
            </article>
            <article className="flex flex-col justify-between gap-4 rounded-[18px] border border-white/22 bg-[linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-6 shadow-[0_36px_70px_-30px_rgba(0,0,0,.6)] backdrop-blur-[22px]">
              <h3 className="font-display text-base leading-[1.1]">Like mobile money</h3>
              <p className="text-[13.5px] leading-relaxed text-white/80">Phone to phone, nothing to clear.</p>
            </article>
            <article className="flex flex-col justify-between gap-4 rounded-[18px] border border-white/22 bg-[linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.05))] p-6 shadow-[0_36px_70px_-30px_rgba(0,0,0,.6)] backdrop-blur-[22px]">
              <h3 className="font-display text-base leading-[1.1]">No balance to hold</h3>
              <p className="text-[13.5px] leading-relaxed text-white/80">No minimum, no frozen funds.</p>
            </article>
          </div>

          {/* The numbers: where each approved answer's sats go */}
          <div className="mt-4 rounded-[18px] border border-white/22 bg-white/5 p-6">
            <div
              className="flex h-4 w-full gap-1 overflow-hidden rounded-full"
              role="img"
              aria-label="Payment split: speaker 500 sats, reviewer 400 sats, Taska 18 sats"
            >
              {split.map(([label, sats, color]) => (
                <div key={label} className={`${color} rounded-full`} style={{ flexGrow: sats, flexBasis: 0 }} />
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              {split.map(([label, sats]) => (
                <div key={label}>
                  <dt className="text-[13.5px] text-white/70">{label}</dt>
                  <dd className="font-display text-xl font-bold">{sats} sats</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">918 sats per approved answer. Rejected work is not charged.</p>
          </div>
        </div>
      </section>

      <section id="join" className="relative isolate overflow-hidden bg-deep pt-16 text-center text-white min-[900px]:pt-20">
        <div className="mesh" aria-hidden="true">
          <i className="right-[-120px] top-[-140px] size-[340px] opacity-60 bg-[radial-gradient(circle,#19c37d,#0b6b44_60%,transparent_72%)]" />
          <i className="left-[12%] top-[20px] size-[300px] opacity-[0.3] bg-[radial-gradient(circle,#c6f24a,transparent_68%)]" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1040px] px-6">
          <h2 className="mx-auto max-w-[14em] text-[clamp(24px,3.2vw,34px)] leading-none tracking-[-0.035em]">Bring local knowledge into the conversation.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className={btnPrimary} href="/signup">
              Join as a speaker
            </Link>
            <Link className={btnGlass} href="/signup?as=company">
              For companies
            </Link>
          </div>
        </div>
        <footer className="relative z-10 mt-14 border-t border-white/15 py-6 text-[13px] text-white/60">
          <div className="mx-auto flex w-full max-w-[1040px] flex-wrap justify-between gap-2 px-6">
            <p>Taska</p>
            <p>Get paid in Bitcoin, instantly over Lightning.</p>
          </div>
        </footer>
      </section>
      <LandingDock />
    </div>
  )
}