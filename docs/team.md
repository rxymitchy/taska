# Team modules

Taska checks whether an AI response works for an African language and a local context.

The shared core is finished and must keep working while each module is built:

```
Company creates evaluation → Pending → Assigned → Evaluator submits → Worker completed
→ Under review → Reviewer approves → Approved → Completed (validated)
→ Lightning payouts recorded as Pending
```

Reviewer rejection sets the evaluation back to Assigned. The evaluator edits the answers and submits again.

## Rules for every module

- Do not add or rename values in `EvaluationStatus`. Change the status only in `app/actions/evaluations.ts`.
- Each module has one entry file under `services/`. Keep its exported function name and argument shape unless the whole team agrees.
- The placeholder in each file works today. Replace its body. Do not delete the call site.
- A new table needs its own Prisma migration. Do not edit `20260929180000_evaluations`.
- Run `npx tsc --noEmit` and the demo below before opening a pull request.

## Demo

Password for every account: `demo1234`.

1. Log in as the company, `employer@taska.demo`. Open **New evaluation** and submit a Swahili, Kenya / M-Pesa response.
2. Log in as the evaluator, `worker@taska.demo`. Open **My evaluations** and answer the three questions. Answering No to any of them makes the **Better answer** box appear, and it must be filled in. Submit.
3. Log in as the reviewer, `admin@taska.demo`. Open **Review queue**, then approve.
4. Log in as the company again. The evaluation shows **Validated** with the answers.
5. The evaluator and reviewer screens show **Lightning — Pending**.

`npm run db:seed` also creates one Swahili evaluation already assigned to the evaluator.

## Core files

| File | What it owns |
| --- | --- |
| `prisma/schema.prisma` | `Evaluation`, `EvaluationSubmission`, `EvaluationPayout`, `EvaluationStatus` |
| `app/actions/evaluations.ts` | `createEvaluation`, `submitHumanEvaluation`, `decideEvaluation`, every status change |
| `app/employer/evaluations/` | Company form and result page |
| `app/dashboard/` | Evaluator list and form |
| `app/admin/` | Review queue and approve or reject |

---

## A. Lightning payouts

**File:** `services/settlement/index.ts`, function `recordPendingLightningPayouts`

**Input:** `{ evaluationId, workerUserId, reviewerUserId }`, sent after a reviewer approves.

**Processing:** create and pay a Lightning invoice for the evaluator and for the reviewer. Store the payment hash. Retry without paying twice.

**Output:** each `EvaluationPayout` row moves from `PENDING` to `SENT` or `FAILED`.

**Connects:** `decideEvaluation` calls this after the evaluation becomes `COMPLETED`. The existing `services/lightning` provider interface can be reused.

A failed payment must not undo the validated evaluation. Keys stay in server environment variables. Do not hold user funds.

## B. Evaluator assignment

**File:** `services/assignment/index.ts`, functions `pickEvaluator` and `assignEvaluation`

**Input:** a new evaluation's id, language, and context.

**Processing:** choose an evaluator by language, availability, and current workload. Never give one evaluation to two people.

**Output:** a `WorkerProfile` id, or `null` to leave the evaluation `PENDING` until someone is free.

**Connects:** `createEvaluation` calls `assignEvaluation` right after the row is created. The placeholder assigns everything to the demo evaluator.

Keep the conditional update in `assignEvaluation`. It is what stops two requests from claiming the same evaluation.

## C. Multiple evaluators and agreement

**File:** `services/consensus/index.ts`, function `shouldEnterReview`

**Input:** how many evaluator answers exist. Widen this to the submissions themselves when you need to compare answers.

**Processing:** decide whether enough evaluators have answered. Compare their yes/no answers and flag disagreement for the reviewer.

**Output:** `true` when the evaluation should go to the review queue.

**Connects:** `submitHumanEvaluation` calls it after saving answers. Returning `true` for one submission keeps the single-evaluator demo working.

Each evaluator's answers are already separate `EvaluationSubmission` rows. Assigning more than one evaluator also needs a change from module B.

## D. AI model responses

**File:** `services/ai/index.ts`, function `generateAiResponse`

**Input:** `{ prompt, language, context }`

**Processing:** call a model provider, handle timeouts and errors, and choose the model.

**Output:** the response text, or `null` when the company should paste one.

**Connects:** beside `createEvaluation`, before the evaluation is stored. The company form must keep a manual response field so an API outage does not block evaluation.

Keep API keys on the server. Store which model produced a response if the report needs it.

## E. Company report

**File:** `services/reports/index.ts`, function `buildCompanyReport`

**Input:** one evaluation with its submissions.

**Processing:** turn the validated answers into a result the company can use: correctness, naturalness, local context, the evaluator's better answer, comments, and agreement once module C exists.

**Output:** `CompanyReport`

**Connects:** `app/employer/evaluations/[id]/page.tsx`. Add fields to `CompanyReport` rather than querying from the page.

Only report as validated when the status is `COMPLETED`.

## F. Permissions and database hardening

**Files:** `lib/session.ts`, the `layout.tsx` in each role folder, `app/actions/evaluations.ts`, `prisma/schema.prisma`

**Input:** the signed-in user and role.

**Processing:** confirm each person can only read and change their own data. Tighten database constraints and input validation.

**Output:** tests or checks that block the wrong role.

**Connects:** roles and route guards already exist. `requireRole` protects each area, and each page checks ownership. Extend those checks rather than adding another auth system.

Start with these:

- A company can open only its own evaluation. It must not see another company's rows.
- An evaluator can submit only an evaluation assigned to them.
- Only a reviewer can approve or reject.
- Reviewer accounts cannot be created from signup today.
