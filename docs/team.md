# Team modules

Taska checks whether an AI response works for an African language and a local context.

The shared core is finished. Money, CSV upload, and reviewer invites use the same evaluation path. Full picture: the README (**How it works** and **Get paid as you go**).

```
Company credits → hold 918 sats → Pending → Assigned
  → Evaluator submits → Worker completed → Under review
  → Approve → Completed → spend credits → pay 500 + 400 Lightning
  → Reject  → Assigned  → return hold
```

Do not add a second status list. Change `EvaluationStatus` only in `app/actions/evaluations.ts`.

## Rules for every module

- Each module has one entry file under `services/`. Keep its exported function name and argument shape unless the whole team agrees.
- A database change needs its own Prisma migration. Do not edit existing migrations.
- Run `npx tsc --noEmit` and the demo below before opening a pull request.

## Demo

Password for every account: `demo1234`.

1. Log in as the company, `employer@taska.demo`. Credits are already loaded. Open **Get an answer checked** and submit a Swahili, Kenya / M-Pesa response (or **Upload** a CSV). The list should name **Rita Mwangi**.
2. Log in as Rita, `rita@taska.demo` (or the **Rita** button). Answer the three questions. A No makes **Better answer** required.
3. Log in as the reviewer, `admin@taska.demo`. Open **Review queue**. **Bitcoin in the till** is the live Breez pot (0 until a company pays a real invoice). Then agree — pay the speaker. **Invite** is how new reviewers join.
4. Log in as the company again. The evaluation shows the validated result.
5. Rita and the reviewer screens show Lightning Sent and the sat amounts (500 and 400).

`npm run db:seed` also creates one Swahili evaluation already assigned to the evaluator.

## Core files

| File                           | What it owns                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `prisma/schema.prisma`         | Evaluations, credits, batches, reviewer invites, `EvaluationStatus`                  |
| `lib/pricing.ts`               | 500 / 400 / 918 sats                                                                 |
| `lib/credits.ts`               | Hold, spend, refund, Lightning deposits                                              |
| `app/actions/evaluations.ts`   | `createEvaluation`, `submitHumanEvaluation`, `decideEvaluation`, every status change |
| `app/actions/upload.ts`        | CSV/JSON → many evaluations                                                          |
| `app/actions/credits.ts`       | Company Lightning invoices                                                           |
| `app/actions/invites.ts`       | Reviewer invite links                                                                |
| `services/assignment/index.ts` | Picks a speaker of that language (Rita / Chinedu / Ama)                              |
| `app/employer/`                | Company list, credits, upload, result page                                           |
| `app/dashboard/`               | Evaluator list and form                                                              |
| `app/admin/`                   | Review queue, till balance, invite, approve or reject                                |
| `services/lightning/`          | Breez Spark (live) or mock. Secrets stay in environment variables                    |

---

## Lightning payouts (Backend Developer)

**File:** `services/settlement/index.ts`, function `recordPendingLightningPayouts`

**Input:** `{ evaluationId, workerUserId, reviewerUserId }`, sent after a reviewer approves.

**Processing:** pay the evaluator and reviewer Lightning addresses (LNURL-pay when live). Store the payment hash. Mock unless `BREEZ_API_KEY` and `BREEZ_MNEMONIC` are set. Company credits are spent in `lib/credits.ts` before this runs. `retryFailedPayouts` can send again without paying a Sent row twice.

**Output:** each `EvaluationPayout` row moves from `PENDING` to `SENT` or `FAILED`.

**Connects:** `decideEvaluation` calls this after the evaluation becomes `COMPLETED`.

A failed payment must not undo the validated evaluation. Keys stay in server environment variables. Live Breez will not pay `@taska.demo` placeholders.

## AI model (AI/ML Developer)

**File:** `services/ai/index.ts`, function `generateAiResponse`

**Input:** `{ prompt, language, context }`

**Processing:** call `AI_API_KEY` / `AI_BASE_URL` when set. If they are missing or the call fails, return a local demo reply (`taska-local`).

**Output:** `{ text, model }`.

**Connects:** `createEvaluation` and CSV upload call this when the AI response is blank. The paste field stays on the form.

The optional AI pre-check uses the same three questions before the evaluator does. Its nullable scores and model are stored on `Evaluation`; company results and reviewer decisions show them beside the human answers. It is not an approval signal. See `docs/ai.md` for configuration and quality checks.

Keep API keys on the server. Store which model produced a response.

## Company report and export (Backend and Frontend)

**File:** `services/reports/index.ts`, function `buildCompanyReport`

**Input:** one evaluation with its submissions.

**Processing:** turn the validated answers into a result the company can use: correctness, naturalness, local context, the better answer, comments, and the AI pre-check once it exists.

**Output:** `CompanyReport`

**Connects:** `app/employer/evaluations/[id]/page.tsx` and the employer dashboard's CSV/JSON dataset download at `/api/employer/evaluations/export`. Add fields to `CompanyReport` rather than querying from the page. Export rows are built from `CompanyReport` too, so the page and the file always match.

Only report as validated when the status is `COMPLETED`.
