import Link from "next/link"
import { Container } from "@/components/ui"
import { brand } from "@/lib/brand"
import { btnPrimary, btnSecondary } from "@/lib/styles"

const steps = [
  [
    "A company pays Lightning",
    "A real invoice. Bitcoin stays in the connected wallet (Alby Hub). Taska only records a credit so it can pay the speaker.",
  ],
  [
    "A local speaker checks the answer",
    "Three questions: is it true, would a neighbor say it this way, does it know the place — like how M-Pesa actually works.",
  ],
  [
    "A reviewer double-checks",
    "If they agree, the sats move. If not, the work comes back and nobody is charged.",
  ],
  [
    "The speaker is paid",
    "Straight to their Lightning address. Taska never stores wallet keys.",
  ],
]

const checks = [
  ["Would a neighbor follow this?", "Good grammar does not fix a wrong M-Pesa step."],
  ["Would a local person say it this way?", "Not textbook Swahili. How people actually talk."],
  ["Does it know the place?", "Kisumu is not a generic “Africa.” The answer has to work here."],
]

const rails = [
  [
    "Pay an invoice",
    "Companies fund work with Lightning. When Alby Hub is connected, that invoice is live bitcoin — not a screenshot.",
  ],
  [
    "Pay the speaker",
    "Rita gets 500 sats for an approved check. A reviewer gets 400 for that same check — they are the gate, and they do this across many items. Taska keeps 2%. There is no cash-out to shillings in the app.",
  ],
  [
    "Never hold the keys",
    "The seed stays in the Hub. Taska stores a credit balance and a Lightning address, not a wallet.",
  ],
]

const samples = [
  {
    language: "Swahili",
    place: "Kenya",
    question: "Ninaweza kutumia M-Pesa kulipa bili hii?",
    questionEn: "Can I pay this bill with M-Pesa?",
    answer: "Ndiyo, unaweza kutumia M-Pesa kulipa bili yako…",
    answerEn: "Yes, you can pay your bill with M-Pesa…",
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
            <p className="text-sm font-medium text-accent">{brand.kicker}</p>
            <h1 className="mt-3 max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">{brand.tagline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{brand.support}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={btnPrimary} href="/signup">
                I speak the language
              </Link>
              <Link className={btnSecondary} href="/login?callbackUrl=/employer/evaluations/new">
                Get an answer checked
              </Link>
            </div>
          </div>
          <figure>
            <img
              src="/images/hero-work.png"
              alt="Rita Mwangi checking a Swahili AI answer on a laptop"
              className="aspect-[16/10] w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-3 text-sm">
              <span className="font-medium">Rita Mwangi</span>
              <span className="text-muted"> · Kisumu · checks Swahili · paid in sats</span>
            </figcaption>
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl tracking-tight">How Rita gets paid</h2>
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
              alt="A laptop showing a Swahili answer ready for review"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </figure>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">What Rita actually checks</h2>
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

      <section className="border-b border-line">
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">A sentence someone might follow</h2>
          <p className="mt-2 max-w-2xl text-muted">
            This is the work. Not a dashboard. A real question in Swahili, Yoruba, or Twi — the kind a neighbor might act
            on.
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

      <section>
        <Container className="py-16">
          <h2 className="text-2xl tracking-tight">Lightning is in the loop, not a slide</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Taska is not a wallet. It is how Rita gets paid for catching a bad answer. Keys stay where they belong.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {rails.map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-line bg-card p-4">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
