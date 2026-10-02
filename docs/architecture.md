# Architecture

Taska is one Next.js application. Pages and server actions live in `app/`. The database is Postgres through Prisma. Payments go through `LightningService`.

## Request path

1. A company prepays by paying a Lightning invoice (`app/actions/credits.ts`). That credit is held when work is created and spent when a reviewer approves.
2. `createEvaluation` or CSV upload writes an `Evaluation`, generates or stores the AI answer, and assigns a speaker by language.
3. The speaker submits a human check. Status moves to under review.
4. `decideEvaluation` approves or rejects. Approve spends the hold and calls `recordPendingLightningPayouts`. Reject returns the hold. A failed payout does not undo the completed evaluation.
5. Speakers and reviewers are paid at the Lightning address on their profile. Live Breez will not pay `@taska.demo` placeholders.

## Data model

- `User` — email, password hash, role
- `WorkerProfile` — country, languages, skills, optional CV file name, Lightning destination, reputation fields
- `EmployerProfile` — company
- `Task` — reward, quantity, language, skills, status, task type
- `TaskItem` — one evaluation prompt inside an AI evaluation task
- `Evaluation` — one AI answer to check, plus status and optional AI pre-check
- `EvaluationSubmission` — the speaker’s answers
- `CreditDeposit` / `CreditLedger` — company prepaid sats
- `EvaluationPayout` — speaker and reviewer Lightning results after approval

Country is not tied to language. A worker in Kenya may list English and Swahili. A task can require Hausa without implying a country.

## Lightning

```ts
interface LightningProvider {
  createInvoice(input): Promise<Invoice>
  payInvoice(input): Promise<PaymentResult>
  getPaymentStatus(paymentHash): Promise<PaymentResult>
  getBalance(): Promise<{ balanceSats: number }>
}
```

`LightningService` is what the payment code calls. `getLightningService()` chooses the implementation:

- `mock` — `MockLightningProvider`, the default when Breez is unset
- `breez` — `BreezLightningProvider` (Breez SDK Spark) when `BREEZ_API_KEY` and `BREEZ_MNEMONIC` are set

Do not send keys to the browser. Do not store seeds or private keys in Prisma tables. The till seed lives in `BREEZ_MNEMONIC` on the server. `/admin` reads the till with `getBalance()`. Company `prepaidSats` is an internal credit ledger, not a second bitcoin wallet.

The approximate dollar amount is `sats / 100_000_000 * BTC_USD_PRICE`. It is a display hint, not a conversion the app performs.

## Auth

Email and password. Passwords are hashed with bcrypt. Sessions are JWTs signed with `AUTH_SECRET` and last one hour. Signup sends a confirmation email when `RESEND_API_KEY` and `EMAIL_FROM` are set. `/forgot-password` emails a one-hour reset link. Admin and employer pages check the role on the server before reading or changing data.

CV uploads accept PDF only, check the `%PDF` header, and are stored outside `public/`. Download is limited to the worker, an employer, or an admin.

## Replacing the mock provider

Live Lightning is Breez SDK Spark via `BREEZ_API_KEY` and `BREEZ_MNEMONIC`. Do not add a second payment company to the core flow. Never put the mnemonic in Git or the database. On Vercel the SDK uses `/tmp/breez` and rebuilds from the mnemonic; `BREEZ_DATABASE_URL` is optional.
