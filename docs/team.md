# Team modules

Taska checks whether an AI response works for an African language and a local context.

The shared core is finished. Money, CSV upload, and reviewer invites use the same evaluation path. Full picture for teammates: the arrow diagrams in the README (**How the app works**).

```
Company credits → hold 714 sats → Pending → Assigned
  → Evaluator submits → Worker completed → Under review
  → Approve → Completed → spend credits → pay 500 + 200 Lightning
  → Reject  → Assigned  → return hold
```

Do not add a second status list. Change `EvaluationStatus` only in `app/actions/evaluations.ts`.

## Rules for every module

- Each module has one entry file under `services/`. Keep its exported function name and argument shape unless the whole team agrees.
- A database change needs its own Prisma migration. Do not edit existing migrations.
- Run `npx tsc --noEmit` and the demo below before opening a pull request.

## Demo

Password for every account: `demo1234`.

1. Log in as the company, `employer@taska.demo`. Credits are already loaded. Open **New evaluation** and submit a Swahili, Kenya / M-Pesa response (or **Upload** a CSV).
2. Log in as the evaluator, `worker@taska.demo`. Open **My evaluations** and answer the three questions. Answering No to any of them makes the **Better answer** box appear, and it must be filled in. Submit.
3. Log in as the reviewer, `admin@taska.demo`. Open **Review queue**, then approve. **Invite** is how new reviewers join.
4. Log in as the company again. The evaluation shows **Validated** with the answers.
5. The evaluator and reviewer screens show **Lightning — Sent** and the sat amount.

`npm run db:seed` also creates one Swahili evaluation already assigned to the evaluator.

## Core files

| File | What it owns |
| --- | --- |
| `prisma/schema.prisma` | Evaluations, credits, batches, reviewer invites, `EvaluationStatus` |
| `lib/pricing.ts` | 500 / 200 / 714 sats |
| `lib/credits.ts` | Hold, spend, refund, Lightning deposits |
| `app/actions/evaluations.ts` | `createEvaluation`, `submitHumanEvaluation`, `decideEvaluation`, every status change |
| `app/actions/upload.ts` | CSV/JSON → many evaluations |
| `app/actions/credits.ts` | Company Lightning invoices |
| `app/actions/invites.ts` | Reviewer invite links |
| `services/assignment/index.ts` | Gives each new evaluation to the demo evaluator |
| `app/employer/` | Company list, credits, upload, result page |
| `app/dashboard/` | Evaluator list and form |
| `app/admin/` | Review queue, invite, approve or reject |

---

## Lightning payouts (Backend Developer)

**File:** `services/settlement/index.ts`, function `recordPendingLightningPayouts`

**Input:** `{ evaluationId, workerUserId, reviewerUserId }`, sent after a reviewer approves.

**Processing:** pay the evaluator and reviewer Lightning addresses (LNURL-pay when live). Store the payment hash. Retry without paying twice. Mock unless `OPENNODE_API_KEY` is set. Company credits are spent in `lib/credits.ts` before this runs.

**Output:** each `EvaluationPayout` row moves from `PENDING` to `SENT` or `FAILED`.

**Connects:** `decideEvaluation` calls this after the evaluation becomes `COMPLETED`.

A failed payment must not undo the validated evaluation. Keys stay in server environment variables. Open work: retry `FAILED` payouts without paying twice.

## AI model (AI/ML Developer)

**File:** `services/ai/index.ts`, function `generateAiResponse`

**Input:** `{ prompt, language, context }`

**Processing:** call `AI_API_KEY` / `AI_BASE_URL` when set. If they are missing or the call fails, return a local demo reply (`taska-local`).

**Output:** `{ text, model }`.

**Connects:** `createEvaluation` and CSV upload call this when the AI response is blank. The paste field stays on the form.

The AI pre-check goes in this file too: the model answers the same three questions before the evaluator does. It needs a new column or table (with the backend developer), and the company and reviewer pages show it next to the human answers (with the frontend developer).

Keep API keys on the server. Store which model produced a response.

## Company report and export (Backend and Frontend)

**File:** `services/reports/index.ts`, function `buildCompanyReport`

**Input:** one evaluation with its submissions.

**Processing:** turn the validated answers into a result the company can use: correctness, naturalness, local context, the better answer, comments, and the AI pre-check once it exists.

**Output:** `CompanyReport`

**Connects:** `app/employer/evaluations/[id]/page.tsx`. Add fields to `CompanyReport` rather than querying from the page. CSV/JSON **export** (not upload) should build its rows from `CompanyReport` too, so the page and the file always match.

Only report as validated when the status is `COMPLETED`.
