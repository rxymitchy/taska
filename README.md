# Taska

Does the AI speak your language?

Taska checks whether AI answers work for African languages and local context. A company submits a question and the answer its AI gave. A local speaker checks it. A reviewer confirms the check. The company gets a validated result, and the people who did the work are paid with Bitcoin Lightning.

Built for Hack4Freedom 2026.

## How the app works

Read this first if you are joining the codebase. Money, status, and roles all follow the same path.

### Who does what

```
Company (EMPLOYER)     Evaluator (WORKER)     Reviewer (ADMIN)
pays for the work      checks the AI answer   double-checks the check
```

Public signup is **evaluator** or **company** only. A reviewer is invited by an existing reviewer (`/admin/invite` → `/signup?invite=…`).

### The whole path

```
Company pays a Lightning invoice
        ↓
   Credits available   (prepaid budget, not a worker wallet)
        ↓
   New evaluation  or  CSV/JSON upload (up to 200 rows)
        ↓
   Hold 714 sats per row   (500 + 200 + 2% fee)
        ↓
   Pending → Assigned → evaluator
        ↓
   Three questions: true? natural? knows the place?
        ↓
   Any No? → must write a better answer
        ↓
   Worker completed → Under review → reviewer
        ↓
        ├── Reject → Assigned again, hold returned to credits
        └── Approve → Completed
                         ↓
              Spend the 714 hold
                         ↓
              Pay evaluator 500 sats  →  Lightning address
              Pay reviewer  200 sats  →  Lightning address
              Keep           14 sats  →  Taska (2%)
                         ↓
              Company sees the validated result
```

Status names in the database: `Pending → Assigned → Worker completed → Under review → Approved → Completed`.

Rejected work is **not** charged. Taska does not cash out to shillings or naira in the app.

### Money (one approved item)

```
Company charged     714 sats
  → evaluator       500
  → reviewer        200
  → Taska fee        14   (2% of 700, rounded up)
```

Amounts live in `lib/pricing.ts` (`EVALUATOR_PAYOUT_SATS`, `REVIEWER_PAYOUT_SATS`, `PLATFORM_FEE_BPS`).

Credits: **available** can be spent on new work. **Held** is reserved for open evaluations. A Lightning deposit adds to available. Approve moves held → spent. Reject moves held → available.

### Where each step lives

```
Signup / login              →  app/actions/auth.ts
Invite reviewer             →  app/actions/invites.ts
Buy credits (invoice)       →  app/actions/credits.ts  →  services/lightning
Create one evaluation       →  app/actions/evaluations.ts  (createEvaluation)
Upload CSV/JSON             →  app/actions/upload.ts
Hold / spend / refund       →  lib/credits.ts
Assign evaluator            →  services/assignment/index.ts
Generate blank AI answer    →  services/ai/index.ts
Evaluator submits           →  submitHumanEvaluation
Reviewer decides            →  decideEvaluation
Pay Lightning               →  services/settlement/index.ts
```

Do not add a second status list. Change `EvaluationStatus` only in `app/actions/evaluations.ts`.

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
| Payments | Bitcoin Lightning. Mock by default. Live: Nostr Wallet Connect (`NWC_URL`, Alby Hub) or OpenNode |
| Hosting | Vercel + Neon. Live: https://taska-beta.vercel.app |

## What is built

- Sign up, log in, and three roles: evaluator (`WORKER`), company (`EMPLOYER`), reviewer (`ADMIN`). Reviewer accounts are invite-only from an existing reviewer.
- Company: prepaid Lightning credits, create one evaluation or upload CSV/JSON (up to 200 rows), list evaluations, see the validated result.
- Evaluator: list of assigned evaluations, the three-question form, the required better answer after a No, and a profile Lightning address.
- Reviewer: review queue, approve or reject, invite other reviewers.
- Full status flow, stored in Postgres, with each role only seeing its own data.
- Lightning: company pays an invoice to add credits. After approval, evaluator and reviewer are paid to a Lightning address (LNURL-pay). Taska keeps about 2%. Live rail is **Nostr Wallet Connect** (Alby Hub) when `NWC_URL` is set; otherwise mock unless OpenNode is configured.
- Demo accounts and seed data (the demo company starts with credits).

## What each teammate builds

Status: **Done** works today, **Partly** exists but needs more, **To do** is not started. Start from the file in the last column. How each code module connects is in [docs/team.md](docs/team.md).

### 1. Backend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the backend/API | Done | Server Actions in `app/actions/evaluations.ts` |
| Create the database | Done | `prisma/schema.prisma`, `prisma/migrations/` |
| Handle user registration and login | Done | `app/actions/auth.ts`, `auth.ts` |
| Manage users and their roles | Done | Evaluator, company, and reviewer roles. Reviewers are invited from `/admin/invite` |
| Create and assign tasks to contributors | Done | `services/assignment/index.ts` gives each new evaluation to the demo evaluator. CSV/JSON upload is `app/actions/upload.ts` |
| Receive and store contributor submissions | Done | `submitHumanEvaluation`, `EvaluationSubmission` table |
| Manage task status | Done | Every status change lives in `app/actions/evaluations.ts` |
| Store AI evaluation results | Partly | Human results and the generated answer (`aiModel`) are stored. An AI pre-check of the three questions is still open for the AI/ML developer |
| Handle dataset export (CSV/JSON) | To do | **Upload is done.** Export is not: add a download of validated rows (better answers included) from `buildCompanyReport` in `services/reports/index.ts` |
| Prepare the system for future Lightning payments | Done | Prepaid credits, 2% fee. Live: NWC (`services/lightning/nwc-provider.ts`) or OpenNode. Mock if neither is set |
| Retry failed Lightning payouts | To do | `EvaluationPayout` can be `FAILED` while the evaluation stays Completed. Add a safe retry that does not pay twice |
| Assign by language, not only the demo evaluator | To do | `services/assignment/index.ts` still prefers `worker@taska.demo`. CSV uploads in Yoruba/Twi need a matching speaker |
| Connect the frontend with the AI system and database | Done | Blank AI response calls `generateAiResponse` in `services/ai/index.ts`. Set `AI_API_KEY` for a live model; otherwise a local demo reply is stored |

### 2. Frontend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the website/interface | Done | `app/page.tsx`, `components/` |
| Create the client dashboard | Done | `app/employer/`, including credits and CSV/JSON upload |
| Create the contributor dashboard | Done | `app/dashboard/` |
| Create the task/evaluation page | Done | `app/dashboard/evaluations/[id]`, `components/human-evaluation-form.tsx` |
| Create the admin dashboard | Partly | Review queue and invites work. Still missing waiting / approved / rejected totals on `app/admin/` |
| Show company credit balance clearly | Done | `app/employer/credits` and the company home line (available / held / cost) |
| Display project progress and results | Done | Each evaluation shows its status and validated result |
| Display contributor scores/earnings | Done | Evaluator and reviewer screens show Lightning Sent or Failed, plus sat amounts |
| Connect the frontend to the backend APIs | Done | Forms call Server Actions directly |
| Make the application responsive and user-friendly | Partly | Works on a phone, but the signed-in header now has more links (Credits, Upload, Invite) and wraps. Needs a compact nav in `components/site-header.tsx` |
| Copy / show Lightning invoices clearly | To do | Credits page shows the invoice string. A copy button (and a QR later) would help companies pay |
| Handle frontend validation and error messages | Done | Required fields, plus server errors shown on each form |

### 3. AI/ML Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Research suitable AI models and specialised AI SDKs | To do | Keep API keys in server environment variables |
| Test which models/SDKs support African languages | To do | Languages Taska offers are in `lib/catalog.ts`. Start with Swahili |
| Build AI-assisted task generation | Partly | `generateAiResponse` in `services/ai/index.ts` fills a blank company response. Plug in `AI_API_KEY` for a real model. Keep the paste field |
| Build AI response evaluation | To do | An AI pre-check that answers the same three questions before the evaluator |
| Check fluency, accuracy and cultural relevance | To do | These are the three questions of the pre-check |
| Compare AI scores with human evaluations | To do | Show "AI said Yes, local speaker said No" on the company and reviewer pages, with the frontend developer |
| Document the AI models, SDKs and methods used | To do | Add `docs/ai.md` |

### 4. Documentation Lead

| Task | Status | Where to start |
| --- | --- | --- |
| Research and document the problem | Partly | Short version at the top of this README. Expand with sources if you want it for the pitch |
| Document the project's solution | Done | Arrow flow in **How the app works** above |
| Document target users and customers | To do | One short page: AI teams shipping to African markets, local evaluators, reviewers. Can live in this README |
| Maintain the README | Done | This file. Update the Status column when you ship |
| Document the system architecture | To do | `docs/architecture.md` still describes the older task marketplace and needs rewriting to match this flow |
| Document the AI component | To do | With the AI/ML developer (`docs/ai.md`) |
| Document the data-quality process | To do | Three questions, better answer after a No, reviewer confirms. Can be a subsection under How the app works |
| Document how the platform works | Done | This README plus `docs/team.md` (files each step calls) |
| Keep screenshots and important project evidence | To do | Add a `docs/screenshots/` folder |
| Prepare the final technical documentation | To do | |
| Help prepare the presentation/pitch | To do | Use the Swahili M-Pesa demo below |

### 5. Group Lead / Project Lead

These are coordination tasks, so none of them are code. The things to track:

| Task | Status | Notes |
| --- | --- | --- |
| Coordinate the team, divide tasks, set deadlines | To do | Use the tables above |
| Track everyone's progress and run meetings | To do | Update the Status column as work lands |
| Make sure the parts integrate properly | Partly | Credits, upload, and invites now sit on the same evaluation path. Do not invent a second status list. Old marketplace code is still in the repo and unused |
| Resolve blockers and make major decisions | To do | Delete old marketplace code or leave it. For live Lightning: create an Alby Hub, paste `NWC_URL` on Vercel (not OpenNode) |
| Keep the project focused on the main problem | Ongoing | AI answers that work for African languages and local context |
| Coordinate final testing | To do | Run the demo below after every merge. `npx tsc --noEmit` must pass |
| Coordinate the final demo and presentation | To do | |
| Make sure the project is ready for submission | Partly | Live app: https://taska-beta.vercel.app. Database is Neon. Confirm `DEMO_LOGIN` before judging |

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

## Production

Live site: https://taska-beta.vercel.app

Hosted on Vercel. Postgres is Neon (`taska-db`), connected as `DATABASE_URL`. After schema changes:

```bash
vercel env run -e production -- npx prisma migrate deploy
vercel env run -e production -- npx tsx scripts/seed-demo.ts
vercel deploy --prod
```

Rename or move the local `.env` before `vercel env run`, or it will talk to your laptop database instead.

## Demo

Password for every demo account: `demo1234`

| Role | Email |
| --- | --- |
| Evaluator | worker@taska.demo |
| Company | employer@taska.demo |
| Reviewer | admin@taska.demo |

The login page has one-click buttons for these when `DEMO_LOGIN=true`.

1. Log in as the **company**. The demo account already has credits. Open **New evaluation**, choose Swahili and Kenya / M-Pesa, type a question, leave the AI response blank (or paste one), and submit. Credits holds 714 sats. Upload a CSV from **Upload** if you want many at once.
2. Log in as the **evaluator**. Open **My evaluations**, answer the three questions, and submit. Answering No asks for a better answer.
3. Log in as the **reviewer**. Open **Review queue** and approve.
4. Log in as the **company** again. The evaluation shows **Validated** with the results.
5. The evaluator and reviewer screens show **Lightning — Sent** and the sat amount.

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

The first version of Taska was a general task marketplace. Its code is still in the repo (`app/tasks`, `app/workers`, `app/actions/tasks.ts`, `app/actions/reviews.ts`, `services/reviews.ts`, `services/payments.ts`), but nothing links to it. Evaluator **Profile** is used for the Lightning address.

## Lightning

Taska does not store wallet keys. Companies prepay by paying a Lightning invoice (`app/employer/credits`). That budget is held when work is assigned and spent when a reviewer approves. After approval, `services/settlement/index.ts` pays the evaluator (500 sats) and reviewer (200 sats) to a Lightning address. The company was charged 714 sats; 14 sats stay as the 2% fee.

**Live (freedom tech):** set `NWC_URL` to a `nostr+walletconnect://…` connection from [Alby Hub](https://albyhub.com/). Taska creates invoices and sends payouts through that wallet over Nostr. The bitcoin sits in the Hub, not in Taska. Permissions needed: make invoices and pay invoices. Keep a balance in the Hub so payouts can leave.

**Demo:** `LIGHTNING_PROVIDER=mock` (or no `NWC_URL`) uses `lnmock1` invoices. No bitcoin moves.

OpenNode still works if `OPENNODE_API_KEY` is set and NWC is not. That is custodial; NWC is the hackathon path.

Never put the NWC secret in the frontend or git.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Session signing secret |
| `AUTH_URL` | Public app URL |
| `LIGHTNING_PROVIDER` | `mock`, `nwc`, or `opennode`. Ignored when `NWC_URL` is set (NWC wins) |
| `NWC_URL` | `nostr+walletconnect://…` from Alby Hub. Enables live invoices and payouts |
| `EVALUATOR_PAYOUT_SATS` | Payout to the evaluator (default 500) |
| `REVIEWER_PAYOUT_SATS` | Payout to the reviewer (default 200) |
| `PLATFORM_FEE_BPS` | Platform fee in basis points (default 200 = 2%) |
| `OPENNODE_API_KEY` | Optional. Enables real Lightning invoices and payouts |
| `OPENNODE_WEBHOOK_SECRET` | Optional. HMAC secret for `/api/lightning/webhook` |
| `AI_API_KEY` | Optional. OpenAI-compatible key. Without it, a local demo reply is used |
| `AI_BASE_URL` | Optional. Defaults to `https://api.openai.com/v1` |
| `AI_MODEL` | Optional. Defaults to `gpt-4o-mini` |
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
