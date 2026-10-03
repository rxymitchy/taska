import type { Metadata } from "next"
import Link from "next/link"
import { Bricolage_Grotesque, Figtree } from "next/font/google"
import { SignupForm } from "@/components/signup-form"
import { AuthHero } from "@/components/auth-hero"
import { Container } from "@/components/ui"
import { findOpenInvite } from "@/lib/invites"

export const metadata: Metadata = { title: "Create account" }

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--landing-display", display: "swap" })
const body = Figtree({ subsets: ["latin"], variable: "--landing-body", display: "swap" })

const D = "font-(family-name:--landing-display)"
const chips = ["Greetings", "Slang", "Mobile money"]

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; as?: string }>
}) {
  const { invite, as: asParam } = await searchParams
  const openInvite = invite ? await findOpenInvite(invite) : null
  const invalidInvite = Boolean(invite && !openInvite)
  const asCompany = asParam === "company"

  const title = openInvite ? "Join as a reviewer" : "Create your account"
  const blurb = openInvite
    ? "You double-check the work. If you agree, they get paid — and so do you."
    : "Evaluators catch bad slang and local mix-ups. Companies send answers to be checked."

  return (
    <Container
      className={`login-layout max-w-none! px-0! py-0 ${display.variable} ${body.variable} font-(family-name:--landing-body) text-[#12382b] antialiased`}
    >
      <style>{`
        @keyframes auth-rise { from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: none } }
        @keyframes auth-orbit { to { transform: rotate(360deg) } }
        @keyframes auth-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .auth-rise { opacity: 0; animation: auth-rise .9s cubic-bezier(.2,.7,.2,1) forwards }
        .auth-orbit { animation: auth-orbit 40s linear infinite }
        .auth-bob { animation: auth-bob 6s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .auth-rise { opacity: 1; animation: none }
          .auth-orbit, .auth-bob { animation: none }
        }
      `}</style>

      <div className="grid min-h-[calc(100svh-128px)] bg-[linear-gradient(180deg,#e6f0e6_0%,#f1f0dc_50%,#f8e6cf_100%)] lg:grid-cols-2">
        {/* left: deep green with orange glow */}
        <AuthHero className="relative isolate flex h-75 flex-col justify-end overflow-hidden bg-[linear-gradient(150deg,#1c4a3a,#12382b_60%,#2b3c1f)] px-5 pb-24 pt-8 text-[#f7f3e8] sm:px-8 lg:h-auto lg:min-h-155 lg:px-16 lg:pb-16">
          <span aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 -z-10 size-105 rounded-full bg-[radial-gradient(circle,rgba(143,184,163,.3),transparent_68%)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-20 -z-10 size-125 rounded-full bg-[radial-gradient(circle,rgba(232,150,79,.38),transparent_68%)]" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-60 mask-[linear-gradient(0deg,#000,transparent_85%)]"
            style={{ backgroundImage: "radial-gradient(rgba(247,243,232,.12) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
          />
          <svg aria-hidden="true" viewBox="0 0 600 600" className="auth-orbit pointer-events-none absolute -right-40 -top-40 -z-10 size-150 opacity-[0.16]">
            <g fill="none" stroke="#f7f3e8">
              <circle cx="300" cy="300" r="290" strokeDasharray="2 10" />
              <circle cx="300" cy="300" r="230" />
              <circle cx="300" cy="300" r="170" strokeDasharray="40 14" />
            </g>
          </svg>

          <div aria-hidden="true" className="pointer-events-none absolute right-12 top-16 hidden flex-col items-end gap-3 lg:flex">
            {chips.map((c, i) => (
              <span
                key={c}
                style={{ animationDelay: `${i * 0.8}s` }}
                className={`auth-bob ${D} rounded-full border px-5 py-2.5 text-[15px] font-semibold backdrop-blur-sm ${
                  i % 2
                    ? "border-[#f0ac6e]/50 bg-[#f0ac6e]/20 text-[#f6c9a0]"
                    : "border-[#8fb8a3]/40 bg-[#8fb8a3]/15 text-[#d3e6da]"
                }`}
              >
                {c}
              </span>
            ))}
          </div>

          <div className="relative z-10 max-w-xl">
            <h1
              className={`${D} auth-rise bg-[linear-gradient(90deg,#f7f3e8,#f6c9a0_60%,#f0ac6e)] bg-clip-text pb-[0.1em] text-4xl font-bold leading-none tracking-[-0.045em] text-transparent sm:text-5xl lg:text-6xl`}
              style={{ animationDelay: "80ms" }}
            >
              {title}
            </h1>
            {!invalidInvite ? (
              <p className="auth-rise mt-4 max-w-md text-[16px] leading-[1.6] text-[#f7f3e8]/80" style={{ animationDelay: "220ms" }}>
                {blurb}
              </p>
            ) : null}
            <div className="auth-rise mt-6 flex flex-wrap items-center gap-3" style={{ animationDelay: "360ms" }}>
              <span className="text-[14px] text-[#f7f3e8]/65">Already here?</span>
              <Link
                href="/login"
                className="group inline-flex items-center rounded-full border border-[#8fb8a3]/40 bg-[#8fb8a3]/15 px-5 py-2.5 text-[14px] font-semibold text-[#f7f3e8] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#8fb8a3]/30 active:scale-[0.97] focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#f0ac6e]"
              >
                Log in
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="ml-0 size-3.5 w-0 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:w-3.5 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:w-3.5 group-focus-visible:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>
        </AuthHero>

        {/* right: the form */}
        <div className="relative z-10 mx-auto -mt-17.5 w-full max-w-md px-5 pb-12 lg:my-auto lg:mt-0 lg:max-w-none lg:px-12 lg:py-12">
          <div
            className="auth-rise rounded-[28px] border border-[#12382b]/10 bg-[linear-gradient(160deg,#f4f1de,#fbe6cc)] p-6 shadow-[0_30px_60px_-30px_rgba(18,56,43,.45)] sm:p-8 lg:mx-auto lg:max-w-95 lg:border-0 lg:bg-none lg:p-0 lg:shadow-none"
            style={{ animationDelay: "300ms" }}
          >
            {invalidInvite ? (
              <p role="alert" className="rounded-2xl border border-[#c8732a]/40 bg-[#fbdcbd] px-4 py-3 text-[14px] font-medium text-[#7a3412]">
                This invite is invalid or has expired.
              </p>
            ) : (
              <SignupForm
                inviteToken={openInvite ? invite : undefined}
                inviteEmail={openInvite?.email}
                asCompany={asCompany}
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}