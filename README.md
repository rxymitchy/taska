# Taska

Does the AI speak your language?

Taska checks whether AI answers work for African languages and local context. A company submits a question and the answer its AI gave. A local speaker checks it. A reviewer confirms the check. The company gets a validated result, and the people who did the work are paid with Bitcoin Lightning.

Built for Hack4Freedom 2026.

## How it works

```
Company submits a question + AI answer (language, local context)
  → Taska assigns an evaluator
  → Evaluator answers: Is it true? Does it sound natural? Does it know the place?
      If any answer is No, they write a better answer
  → Reviewer approves or rejects (rejected goes back to the evaluator)
  → Company sees the validated result
  → Evaluator and reviewer payments recorded as "Lightning — Pending"
```

Status flow: `Pending → Assigned → Worker completed → Under review → Approved → Completed`.

Example: a company asks its AI, in Swahili, "Ninaweza kutumia M-Pesa kulipa bili hii?" (Can I pay this bill with M-Pesa?). A Kenyan evaluator checks the facts, the Swahili, and whether the steps match how M-Pesa actually works.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL through Prisma 6. PGlite locally, any hosted Postgres (for example Neon) in production |
| Auth | Auth.js (NextAuth v5), email and password, JWT sessions, bcrypt hashing |
| Validation | Zod 4 |
| Payments | Bitcoin Lightning through `services/lightning`. Only a mock provider exists today |
| Hosting (planned) | Vercel + Neon |

## What is built

- Sign up, log in, and three roles: evaluator (`WORKER`), company (`EMPLOYER`), reviewer (`ADMIN`). Reviewer accounts cannot be created from signup.
- Company: create an evaluation, list its evaluations, see the validated result.
- Evaluator: list of assigned evaluations, the three-question form, and the required better answer after a No.
- Reviewer: review queue, approve or reject.
- Full status flow, stored in Postgres, with each role only seeing its own data.
- Pending Lightning payout records for the evaluator and the reviewer after approval.
- Demo accounts and seed data.

## What each teammate builds

The app already works end to end. This is the remaining work, kept to what makes the submission convincing.

**Must** means the submission is weak without it. **Should** clearly improves it; start once your Must items are done. How each code module connects is in [docs/team.md](docs/team.md).

### 1. Backend Developer

| Task | Priority | Where to start |
| --- | --- | --- |
| Deploy to Vercel + Neon with the project lead | Must | Production `DATABASE_URL` and `AUTH_SECRET`, run `npx prisma migrate deploy`, seed the demo accounts |
| Pay the evaluator and reviewer over Lightning | Must | `services/settlement/index.ts`. Keys in server environment variables, no user funds held. Keep the mock if a real payment is not safe in time |
| Export a company's validated evaluations as CSV/JSON | Should | New route that builds rows from `buildCompanyReport` in `services/reports/index.ts`, including better answers |
| Store the AI pre-check result | Should | New migration, with the AI/ML developer |

### 2. Frontend Developer

| Task | Priority | Where to start |
| --- | --- | --- |
| Fix the signed-in header wrapping on phones | Must | `components/site-header.tsx` |
| Screenshots of every screen for the documentation lead | Must | Company, evaluator, and reviewer flows |
| Show the AI pre-check next to the human answers | Should | "AI said Yes, local speaker said No" on `app/employer/evaluations/[id]` and `app/admin/evaluations/[id]` |
| Totals on the reviewer page | Should | Waiting, approved, and rejected counts on `app/admin/page.tsx` |
| Export button on the company page | Should | Links to the backend export route |

### 3. AI/ML Developer

| Task | Priority | Where to start |
| --- | --- | --- |
| Choose a model that handles Swahili and test two or three other languages | Must | Languages Taska offers are in `lib/catalog.ts` |
| Generate the AI answer instead of pasting it | Must | `generateAiResponse` in `services/ai/index.ts`. Keep the manual field for when the API fails. Keys on the server |
| AI pre-check: the model answers the same three questions first | Should | Same file. Stored by the backend, shown by the frontend |
| Write `docs/ai.md` | Should | Which model, why, and which languages worked |

### 4. Documentation Lead

| Task | Priority | Where to start |
| --- | --- | --- |
| Problem, solution, and target users | Must | Expand the top of this README |
| Pitch and a three-minute demo script | Must | Use the Swahili M-Pesa demo below |
| Collect screenshots and project evidence | Must | From the frontend developer, into `docs/screenshots/` |
| Rewrite the architecture doc | Should | `docs/architecture.md` still describes the older task marketplace |
| Describe the quality process | Should | Evaluator checks, writes a better answer after a No, reviewer confirms |

### 5. Group Lead / Project Lead

| Task | Priority | Notes |
| --- | --- | --- |
| Set a deadline for every Must task and check in daily | Must | Use the tables above |
| Own the deployment with the backend developer | Must | Judges need a working link |
| Run the final test after every merge | Must | The demo below, plus `npx tsc --noEmit` |
| Submission checklist | Must | Live link, repository, README, pitch, and a decision on `DEMO_LOGIN` |
| Decide whether to delete the old marketplace code | Should | See "Project structure" below |

## Local development

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env
npm install
npm run db
```

Leave that process running. It starts a local Postgres-compatible database (PGlite) on port 5432. In a second terminal:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000.

On Windows, stop `npm run dev` before running `npx prisma generate` or `npx prisma migrate deploy`. The running server locks Prisma's engine file.

`npm run db` is for local development only. Production uses a hosted Postgres through `DATABASE_URL`. Docker Compose in this repo can start Postgres 16 instead:

```bash
docker compose up -d
```

The Docker database URL is `postgresql://taska:taska@localhost:5432/taska?schema=public`.

## Demo

Password for every demo account: `demo1234`

| Role | Email |
| --- | --- |
| Evaluator | worker@taska.demo |
| Company | employer@taska.demo |
| Reviewer | admin@taska.demo |

The login page has one-click buttons for these when `DEMO_LOGIN=true`.

1. Log in as the **company**. Open **New evaluation**, choose Swahili and Kenya / M-Pesa, paste a question and the AI's answer, and submit.
2. Log in as the **evaluator**. Open **My evaluations**, answer the three questions, and submit. Answering No asks for a better answer.
3. Log in as the **reviewer**. Open **Review queue** and approve.
4. Log in as the **company** again. The evaluation shows **Validated** with the results.
5. The evaluator and reviewer screens show **Lightning — Pending**.

`npm run db:seed` also creates one Swahili evaluation already assigned to the evaluator.

Set `DEMO_LOGIN=false` before a public deployment.

## Project structure

```
app/actions/evaluations.ts   every evaluation status change
app/employer/                company pages
app/dashboard/               evaluator pages
app/admin/                   reviewer pages
components/                  UI
lib/                         auth helpers, catalog, validation
services/                    assignment, ai, reports, settlement, and Lightning
prisma/                      schema, migrations, seed
docs/team.md                 how each code module connects to the core
```

The first version of Taska was a general task marketplace. Its code is still in the repo (`app/tasks`, `app/workers`, `app/profile`, `app/actions/tasks.ts`, `app/actions/reviews.ts`, `services/reviews.ts`, `services/payments.ts`), but nothing links to it.

## Lightning

Taska never holds user funds and never stores wallet keys. After a reviewer approves, `services/settlement/index.ts` records one Pending payout for the evaluator and one for the reviewer. Paying them is the backend developer's Must task.

`LIGHTNING_PROVIDER=mock` uses `MockLightningProvider` in `services/lightning`. Its invoices start with `lnmock1` and move no real bitcoin. A real provider implements `LightningProvider` in `services/lightning/types.ts`, with keys in server environment variables only.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Session signing secret |
| `AUTH_URL` | Public app URL |
| `LIGHTNING_PROVIDER` | `mock`, or a provider you add |
| `BTC_USD_PRICE` | Used only to show an approximate dollar value |
| `DEMO_LOGIN` | Enables demo account buttons |
| `DEMO_PASSWORD` | Password seeded for demo accounts |

Never commit `.env`. Never put Lightning keys, seeds, or wallet credentials in the frontend or the database.

## Scripts

- `npm run dev` — app
- `npm run db` — local Postgres
- `npm run db:seed` — demo data
- `npm run build` — production build
- `npm run lint` — lint

## License

MIT. See [LICENSE](LICENSE).
