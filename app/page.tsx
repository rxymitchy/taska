import Link from "next/link"
import { Container } from "@/components/ui"
import { brand } from "@/lib/brand"
import { portraitFor } from "@/lib/portraits"
import { prisma } from "@/lib/prisma"
import { btnPrimary, btnSecondary } from "@/lib/styles"

const workerSteps = ["Find a task", "Complete it", "Get paid"]
const businessSteps = ["Post a task", "Review submissions", "Pay workers"]
const examples = [
  ["AI evaluation", "Compare answers and flag the one that is more useful."],
  ["Data labeling", "Classify images, text, or short records."],
  ["Research", "Check a local fact and write down what you found."],
  ["Transcription", "Turn a short clip into text."],
  ["Verification", "Confirm that a listing or claim matches the source."],
]

type ShowcaseWorker = {
  id: string
  name: string
  country: string
  bio: string | null
  skills: string[]
  languages: string[]
  tasksCompleted: number
  approvalRate: number
}

function rateLabel(worker: ShowcaseWorker) {
  if (worker.tasksCompleted === 0) return `${worker.tasksCompleted} tasks completed`
  return `${worker.tasksCompleted} tasks completed · ${Math.round(worker.approvalRate)}% approval`
}

export default async function HomePage() {
  let workers: ShowcaseWorker[] = []
  try {
    workers = await prisma.workerProfile.findMany({
      orderBy: { tasksCompleted: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        country: true,
        bio: true,
        skills: true,
        languages: true,
        tasksCompleted: true,
        approvalRate: true,
      },
    })
  } catch {
    workers = []
  }

  const featured = workers.find((worker) => worker.name === "Rita Mwangi") ?? workers[0]
  const others = featured ? workers.filter((worker) => worker.id !== featured.id) : []

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">{brand.tagline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{brand.support}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href="/tasks">
                Find Tasks
              </Link>
              <Link className={btnSecondary} href="/login?callbackUrl=/employer/tasks/new">
                Post a Task
              </Link>
            </div>
          </div>
          <figure>
            <img
              src="/images/hero-work.png"
              alt="A worker reviewing a task on a laptop beside a bright window"
              className="aspect-[16/10] w-full rounded-2xl object-cover"
            />
            {featured ? (
              <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                <span className="font-medium">
                  {featured.name} · {featured.country}
                </span>
                <span className="text-muted">{rateLabel(featured)}</span>
              </figcaption>
            ) : null}
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h2 className="text-2xl tracking-tight">How it works for workers</h2>
              <ol className="mt-6 space-y-4">
                {workerSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-display text-2xl text-accent">{index + 1}</span>
                    <span className="pt-1 text-lg">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-2xl tracking-tight">How it works for businesses</h2>
              <ol className="mt-6 space-y-4">
                {businessSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-display text-2xl text-accent">{index + 1}</span>
                    <span className="pt-1 text-lg">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <figure>
            <img
              src="/images/review-desk.png"
              alt="A laptop on a desk with two columns of text ready for review"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-3 text-sm text-muted">
              Compare two answers. A few minutes of careful reading.
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Built for small digital work</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {examples.map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-line bg-card p-4">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Why Lightning?</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Small tasks often mean small payments. Lightning lets workers receive those payments quickly across borders.
          </p>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">For African talent</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Country is part of a profile. Language is separate. The same payment rail works across the continent.
          </p>
          {featured ? (
            <Link
              href={`/workers/${featured.id}`}
              className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-card transition hover:border-ink/20 md:grid-cols-[240px_1fr]"
            >
              <Portrait name={featured.name} className="h-72 w-full object-cover object-top md:h-full" />
              <div className="p-6 sm:p-8">
                <p className="text-sm font-medium text-accent">{featured.country}</p>
                <h3 className="mt-1 text-3xl tracking-tight">{featured.name}</h3>
                {featured.bio ? <p className="mt-4 max-w-xl leading-relaxed text-muted">{featured.bio}</p> : null}
                <p className="mt-4 text-sm">{featured.skills.slice(0, 3).join(" · ")}</p>
                <p className="mt-3 text-sm">{rateLabel(featured)}</p>
                <p className="mt-1 text-sm text-muted">{featured.languages.join(" · ")}</p>
              </div>
            </Link>
          ) : null}
          {others.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {others.map((worker) => (
                <Link
                  key={worker.id}
                  href={`/workers/${worker.id}`}
                  className="overflow-hidden rounded-2xl border border-line bg-card transition hover:border-ink/20"
                >
                  <Portrait name={worker.name} className="aspect-[3/4] w-full object-cover object-top" />
                  <div className="p-4">
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-muted">{worker.country}</p>
                    <p className="mt-3 text-sm">{worker.skills.slice(0, 2).join(" · ")}</p>
                    <p className="mt-2 text-sm text-muted">{rateLabel(worker)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <h2 className="max-w-2xl text-2xl tracking-tight">Built for the future of distributed work</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            The long-term aim is a work platform that connects global businesses with African digital talent, starting with AI and data microtasks and growing into research, testing, and longer projects. Reputation comes from work that was actually completed and approved.
          </p>
        </Container>
      </section>
    </>
  )
}

function Portrait({ name, className }: { name: string; className: string }) {
  const src = portraitFor(name)
  if (!src) {
    return <div className={`bg-line ${className}`} aria-hidden />
  }
  return <img src={src} alt="" className={className} />
}
