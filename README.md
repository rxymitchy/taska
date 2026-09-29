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
- Placeholder modules in `services/` that teammates replace. The app works end to end with them as they are. See [docs/team.md](docs/team.md).
- Demo accounts and seed data.

## What each teammate builds

Status: **Done** works today, **Partly** exists but needs more, **To do** is not started. Start from the file in the last column.

### 1. Backend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the backend/API | Partly | Server Actions in `app/actions/evaluations.ts`. There is no public REST API for companies to call yet |
| Create the database | Done | `prisma/schema.prisma`, `prisma/migrations/` |
| Handle user registration and login | Done | `app/actions/auth.ts`, `auth.ts` |
| Manage users and their roles | Partly | Roles work. There is no screen to add reviewers or disable users. Module F in `docs/team.md` |
| Create and manage AI-data projects | To do | Evaluations are single items. Add a project that groups them, plus edit and delete |
| Create and assign tasks to contributors | Partly | `services/assignment/index.ts` gives everything to the demo evaluator. Match by language and workload (module B) |
| Receive and store contributor submissions | Done | `submitHumanEvaluation`, `EvaluationSubmission` table |
| Calculate contributor quality scores | To do | Nothing for evaluations yet. Score from approval rate and agreement with other evaluators |
| Manage task status | Done | Every status change lives in `app/actions/evaluations.ts` |
| Store AI evaluation results | Partly | Human results are stored. Automatic AI scores have no table yet |
| Handle dataset export (CSV/JSON) | To do | Add a route that exports a company's validated evaluations, including better answers |
| Prepare the system for future Lightning payments | Partly | `EvaluationPayout` rows are recorded as Pending. Paying them is module A in `services/settlement/index.ts` |
| Connect the frontend with the AI system and database | Partly | Database is connected. AI is a placeholder in `services/ai/index.ts` |

### 2. Frontend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the website/interface | Done | `app/page.tsx`, `components/` |
| Create the client dashboard | Done | `app/employer/` |
| Create the contributor dashboard | Done | `app/dashboard/` |
| Create the task/evaluation page | Done | `app/dashboard/evaluations/[id]`, `components/human-evaluation-form.tsx` |
| Create the admin dashboard | Partly | `app/admin/` has the review queue only. Add users, totals, and past decisions |
| Display project progress and results | Partly | Each evaluation shows its status and result. Add counts and progress per project once projects exist |
| Display contributor scores/earnings | Partly | Shows "Lightning — Pending" only. Add amounts and scores once the backend has them |
| Connect the frontend to the backend APIs | Done | Forms call Server Actions directly |
| Make the application responsive and user-friendly | Partly | Works on mobile, but the signed-in header wraps on small screens (`components/site-header.tsx`) |
| Handle frontend validation and error messages | Done | Required fields, plus server errors shown on each form |

### 3. AI/ML Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Research suitable AI models and specialised AI SDKs | To do | Keep API keys in server environment variables |
| Test which models/SDKs support African languages | To do | Languages Taska offers are in `lib/catalog.ts` |
| Build AI-assisted task generation | To do | `generateAiResponse` in `services/ai/index.ts` returns `null` today, so companies paste answers by hand |
| Build language detection | To do | Check the submitted answer matches the chosen language before it is assigned |
| Build AI response evaluation | To do | A first automatic pass before the human check |
| Check fluency, accuracy and cultural relevance | To do | Humans do this today. An AI pre-score would sit beside their three answers |
| Detect low-quality or suspicious submissions | To do | For example, an evaluator who always answers Yes, or submits too fast |
| Detect duplicate submissions | To do | Repeated better answers, or the same evaluation submitted twice |
| Assist with translation | To do | Help reviewers read languages they do not speak |
| Compare AI scores with human evaluations | To do | Needs the AI evaluation first |
| Build the AI/human consensus system | To do | `services/consensus/index.ts` sends everything to review after one answer (module C) |
| Document the AI models, SDKs and methods used | To do | Add `docs/ai.md` |

### 4. Documentation Lead

| Task | Status | Where to start |
| --- | --- | --- |
| Research and document the problem | Partly | Short version at the top of this README |
| Document the project's solution | Partly | "How it works" above |
| Document target users and customers | To do | AI companies and teams shipping to African markets, evaluators, reviewers |
| Maintain the README | Partly | This file. Keep the tables here up to date |
| Document the system architecture | To do | `docs/architecture.md` still describes the older task marketplace and needs rewriting |
| Document the APIs | To do | List the Server Actions in `app/actions/evaluations.ts`, and any REST routes once added |
| Document the AI component | To do | With the AI/ML developer |
| Document the data-quality process | To do | Evaluator → better answer → reviewer → consensus |
| Document how the platform works | Partly | `docs/team.md` has the flow and demo steps |
| Keep screenshots and important project evidence | To do | Add a `docs/screenshots/` folder |
| Prepare the final technical documentation | To do | |
| Help prepare the presentation/pitch | To do | Use the Swahili M-Pesa demo below |

### 5. Group Lead / Project Lead

These are coordination tasks, so none of them are code. The things to track:

| Task | Status | Notes |
| --- | --- | --- |
| Coordinate the team, divide tasks, set deadlines | To do | Use the tables above. Module letters A–F are in `docs/team.md` |
| Track everyone's progress and run meetings | To do | Update the Status column as work lands |
| Make sure the parts integrate properly | Partly | Each module has one file and one call site in `docs/team.md`. Changes to `EvaluationStatus` need the team's agreement |
| Resolve blockers and make major decisions | To do | First decisions: keep or delete the old task marketplace code (see below), and how many evaluators each answer needs |
| Keep the project focused on the main problem | Ongoing | AI answers that work for African languages and local context |
| Coordinate final testing | To do | Run the demo below after every merge. `npx tsc --noEmit` must pass |
| Coordinate the final demo and presentation | To do | |
| Make sure the project is ready for submission | To do | Not deployed yet. Needs Vercel + Neon, a production `AUTH_SECRET`, and a decision on `DEMO_LOGIN` |

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
services/                    teammate modules (assignment, consensus, ai, reports, settlement) and Lightning
prisma/                      schema, migrations, seed
docs/team.md                 input, processing, output, and connection point for each module
```

The first version of Taska was a general task marketplace. Its code is still in the repo (`app/tasks`, `app/workers`, `app/profile`, `app/actions/tasks.ts`, `app/actions/reviews.ts`, `services/reviews.ts`, `services/payments.ts`), but nothing links to it. The team should decide whether to delete it.

## Lightning

Taska never holds user funds and never stores wallet keys. After a reviewer approves, `services/settlement/index.ts` records one Pending payout for the evaluator and one for the reviewer. Paying them is module A.

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
