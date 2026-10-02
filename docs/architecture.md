# Architecture

Taska is one Next.js application. Pages and server actions live in `app/`. The database is Postgres through Prisma. Payments go through `LightningService`.

## Request path

1. A worker starts an AI evaluation task. The server assigns one available `TaskItem`.
2. The worker submits a choice. The server writes a `TaskSubmission` with status `pending`.
3. If the task is marked `autoApprove` (the demo evaluation task), the server scores it and approves it immediately. Otherwise it waits for an employer or admin.
4. Approval calls `payWorkerForSubmission`. That uses `LightningService.createInvoice` and `payInvoice`, then stores a `Payment` and a `LightningPayment`.
5. Worker stats (completed tasks, approval rate, quality score) are recalculated from submissions.

Rejection leaves the submission `rejected` and does not create a payment.

The same submission cannot be paid twice. `Payment.submissionId` is unique, and approval only proceeds while the submission is still `pending`.

## Data model

- `User` — email, password hash, role
- `WorkerProfile` — country, languages, skills, optional CV file name, Lightning destination, reputation fields
- `EmployerProfile` — company
- `Task` — reward, quantity, language, skills, status, task type
- `TaskItem` — one evaluation prompt inside an AI evaluation task
- `TaskSubmission` — answers, status, quality score
- `Payment` — amount and status for one approved submission
- `LightningPayment` — invoice, payment hash, destination

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

- `mock` — `MockLightningProvider`, the default when `OPENNODE_API_KEY` is unset
- `opennode` — `OpenNodeLightningProvider` when `OPENNODE_API_KEY` is set

Do not send keys to the browser. Do not store seeds or private keys in Postgres. Taska records the destination the worker provided and the result of the payment. It does not hold a balance for the user.

The approximate dollar amount is `sats / 100_000_000 * BTC_USD_PRICE`. It is a display hint, not a conversion the app performs.

## Auth

Email and password. Passwords are hashed with bcrypt. Sessions are JWTs signed with `AUTH_SECRET` and last one hour. Signup sends a confirmation email when `RESEND_API_KEY` and `EMAIL_FROM` are set. `/forgot-password` emails a one-hour reset link. Admin and employer pages check the role on the server before reading or changing data.

CV uploads accept PDF only, check the `%PDF` header, and are stored outside `public/`. Download is limited to the worker, an employer, or an admin.

## Replacing the mock provider

Live Lightning is OpenNode via `OPENNODE_API_KEY`. Do not add a second payment company to the core flow.
