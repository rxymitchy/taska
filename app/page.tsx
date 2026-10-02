import Link from "next/link";
import { Container } from "@/components/ui";
import CheckDemo from "@/components/CheckDemo";
import { brand } from "@/lib/brand";
import { btnPrimary, btnSecondary } from "@/lib/styles";

const problem = [
  ["Is it true?", "A fluent answer can still have the wrong facts."],
  [
    "Does it sound natural?",
    "The words can be correct and still not how anyone talks.",
  ],
  [
    "Does it know the place?",
    "Like how people actually pay a bill with M-Pesa.",
  ],
];

const people = [
  [
    "Companies",
    "Ship AI that works for local customers, with proof that real speakers checked it.",
  ],
  [
    "Local speakers",
    "Earn from the language they speak. Paid in seconds, and their name stays private.",
  ],
  [
    "Reviewers",
    "Keep the checks honest and get paid for each approved answer.",
  ],
  [
    "People using AI",
    "Get answers that are right, natural and made for where they live.",
  ],
];

const steps = [
  ["A company shares an AI answer", "In any African language."],
  ["A local speaker checks it", "If it’s wrong, they write a better answer."],
  ["A reviewer double-checks", "To make sure the check is right."],
  ["The company gets the result", "Checked by real people."],
];

const split = [
  ["Speaker", 500, "bg-accent"],
  ["Reviewer", 400, "bg-accent/50"],
  ["Taska fee (2%)", 18, "bg-muted"],
] as const;

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-line">
        <Container className="grid items-start gap-12 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="lg:pt-6">
            <h1 className="max-w-xl text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              {brand.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {brand.support}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className={btnPrimary} href="#demo">
                Try it now
              </a>
              <Link className={btnSecondary} href="/login">
                Log in with a demo account
              </Link>
            </div>
          </div>

          <div id="demo" className="scroll-mt-24">
            <CheckDemo />
          </div>
        </Container>
      </section>

      {/* THE PROBLEM */}
      <section className="border-b border-line">
        <Container className="grid gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <h2 className="max-w-xl text-3xl tracking-tight sm:text-4xl">
              AI can sound fluent in your language and still get it wrong
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              Companies are putting AI in front of customers who speak African
              languages. Without a local speaker checking the answers, mistakes
              go unnoticed until a customer runs into them. Taska asks three
              questions of every answer.
            </p>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {problem.map(([title, copy]) => (
              <li key={title} className="py-4">
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-1 text-muted">{copy}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* WHO WE HELP */}
      <section className="border-b border-line">
        <Container className="py-14 lg:py-16">
          <h2 className="max-w-xl text-3xl tracking-tight sm:text-4xl">
            Who Taska helps
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {people.map(([title, copy]) => (
              <li key={title} className="border-t-2 border-accent pt-5">
                <h3 className="text-lg font-medium leading-snug">{title}</h3>
                <p className="mt-2 text-muted">{copy}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-line">
        <Container className="py-14 lg:py-16">
          <h2 className="max-w-xl text-3xl tracking-tight sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, copy], index) => (
              <li key={title}>
                <span className="font-display text-3xl text-accent">
                  {index + 1}
                </span>
                <p className="mt-2 text-lg font-medium leading-snug">{title}</p>
                <p className="mt-1 text-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* GETTING PAID + NUMBERS */}
      <section className="border-b border-line">
        <Container className="py-14 lg:py-16">
          <h2 className="max-w-xl text-3xl tracking-tight sm:text-4xl">
            Every approved answer pays people instantly
          </h2>
          <div className="mt-8 max-w-3xl">
            <div
              className="flex h-5 w-full gap-1 overflow-hidden rounded-full"
              role="img"
              aria-label="Payment split: speaker 500 sats, reviewer 400 sats, Taska 18 sats"
            >
              {split.map(([label, sats, color]) => (
                <div
                  key={label}
                  className={`${color} rounded-full`}
                  style={{ flexGrow: sats, flexBasis: 0 }}
                />
              ))}
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              {split.map(([label, sats, color]) => (
                <div key={label} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-3 w-3 rounded-full ${color}`}
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-2xl font-medium">{sats} sats</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-muted">
              Paid over Bitcoin Lightning, with no minimum balance. Taska never
              holds anyone’s money, and rejected work is not charged.
            </p>
          </div>
        </Container>
      </section>

      {/* CLOSING */}
      <section>
        <Container className="py-14 lg:py-16">
          <h2 className="max-w-xl text-3xl tracking-tight sm:text-4xl">
            See the real thing in two minutes
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className={btnPrimary} href="/login">
              Log in with a demo account
            </Link>
            <Link
              className={btnSecondary}
              href="/login?callbackUrl=/employer/evaluations/new"
            >
              Get an AI answer checked
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
