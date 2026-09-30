import Link from "next/link"
import { Container } from "@/components/ui"
import { brand } from "@/lib/brand"
import { btnPrimary, btnSecondary } from "@/lib/styles"

const steps = [
  [
    "A company sends an AI answer",
    "In your language — a greeting, slang, or how something actually works where you live.",
  ],
  [
    "You say if it sounds right",
    "If it is off, you write it the way people really talk. That is how the AI learns.",
  ],
  [
    "Someone double-checks",
    "If they agree, you get paid. If not, it comes back and nobody is charged.",
  ],
  [
    "The money is yours",
    "It goes out when the check is agreed. No waiting for a big balance. We never hold it.",
  ],
]

const checks = [
  ["Does the slang land?", "New words, greetings, and jokes change. The AI has to keep up."],
  ["Would someone from here say it this way?", "Not textbook. How people actually talk."],
  ["Does it know how things work here?", "Paying a bill, sending money, asking for help — the local way."],
]

const pay = [
  [
    "Even a little still pays",
    "You do not wait until it adds up to some big number. When the check is agreed, you get paid.",
  ],
  [
    "No minimum to take it out",
    "With apps like PayPal, small money sits there until you hit a threshold. Here the work pays as it goes.",
  ],
  [
    "Nobody can freeze your pay",
    "It goes to you, not into an account we can lock. A ban here cannot sit on what you already earned.",
  ],
]

const samples = [
  {
    language: "Swahili",
    place: "Kenya",
    question: "Niaje, uko poa?",
    questionEn: "Hey, you good?",
    answer: "Habari yako? Nina furaha kukuona. Uko vizuri?",
    answerEn: "How are you? I am pleased to see you. Are you well?",
  },
  {
    language: "Yoruba",
    place: "Nigeria",
    question: "Ṣé mo lè fi transfer san owó ìwé yìí?",
    questionEn: "Can I pay this school fee by bank transfer?",
    answer: "Bẹẹni. Lo àkọọ́lẹ̀ banki tó wà lórí ìwé náà…",
    answerEn: "Yes. Use the bank details on the bill…",
  },
  {
    language: "Twi",
    place: "Ghana",
    question: "Metumi de mobile money atua bill yi?",
    questionEn: "Can I pay this bill with mobile money?",
    answer: "Aane. Fa MoMo kɔ merchant number a ɛwɔ bill no so…",
    answerEn: "Yes. Send MoMo to the merchant number on the bill…",
  },
]

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">{brand.tagline}</h1>
            <p className="mt-5 max-w-xl text-xl leading-snug">{brand.kicker}</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{brand.support}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href="/signup">
                {brand.cta}
              </Link>
              <Link className={btnSecondary} href="/login?callbackUrl=/employer/evaluations/new">
                Check my AI
              </Link>
            </div>
          </div>
          <figure>
            <img
              src="/images/hero-work.png"
              alt="Someone checking whether an AI answer sounds right in their language"
              className="aspect-[16/10] w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-3 text-sm">
              <span className="font-medium">Rita Mwangi</span>
              <span className="text-muted"> · checks Swahili · gets paid</span>
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl tracking-tight">How it works</h2>
            <ol className="mt-6 space-y-5">
              {steps.map(([title, copy], index) => (
                <li key={title} className="flex gap-4">
                  <span className="font-display text-2xl text-accent">{index + 1}</span>
                  <span className="pt-1">
                    <span className="block text-lg">{title}</span>
                    <span className="text-muted">{copy}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <figure>
            <img
              src="/images/review-desk.png"
              alt="A laptop showing an answer ready to check"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Get paid as you go</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Small work still pays. You do not wait for a minimum. And the money is yours — not stuck in an account
            someone else can freeze.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pay.map(([title, copy]) => (
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
          <h2 className="text-2xl tracking-tight">What you actually check</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {checks.map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-line bg-card p-4">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">This is the kind of thing you check</h2>
          <p className="mt-2 max-w-2xl text-muted">
            A greeting. New slang. How you pay a bill. If the AI is off, you say so — and write it how people talk.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {samples.map((sample) => (
              <article key={sample.language} className="rounded-lg border border-line bg-card p-5">
                <p className="text-sm text-muted">
                  {sample.language} · {sample.place}
                </p>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">Question</p>
                  <p className="mt-1">{sample.question}</p>
                  <p className="text-sm text-muted">{sample.questionEn}</p>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">AI answer</p>
                  <p className="mt-1">{sample.answer}</p>
                  <p className="text-sm text-muted">{sample.answerEn}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
