"use client"

import { startTransition, useActionState, useState } from "react"
import { submitHumanEvaluation } from "@/app/actions/evaluations"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const questions = [
  ["factuallyCorrect", "Is the response factually correct?"],
  ["languageNatural", "Does the language sound natural?"],
  ["understandsContext", "Does it understand the local context?"],
] as const

type QuestionName = (typeof questions)[number][0]
type Answer = "yes" | "no" | ""

export function HumanEvaluationForm({
  evaluationId,
  defaults,
}: {
  evaluationId: string
  defaults?: {
    factuallyCorrect: boolean
    languageNatural: boolean
    understandsContext: boolean
    betterAnswer: string
    comment: string
  }
}) {
  const [state, action, pending] = useActionState(submitHumanEvaluation, { error: "" })
  const [answers, setAnswers] = useState<Record<QuestionName, Answer>>(() => ({
    factuallyCorrect: defaults ? (defaults.factuallyCorrect ? "yes" : "no") : "",
    languageNatural: defaults ? (defaults.languageNatural ? "yes" : "no") : "",
    understandsContext: defaults ? (defaults.understandsContext ? "yes" : "no") : "",
  }))
  const anyNo = Object.values(answers).includes("no")

  return (
    // Not action={...}: React resets the form after an action, which would wipe the answers on a server error.
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => action(formData))
      }}
    >
      <input type="hidden" name="evaluationId" value={evaluationId} />
      {questions.map(([name, label]) => (
        <fieldset key={name} className="space-y-2">
          <legend className={labelClass}>{label}</legend>
          {(["yes", "no"] as const).map((value) => (
            <label key={value} className="mr-4 inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={name}
                value={value}
                required
                checked={answers[name] === value}
                onChange={() => setAnswers((current) => ({ ...current, [name]: value }))}
              />
              {value === "yes" ? "Yes" : "No"}
            </label>
          ))}
        </fieldset>
      ))}
      {anyNo ? (
        <label className="block space-y-1.5">
          <span className={labelClass}>Better answer</span>
          <span className="block text-sm text-muted">Write how a local person would answer the question.</span>
          <textarea
            className={inputClass}
            name="betterAnswer"
            rows={4}
            required
            minLength={4}
            maxLength={4000}
            defaultValue={defaults?.betterAnswer ?? ""}
          />
        </label>
      ) : null}
      <label className="block space-y-1.5">
        <span className={labelClass}>Comment, optional</span>
        <textarea className={inputClass} name="comment" rows={3} defaultValue={defaults?.comment ?? ""} />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit evaluation"}
      </button>
    </form>
  )
}
