"use client";

import { useEffect, useState } from "react";
import { btnPrimary, btnSecondary } from "@/lib/styles";

type Language = {
  id: string;
  code: string;
  name: string;
  region: string;
  country: string;
  rtl?: boolean;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  risk: string;
  look: string;
};

const languages: Language[] = [
  {
    id: "sw",
    code: "sw",
    name: "Swahili",
    region: "East Africa",
    country: "Kenya",
    question: "Ninaweza kutumia M-Pesa kulipa bili hii?",
    questionEn: "Can I pay this bill with M-Pesa?",
    answer: "Ndiyo, unaweza kutumia M-Pesa kulipa bili yako…",
    answerEn: "Yes, you can pay your bill with M-Pesa…",
    risk: "If the steps don’t match how M-Pesa really works, a customer could pay the wrong way and the company would never know.",
    look: "Does it match how people really pay with M-Pesa?",
  },
  {
    id: "yo",
    code: "yo",
    name: "Yoruba",
    region: "West Africa",
    country: "Nigeria",
    question: "Báwo ni, ṣé o wà dáadáa?",
    questionEn: "Hello, are you well?",
    answer: "Mo wà dáadáa, ẹ ṣé. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́?",
    answerEn: "I’m well, thank you. How can I help you?",
    risk: "A greeting with the wrong level of respect makes a customer feel they are talking to a machine.",
    look: "Would a Yoruba speaker greet like this, with the same level of respect throughout?",
  },
  {
    id: "tw",
    code: "tw",
    name: "Twi",
    region: "West Africa",
    country: "Ghana",
    question: "Metumi de mobile money atua saa bill yi anaa?",
    questionEn: "Can I pay this bill with mobile money?",
    answer: "Aane, wobɛtumi de mobile money atua wo bill no…",
    answerEn: "Yes, you can pay your bill with mobile money…",
    risk: "Awkward wording, or missing how mobile money works in Ghana, leaves people confused about how to pay.",
    look: "Does it sound like how people in Ghana really talk about mobile money?",
  },
  {
    id: "zu",
    code: "zu",
    name: "isiZulu",
    region: "Southern Africa",
    country: "South Africa",
    question: "Ngingakhokha kanjani ibhili?",
    questionEn: "How can I pay the bill?",
    answer: "Ungakhokha ngocingo lwakho noma ebhange…",
    answerEn: "You can pay with your phone or at the bank…",
    risk: "Stiff or wrong wording can send a customer to the wrong place to pay.",
    look: "Is this how people say it, and does it name the ways they actually pay?",
  },
  {
    id: "ar",
    code: "ar",
    name: "Arabic",
    region: "North Africa",
    country: "Egypt",
    rtl: true,
    question: "أقدر أدفع الفاتورة دي بالموبايل؟",
    questionEn: "Can I pay this bill by mobile?",
    answer: "نعم، يمكنك دفع فاتورتك عبر الهاتف المحمول…",
    answerEn: "Yes, you can pay your bill through your mobile phone…",
    risk: "The customer wrote in everyday Egyptian Arabic and got formal textbook Arabic back. Correct, but cold.",
    look: "Is this how someone in Cairo would answer?",
  },
];

const checks = [
  "Is it true?",
  "Does it sound natural?",
  "Does it know the place?",
] as const;

const split = [
  ["Speaker", 500, "bg-accent"],
  ["Reviewer", 400, "bg-accent/50"],
  ["Taska fee (2%)", 18, "bg-muted"],
] as const;

const phases = [
  { label: "The problem", bar: "border-red-500", text: "text-red-500" },
  {
    label: "The complication",
    bar: "border-amber-500",
    text: "text-amber-500",
  },
  { label: "The solution", bar: "border-accent", text: "text-accent" },
] as const;

type Answer = boolean | null;
type Review = "approved" | "rejected" | null;

export default function CheckDemo() {
  const [langIndex, setLangIndex] = useState(0);
  const [step, setStep] = useState(0); // 0 problem, 1 complication, 2 speaker, 3 reviewer, 4 result
  const [answers, setAnswers] = useState<Answer[]>([null, null, null]);
  const [better, setBetter] = useState("");
  const [review, setReview] = useState<Review>(null);
  const [paid, setPaid] = useState(false);

  const lang = languages[langIndex];
  const phase = step === 0 ? 0 : step === 1 ? 1 : 2;
  const allAnswered = answers.every((a) => a !== null);
  const needsBetter = answers.some((a) => a === false);

  // Let the payout bar grow after it appears.
  useEffect(() => {
    if (review !== "approved") {
      return;
    }

    const t = setTimeout(() => setPaid(true), 80);
    return () => clearTimeout(t);
  }, [review]);

  function resetTo(index: number) {
    setLangIndex(index);
    setStep(0);
    setAnswers([null, null, null]);
    setBetter("");
    setPaid(false);
    setReview(null);
  }

  function setAnswer(index: number, value: boolean) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  function decide(result: Exclude<Review, null>) {
    setPaid(false);
    setReview(result);
    setStep(4);
  }

  return (
    <article
      aria-label="Interactive demo"
      className="overflow-hidden rounded-2xl border border-line bg-card shadow-xl"
    >
      {/* Phase header */}
      <ol
        className="grid grid-cols-3 gap-2 border-b border-line p-5 pb-4 sm:px-6"
        aria-label="Progress"
      >
        {phases.map((p, i) => (
          <li
            key={p.label}
            aria-current={phase === i ? "step" : undefined}
            className={`border-t-4 pt-2 text-sm font-medium ${
              phase >= i
                ? `${p.bar} ${phase === i ? p.text : "text-muted"}`
                : "border-line text-muted"
            }`}
          >
            {p.label}
          </li>
        ))}
      </ol>

      <div className="space-y-5 p-5 sm:p-6">
        {/* Language choice */}
        <div>
          <div
            role="group"
            aria-label="Choose a language"
            className="flex flex-wrap gap-2"
          >
            {languages.map((l, i) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={i === langIndex}
                onClick={() => resetTo(i)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  i === langIndex
                    ? "border-accent bg-accent text-white"
                    : "border-line text-muted hover:text-foreground"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">
            {lang.region}, {lang.country}
          </p>
        </div>

        {/* The conversation */}
        <div className="space-y-3">
          <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-background px-4 py-3">
            <p className="text-xs text-muted">Customer</p>
            <p
              lang={lang.code}
              dir={lang.rtl ? "rtl" : undefined}
              className="mt-1 text-lg"
            >
              {lang.question}
            </p>
            <p className="text-sm text-muted">{lang.questionEn}</p>
          </div>
          <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm border border-accent/40 bg-accent/10 px-4 py-3">
            <p className="text-xs text-muted">AI answer</p>
            <p
              lang={lang.code}
              dir={lang.rtl ? "rtl" : undefined}
              className="mt-1 text-lg"
            >
              {lang.answer}
            </p>
            <p className="text-sm text-muted">{lang.answerEn}</p>
          </div>
        </div>

        <div aria-live="polite">
          {/* 1. The problem */}
          {step === 0 && (
            <div>
              <p className="text-xl font-medium leading-snug">
                It sounds fluent. But would a local trust it?
              </p>
              <p className="mt-2 text-muted">
                AI answers can read perfectly and still miss how people really
                speak and live.
              </p>
              <button
                type="button"
                className={`${btnPrimary} mt-4`}
                onClick={() => setStep(1)}
              >
                See what could go wrong
              </button>
            </div>
          )}

          {/* 2. The complication */}
          {step === 1 && (
            <div>
              <p className="text-xl font-medium leading-snug">
                Nobody at the company can tell.
              </p>
              <p className="mt-2 text-muted">
                The AI can’t hear what’s off, and the company can’t read the
                language. The customer just feels it.
              </p>
              <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                {lang.risk}
              </p>
              <button
                type="button"
                className={`${btnPrimary} mt-4`}
                onClick={() => setStep(2)}
              >
                See how Taska fixes it
              </button>
            </div>
          )}

          {/* 3a. The solution: speaker checks */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xl font-medium leading-snug">
                  A local speaker checks it. You’re the speaker now.
                </p>
                <p className="mt-1 text-sm text-muted">Look for: {lang.look}</p>
              </div>
              <ul className="space-y-2">
                {checks.map((q, i) => (
                  <li
                    key={q}
                    className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2"
                  >
                    <span>{q}</span>
                    <span className="flex gap-1">
                      {[false, true].map((value) => (
                        <button
                          key={String(value)}
                          type="button"
                          aria-pressed={answers[i] === value}
                          onClick={() => setAnswer(i, value)}
                          className={`rounded-md border px-3 py-1 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                            answers[i] === value
                              ? "border-accent bg-accent text-white"
                              : "border-line text-muted hover:text-foreground"
                          }`}
                        >
                          {value ? "Yes" : "No"}
                        </button>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>

              {needsBetter && (
                <label className="block text-sm">
                  <span className="text-muted">
                    Something is off. Write a better answer (optional in this
                    demo)
                  </span>
                  <textarea
                    rows={2}
                    value={better}
                    onChange={(e) => setBetter(e.target.value)}
                    lang={lang.code}
                    dir={lang.rtl ? "rtl" : undefined}
                    className="mt-2 w-full rounded-lg border border-line bg-background p-3 text-base"
                    placeholder="Type your answer here"
                  />
                </label>
              )}

              <button
                type="button"
                className={btnPrimary}
                disabled={!allAnswered}
                onClick={() => setStep(3)}
              >
                Send to reviewer
              </button>
            </div>
          )}

          {/* 3b. The solution: reviewer decides */}
          {step === 3 && (
            <div>
              <p className="text-xl font-medium leading-snug">
                A reviewer double-checks. You’re the reviewer now.
              </p>
              <p className="mt-2 text-muted">
                The speaker marked {answers.filter(Boolean).length} of 3 checks
                as yes
                {needsBetter ? " and wrote a better answer." : "."} Is the check
                right?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => decide("approved")}
                >
                  Approve and pay
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => decide("rejected")}
                >
                  Send back
                </button>
              </div>
            </div>
          )}

          {/* 3c. The solution: what the company gets */}
          {step === 4 && (
            <div>
              {review === "approved" ? (
                <>
                  <p className="text-xl font-medium leading-snug">
                    Checked, reviewed and paid in seconds.
                  </p>

                  <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
                    <p className="font-medium">What the company receives</p>
                    <ul className="mt-2 space-y-1">
                      {checks.map((q, i) => (
                        <li key={q} className="flex justify-between gap-3">
                          <span>{q}</span>
                          <span
                            className={
                              answers[i] ? "text-accent" : "text-amber-500"
                            }
                          >
                            {answers[i] ? "Yes" : "Needs work"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {better.trim() && (
                      <p
                        lang={lang.code}
                        dir={lang.rtl ? "rtl" : undefined}
                        className="mt-3 border-t border-line pt-3"
                      >
                        <span className="text-muted">Better answer: </span>
                        {better}
                      </p>
                    )}
                    <p className="mt-3 text-muted">
                      Checked by a local {lang.name} speaker in {lang.country}.
                    </p>
                  </div>

                  <div className="mt-5 flex h-4 w-full gap-1 overflow-hidden rounded-full">
                    {split.map(([label, sats, color]) => (
                      <div
                        key={label}
                        className={`${color} rounded-full transition-[flex-grow] duration-700 motion-reduce:transition-none`}
                        style={{ flexGrow: paid ? sats : 0, flexBasis: 0 }}
                      />
                    ))}
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    {split.map(([label, sats]) => (
                      <div key={label}>
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-xl font-medium">{sats} sats</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-sm text-muted">
                    Paid over Bitcoin Lightning.
                  </p>

                  <button
                    type="button"
                    className={`${btnPrimary} mt-5`}
                    onClick={() => resetTo((langIndex + 1) % languages.length)}
                  >
                    Try another language
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xl font-medium leading-snug">
                    Sent back to the speaker
                  </p>
                  <p className="mt-2 text-muted">
                    Rejected work is not charged and nobody is paid for it.
                  </p>
                  <button
                    type="button"
                    className={`${btnSecondary} mt-5`}
                    onClick={() => resetTo(langIndex)}
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
