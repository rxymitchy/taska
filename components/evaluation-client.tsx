"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { submitEvaluation, type SubmitState } from "@/app/actions/tasks"
import { choiceLabels } from "@/lib/styles"
import { formatSats, formatUsd } from "@/lib/money"
import { btnPrimary, inputClass } from "@/lib/styles"

type Item = {
  id: string
  prompt: string
  responseA: string
  responseB: string
}

type EvaluationResult = Extract<SubmitState, { result: unknown }>["result"]

export function EvaluationClient({
  item,
  initialResult = null,
}: {
  item: Item | null
  initialResult?: EvaluationResult | null
}) {
  const [choice, setChoice] = useState<string>("")
  const [error, setError] = useState("")
  const [result, setResult] = useState<EvaluationResult | null>(initialResult)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setError("")
    startTransition(async () => {
      const response = await submitEvaluation(formData)
      if (response.error || !response.result) setError(response.error ?? "Submission failed.")
      else setResult(response.result)
    })
  }

  if (result) return <ResultSequence result={result} />
  if (!item) {
    return <p className="text-muted">You do not have an open assignment.</p>
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <input type="hidden" name="taskItemId" value={item.id} />
      <section className="rounded-lg border border-line bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Question</p>
        <p className="mt-2 text-base leading-relaxed">{item.prompt}</p>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        <ResponseCard title="Response A" body={item.responseA} selected={choice === "A"} onSelect={() => setChoice("A")} />
        <ResponseCard title="Response B" body={item.responseB} selected={choice === "B"} onSelect={() => setChoice("B")} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Which response is more helpful, accurate, and relevant?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(choiceLabels) as Array<keyof typeof choiceLabels>).map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm ${choice === key ? "border-2 border-accent bg-tint" : "border-line bg-card"}`}
            >
              <input
                type="radio"
                name="choice"
                value={key}
                checked={choice === key}
                onChange={() => setChoice(key)}
                required
              />
              {choiceLabels[key]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Reason (optional)</span>
        <textarea className={inputClass} name="reason" rows={3} maxLength={500} placeholder="A short note on why" />
      </label>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  )
}

function ResponseCard({
  title,
  body,
  selected,
  onSelect,
}: {
  title: string
  body: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg p-5 text-left transition ${selected ? "border-2 border-accent bg-card shadow-[0_20px_40px_-28px_rgba(15,42,32,.4)]" : "border border-line bg-card hover:border-accent/50"}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{body}</p>
    </button>
  )
}

function ResultSequence({
  result,
}: {
  result: {
    status: "APPROVED" | "PENDING"
    qualityScore: number | null
    amountSats: number
    paymentHash: string | null
    taskTitle: string
  }
}) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [700, 1600, 2500].map((delay, index) =>
      setTimeout(() => setStep(index + 1), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const approved = result.status === "APPROVED"
  const lines = [
    "Submission received",
    approved ? "Checking quality" : "Waiting for review",
    approved ? "Task approved" : "A reviewer will approve or reject this work",
  ]

  return (
    <section className="rounded-lg border border-line bg-card p-6">
      <ol className="space-y-3">
        {lines.map((line, index) => (
          <li key={line} className={index <= step ? "text-ink" : "text-muted"}>
            <span className="mr-2 text-sm text-muted">{index + 1}</span>
            {line}
            {index === 2 && approved && result.qualityScore != null && step >= 2 ? (
              <span className="mt-1 block pl-6 text-sm text-muted">Quality score {result.qualityScore}</span>
            ) : null}
          </li>
        ))}
      </ol>
      {approved && step >= 3 ? (
        <div className="mt-6 border-t border-line pt-6">
          <p className="inline-flex rounded-md bg-hl px-3 py-1 font-display text-4xl tracking-tight text-ink">+{formatSats(result.amountSats)}</p>
          <p className="mt-1 text-muted">≈ {formatUsd(result.amountSats)}</p>
          <p className="mt-4 text-sm">Payment sent</p>
          <p className="text-sm text-muted">Paid via Lightning</p>
          {result.paymentHash ? (
            <p className="mt-2 font-mono text-xs text-muted">
              {result.paymentHash.slice(0, 16)}…
            </p>
          ) : null}
          <Link className="mt-6 inline-flex text-sm font-semibold text-accent" href="/dashboard">
            View earnings
          </Link>
        </div>
      ) : null}
      {!approved && step >= 3 ? (
        <p className="mt-6 text-sm text-muted">
          You are paid only after approval. Rejected work is not paid.
        </p>
      ) : null}
    </section>
  )
}
