import { decideEvaluation } from "@/app/actions/evaluations"
import { AiHumanComparison } from "@/components/ai-human-comparison"
import { Container } from "@/components/ui"
import { btnPrimary, btnSecondary } from "@/lib/styles"

type Evaluation = {
  id: string
  language: string
  context: string
  prompt: string
  aiResponse: string
  aiModel: string
  aiPrecheckFactuallyCorrect: boolean | null
  aiPrecheckLanguageNatural: boolean | null
  aiPrecheckUnderstandsContext: boolean | null
  aiPrecheckModel: string | null
  assignedWorker: { name: string } | null
}

type Answers = {
  factuallyCorrect: boolean
  languageNatural: boolean
  understandsContext: boolean
  comment: string
  betterAnswer: string
}

export function ReviewEvaluationView({
  evaluation,
  answers,
  pay,
}: {
  evaluation: Evaluation
  answers: Answers
  pay?: string
}) {
  return (
    <Container className="page-frame max-w-2xl!">
      <p className="text-sm text-muted">
        {evaluation.language} · {evaluation.context}
        {evaluation.assignedWorker ? ` · ${evaluation.assignedWorker.name}` : ""}
      </p>
      <h1 className="mt-2 text-3xl tracking-tight">Does this check hold?</h1>
      {pay === "need-address" ? (
        <p className="mt-4 rounded-md border border-line bg-card px-3 py-2 text-sm">
          They need a real pay address on their profile, and so do you, before anyone gets paid.
        </p>
      ) : null}
      <section className="content-surface mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Question</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.prompt}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">AI response</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.aiResponse}</p>
          <p className="mt-1 text-sm text-muted">Model: {evaluation.aiModel}</p>
        </div>
        <AiHumanComparison
          ai={{
            factuallyCorrect: evaluation.aiPrecheckFactuallyCorrect,
            languageNatural: evaluation.aiPrecheckLanguageNatural,
            understandsContext: evaluation.aiPrecheckUnderstandsContext,
            model: evaluation.aiPrecheckModel,
          }}
          human={{
            factuallyCorrect: answers.factuallyCorrect,
            languageNatural: answers.languageNatural,
            understandsContext: answers.understandsContext,
          }}
        />
        {answers.comment ? <p className="text-sm text-muted">{answers.comment}</p> : null}
        {answers.betterAnswer ? (
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Evaluator’s better answer</h2>
            <p className="mt-1 whitespace-pre-wrap">{answers.betterAnswer}</p>
          </div>
        ) : null}
      </section>
      <form action={decideEvaluation} className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="evaluationId" value={evaluation.id} />
        <button className={btnPrimary} name="decision" value="approve">
          Agree — they get paid
        </button>
        <button className={btnSecondary} name="decision" value="reject">
          Send it back
        </button>
      </form>
    </Container>
  )
}
