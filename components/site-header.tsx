import Link from "next/link"
import { auth, signOut } from "@/auth"
import { AuthBtn } from "@/components/auth-btn"
import { brand } from "@/lib/brand"

// quiet pill links: green text, soft wash on hover, press scale.
// On login/signup the link sits over the dark green panel on small screens, so it turns cream there.
const navLink =
  "inline-flex items-center rounded-full px-3.5 py-2 text-[14px] font-semibold text-[#12382b]/80 transition duration-200 " +
  "hover:bg-[#12382b]/8 hover:text-[#12382b] active:scale-95 " +
  "group-has-[.auth-page]:max-lg:text-[#f7f3e8]/85 group-has-[.auth-page]:max-lg:hover:bg-[#f7f3e8]/10 group-has-[.auth-page]:max-lg:hover:text-[#f7f3e8] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6b53]"

export async function SiteHeader() {
  const session = await auth()
  const role = session?.user.role

  return (
    <header className="sticky top-0 z-20 border-b border-[#12382b]/10 bg-[linear-gradient(90deg,rgba(230,240,230,.92),rgba(241,240,220,.92)_55%,rgba(248,230,207,.92))] backdrop-blur-md group-has-[.landing-home,.auth-page]:absolute group-has-[.landing-home,.auth-page]:inset-x-0 group-has-[.landing-home,.auth-page]:top-0 group-has-[.landing-home,.auth-page]:border-0 group-has-[.landing-home,.auth-page]:bg-none group-has-[.landing-home,.auth-page]:backdrop-blur-none">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 lg:px-16 group-has-[.landing-home]:min-h-14 group-has-[.landing-home]:max-w-[1040px] group-has-[.landing-home]:lg:px-5 group-has-[.auth-page]:min-h-14 group-has-[.auth-page]:max-w-none group-has-[.auth-page]:sm:px-8 group-has-[.auth-page]:lg:px-16">
        <Link
          href="/"
          aria-label={`${brand.name} home`}
          className="group/logo inline-flex items-center gap-2.5 rounded-full font-display text-2xl tracking-[-0.03em] text-[#12382b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53] group-has-[.landing-home,.auth-page]:text-lg group-has-[.auth-page]:text-[#f7f3e8] group-has-[.auth-page]:focus-visible:outline-[#f0ac6e]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none size-7 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f0ac6e,#2f6b53)] shadow-[0_6px_14px_-6px_rgba(18,56,43,.8)] transition duration-300 group-hover/logo:rotate-12 group-hover/logo:scale-110 group-has-[.landing-home,.auth-page]:size-4.25"
          />
          {brand.name}
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex w-full flex-wrap items-center gap-1 border-t border-[#12382b]/10 pt-2 sm:ml-auto sm:w-auto sm:justify-end sm:border-0 sm:pt-0 group-has-[.landing-home,.auth-page]:w-auto group-has-[.landing-home,.auth-page]:border-t-0 group-has-[.landing-home,.auth-page]:pt-0"
        >
          {role === "WORKER" ? (
            <>
              <Link className={navLink} href="/dashboard">My work</Link>
              <Link className={navLink} href="/tasks">Tasks</Link>
              <Link className={navLink} href="/dashboard#payouts">Payouts</Link>
              <Link className={navLink} href="/profile">Profile</Link>
            </>
          ) : null}

          {role === "EMPLOYER" ? (
            <>
              <Link className={navLink} href="/employer">Evaluations</Link>
              <Link className={navLink} href="/employer/credits">Add credit</Link>
              <Link className={navLink} href="/employer/upload">Upload</Link>
              <Link className={navLink} href="/employer/evaluations/new">Check an answer</Link>
            </>
          ) : null}

          {role === "ADMIN" ? (
            <>
              <Link className={navLink} href="/admin">Review queue</Link>
              <Link className={navLink} href="/admin/invite">Invite</Link>
            </>
          ) : null}

          {session ? (
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <AuthBtn type="submit" variant="secondary" size="sm">
                Log out
              </AuthBtn>
            </form>
          ) : (
            <>
              <Link className={`${navLink} group-has-[.landing-home,.auth-page]:max-[899px]:hidden`} href="/login">
                Log in
              </Link>
              <AuthBtn href="/signup" variant="primary" size="sm">
                {brand.cta}
              </AuthBtn>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}