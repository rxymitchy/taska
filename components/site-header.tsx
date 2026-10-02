import Link from "next/link"
import { signOut } from "@/auth"
import { auth } from "@/auth"
import { brand } from "@/lib/brand"
import { btnPrimary, btnQuiet } from "@/lib/styles"

export async function SiteHeader() {
  const session = await auth()
  const role = session?.user.role

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur group-has-[.landing-home]:absolute group-has-[.landing-home]:inset-x-0 group-has-[.landing-home]:top-0 group-has-[.landing-home]:border-0 group-has-[.landing-home]:bg-transparent group-has-[.landing-home]:backdrop-blur-none">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 lg:px-16 group-has-[.landing-home]:min-h-14 group-has-[.landing-home]:max-w-[1040px] group-has-[.landing-home]:lg:px-5">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl text-ink group-has-[.landing-home]:gap-[9px] group-has-[.landing-home]:text-lg group-has-[.landing-home]:tracking-[-0.03em] group-has-[.landing-home]:text-white" aria-label={`${brand.name} home`}>
          <span aria-hidden="true" className="pointer-events-none size-7 rounded-md bg-accent group-has-[.landing-home]:size-[17px] group-has-[.landing-home]:rounded-full group-has-[.landing-home]:bg-[radial-gradient(circle_at_30%_30%,#c6f24a,#0e9a60)]" />
          {brand.name}
        </Link>
        <nav aria-label="Main navigation" className="flex w-full flex-wrap items-center gap-1 border-t border-line pt-2 text-sm font-medium sm:ml-auto sm:w-auto sm:border-0 sm:pt-0 sm:justify-end group-has-[.landing-home]:w-auto group-has-[.landing-home]:border-t-0 group-has-[.landing-home]:pt-0 group-has-[.landing-home]:text-[15px] group-has-[.landing-home]:[&_a]:text-white group-has-[.landing-home]:[&_a.bg-lime]:text-ink group-has-[.landing-home]:[&_button]:text-white">
          {role === "WORKER" ? (
            <>
              <Link className={btnQuiet} href="/dashboard">
                My work
              </Link>
              <Link className={btnQuiet} href="/tasks">
                Tasks
              </Link>
              <Link className={btnQuiet} href="/dashboard#payouts">
                Payouts
              </Link>
              <Link className={btnQuiet} href="/profile">
                Profile
              </Link>
            </>
          ) : null}
          {role === "EMPLOYER" ? (
            <>
              <Link className={btnQuiet} href="/employer">
                Evaluations
              </Link>
              <Link className={btnQuiet} href="/employer/credits">
                Add credit
              </Link>
              <Link className={btnQuiet} href="/employer/upload">
                Upload
              </Link>
              <Link className={btnQuiet} href="/employer/evaluations/new">
                Check an answer
              </Link>
            </>
          ) : null}
          {role === "ADMIN" ? (
            <>
              <Link className={btnQuiet} href="/admin">
                Review queue
              </Link>
              <Link className={btnQuiet} href="/admin/invite">
                Invite
              </Link>
            </>
          ) : null}
          {session ? (
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button className={btnQuiet} type="submit">
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link className={`${btnQuiet} group-has-[.landing-home]:max-[899px]:hidden`} href="/login">
                Log in
              </Link>
              <Link className={btnPrimary} href="/signup">
                {brand.cta}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
