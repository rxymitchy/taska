# Team modules

Taska checks whether an AI response works for an African language and a local context.

The shared core is finished and must keep working while each module is built:

```
Company creates evaluation → Pending → Assigned → Evaluator submits → Worker completed
→ Under review → Reviewer approves → Approved → Completed (validated)
→ Lightning payouts recorded as Sent (mock)
```

Reviewer rejection sets the evaluation back to Assigned. The evaluator edits the answers and submits again.

The README lists who builds what. This file explains how the three code modules connect to the core.

## Rules for every module

- Do not add or rename values in `EvaluationStatus`. Change the status only in `app/actions/evaluations.ts`.
- Each module has one entry file under `services/`. Keep its exported function name and argument shape unless the whole team agrees.
- The placeholder in each file works today. Replace its body. Do not delete the call site.
- A database change needs its own Prisma migration. Do not edit existing migrations.
- Run `npx tsc --noEmit` and the demo below before opening a pull request.

## Demo

Password for every account: `demo1234`.

1. Log in as the company, `employer@taska.demo`. Open **New evaluation** and submit a Swahili, Kenya / M-Pesa response.
2. Log in as the evaluator, `worker@taska.demo`. Open **My evaluations** and answer the three questions. Answering No to any of them makes the **Better answer** box appear, and it must be filled in. Submit.
3. Log in as the reviewer, `admin@taska.demo`. Open **Review queue**, then approve.
4. Log in as the company again. The evaluation shows **Validated** with the answers.
5. The evaluator and reviewer screens show **Lightning — Sent** and the sat amount.

`npm run db:seed` also creates one Swahili evaluation already assigned to the evaluator.

## Core files

| File | What it owns |
| --- | --- |
| `prisma/schema.prisma` | `Evaluation`, `EvaluationSubmission`, `EvaluationPayout`, `EvaluationStatus` |
| `app/actions/evaluations.ts` | `createEvaluation`, `submitHumanEvaluation`, `decideEvaluation`, every status change |
| `services/assignment/index.ts` | Gives each new evaluation to the demo evaluator |
| `app/employer/evaluations/` | Company form and result page |
| `app/dashboard/` | Evaluator list and form |
| `app/admin/` | Review queue and approve or reject |

---

## Lightning payouts (Backend Developer)

**File:** `services/settlement/index.ts`, function `recordPendingLightningPayouts`

**Input:** `{ evaluationId, workerUserId, reviewerUserId }`, sent after a reviewer approves.

**Processing:** create a Lightning invoice for the evaluator and for the reviewer, pay it, store the payment hash. Retry without paying twice. The default provider is mock.

**Output:** each `EvaluationPayout` row moves from `PENDING` to `SENT` or `FAILED`.

**Connects:** `decideEvaluation` calls this after the evaluation becomes `COMPLETED`. The existing `services/lightning` provider interface can be reused.

A failed payment must not undo the validated evaluation. Keys stay in server environment variables. Do not hold user funds. If a real payment is not safe to ship in time, keep the mock.

## AI model (AI/ML Developer)

**File:** `services/ai/index.ts`, function `generateAiResponse`

**Input:** `{ prompt, language, context }`

**Processing:** call `AI_API_KEY` / `AI_BASE_URL` when set. If they are missing or the call fails, return a local demo reply (`taska-local`).

**Output:** `{ text, model }`.

**Connects:** `createEvaluation` calls this when the company leaves the AI response blank. The paste field stays on the form.

The AI pre-check goes in this file too: the model answers the same three questions before the evaluator does. It needs a new column or table (with the backend developer), and the company and reviewer pages show it next to the human answers (with the frontend developer).

Keep API keys on the server. Store which model produced a response.

## Company report and export (Backend and Frontend)

**File:** `services/reports/index.ts`, function `buildCompanyReport`

**Input:** one evaluation with its submissions.

**Processing:** turn the validated answers into a result the company can use: correctness, naturalness, local context, the better answer, comments, and the AI pre-check once it exists.

**Output:** `CompanyReport`

**Connects:** `app/employer/evaluations/[id]/page.tsx`. Add fields to `CompanyReport` rather than querying from the page. CSV/JSON export should build its rows from `CompanyReport` too, so the page and the file always match.

Only report as validated when the status is `COMPLETED`.
