import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { Container } from "@/components/ui"

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : undefined

  return (
    <Container className="login-layout max-w-none! px-0! py-0">
      <div className="grid min-h-[calc(100svh-128px)] lg:grid-cols-2">
        <section className="lagoon-dark-panel relative isolate flex h-75 flex-col justify-end overflow-hidden px-5 pb-24 pt-8 text-white sm:px-8 lg:h-auto lg:min-h-155 lg:px-16 lg:pb-16">
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-36 -right-24 size-80 rounded-full bg-[#2F9B6A]/55 blur-[72px]" />
          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl tracking-tight text-white sm:text-5xl">Log in</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
              Help train AI in your language, or get your answers checked.{" "}
              <Link className="font-bold text-white underline underline-offset-4" href="/signup">
                Sign me up
              </Link>
            </p>
          </div>
        </section>
        <div className="relative z-10 mx-auto -mt-17.5 w-full max-w-md px-5 pb-12 lg:my-auto lg:mt-0 lg:max-w-none lg:px-12 lg:py-12">
          <div className="rounded-lg border border-line bg-card p-5 shadow-[0_30px_60px_-30px_rgba(15,42,32,.25)] sm:p-8 lg:mx-auto lg:max-w-95 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <LoginForm callbackUrl={callbackUrl} demoEnabled={process.env.DEMO_LOGIN === "true"} />
          </div>
        </div>
      </div>
    </Container>
  )
}
