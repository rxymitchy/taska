import Link from "next/link"
import { signOut } from "@/auth"
import { auth } from "@/auth"
import { brand } from "@/lib/brand"
import { btnPrimary, btnQuiet } from "@/lib/styles"

export async function SiteHeader() {
  const session = await auth()
  const role = session?.user.role

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          {brand.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {role === "WORKER" ? (
            <>
              <Link className={btnQuiet} href="/dashboard">
                My answers
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
                Pay Lightning
              </Link>
              <Link className={btnQuiet} href="/employer/upload">
                Upload
              </Link>
              <Link className={btnPrimary} href="/employer/evaluations/new">
                Get an answer checked
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
              <Link className={btnQuiet} href="/login">
                Log in
              </Link>
              <Link className={btnPrimary} href="/signup">
                I speak the language
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
