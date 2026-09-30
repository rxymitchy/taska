# Taska

**Does the AI speak your language?**

Live: [taska-beta.vercel.app](https://taska-beta.vercel.app) · Hack4Freedom 2026 · [GitHub](https://github.com/rxymitchy/taska)

## For judges

AI assistants already answer people in Nairobi, Lagos, and Accra. A lot of those answers are fluent and still wrong — a polite Swahili sentence that would send someone through the wrong M-Pesa steps.

**Taska is not a chatbot and not a wallet.** It is how a local speaker gets paid in bitcoin to catch that.

1. A company pays a **Lightning invoice**.
2. The work goes to someone who actually speaks the language (Rita in Kisumu for Swahili, Chinedu for Yoruba, Ama for Twi).
3. They answer three questions: would a neighbor follow this, would a local person say it this way, does it know the place.
4. If anything is No, they write a better answer.
5. A reviewer — an expert gate — agrees or sends it back.
6. **Sats move** to Lightning addresses. Taska never holds wallet keys. The seed stays in Alby Hub (Nostr Wallet Connect).

One approved check:

```
Company pays     918 sats
  Rita (speaker)   500   — she did the language work
  Reviewer         400   — she is the expert gate, paid per check
  Taska             18   — 2%
```

Rejected work is not charged. There is no cash-out to shillings or naira in the app.

**What we do not do:** store seeds, run a custodial exchange, or treat English fluency as the product.

Demo logins (password `demo1234`): **Rita**, **Company**, **Reviewer**. Extra buttons show assignment: Chinedu · Yoruba, Ama · Twi.

`/api/health` returns `{ ok, db, lightning }`. `lightning` is `nwc` when Alby Hub is connected, otherwise `mock`.

## How the app works

Money, status, and roles follow one path. Do not add a second one.

### Who does what

```
Company (EMPLOYER)     Speaker (WORKER)        Reviewer (ADMIN)
pays Lightning         checks the AI answer    double-checks the check
```

Public signup is **speaker** or **company**. A reviewer is invited (`/admin/invite`).

Work is assigned by **language** (and country in the context). Swahili/Kenya prefers Rita. Yoruba/Nigeria prefers Chinedu. Twi/Ghana prefers Ama. If nobody speaks that language, the row waits.

### The whole path

```
Company pays a Lightning invoice
        ↓
   Credits available   (prepaid budget, not a worker wallet)
        ↓
   New evaluation  or  CSV/JSON upload (up to 200 rows)
        ↓
   Hold 918 sats per row   (500 + 400 + 2% fee)
        ↓
   Pending → Assigned → speaker of that language
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
              Spend the 918 hold
                         ↓
              Pay speaker   500 sats  →  Lightning address
              Pay reviewer  400 sats  →  Lightning address
              Keep           18 sats  →  Taska (2%)
                         ↓
              Company sees the validated result
```

Status names in the database: `Pending → Assigned → Worker completed → Under review → Approved → Completed`.

### Where each step lives

```
Signup / login              →  app/actions/auth.ts
Invite reviewer             →  app/actions/invites.ts
Buy credits (invoice)       →  app/actions/credits.ts  →  services/lightning
Create one evaluation       →  app/actions/evaluations.ts  (createEvaluation)
Upload CSV/JSON             →  app/actions/upload.ts
Hold / spend / refund       →  lib/credits.ts
Assign speaker              →  services/assignment/index.ts
Generate blank AI answer    →  services/ai/index.ts
Speaker submits             →  submitHumanEvaluation
Reviewer decides            →  decideEvaluation
Pay Lightning               →  services/settlement/index.ts
```

Do not add a second status list. Change `EvaluationStatus` only in `app/actions/evaluations.ts`.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL through Prisma 6. PGlite locally, Neon in production |
| Auth | Auth.js (NextAuth v5), email and password, JWT sessions, bcrypt hashing |
| Validation | Zod 4 |
| Payments | Bitcoin Lightning. Live: Nostr Wallet Connect (`NWC_URL`, Alby Hub). Mock if unset |
| Hosting | Vercel + Neon. Live: https://taska-beta.vercel.app |

## What is built

- Three roles: speaker, company, reviewer (invite-only).
- Company: Lightning credits, one evaluation or CSV/JSON (up to 200 rows), sees who was assigned, sees the validated result.
- Speaker: assigned work in their language, three questions, better answer after a No, Lightning address on the profile.
- Reviewer: queue, approve or reject (sats move only on agree), invite others, retry failed payouts.
- Lightning: invoice in, payout to Lightning addresses (LNURL-pay when live). Keys never in the database. OpenNode is not used.
- Demo accounts. Homepage tells the Rita story.

## What each teammate builds

Status: **Done** works today, **Partly** exists but needs more, **To do** is not started. File pointers in the last column. How modules connect: [docs/team.md](docs/team.md).

### 1. Backend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the backend/API | Done | Server Actions in `app/actions/evaluations.ts` |
| Create the database | Done | `prisma/schema.prisma`, `prisma/migrations/` |
| Handle user registration and login | Done | `app/actions/auth.ts`, `auth.ts`. Demo speakers: Rita, Chinedu, Ama |
| Manage users and their roles | Done | Speaker, company, reviewer. Reviewers from `/admin/invite` |
| Create and assign work | Done | Language + country in `services/assignment/index.ts`. CSV/JSON in `app/actions/upload.ts` |
| Receive and store submissions | Done | `submitHumanEvaluation`, `EvaluationSubmission` |
| Manage task status | Done | Every status change in `app/actions/evaluations.ts` |
| Store AI evaluation results | Partly | Human results and `aiModel` are stored. AI pre-check of the three questions is still open for AI/ML |
| Dataset export (CSV/JSON) | To do | **Upload is done.** Add a download of validated rows from `buildCompanyReport` in `services/reports/index.ts` |
| Lightning payments | Done | Credits, 500 / 400 / 2%. Live NWC in `services/lightning/nwc-provider.ts`. Mock without `NWC_URL` |
| Retry failed Lightning payouts | Done | Review queue. Pays the address on the profile now. Does not pay a Sent row twice |
| Assign by language | Done | Swahili → Rita, Yoruba → Chinedu, Twi → Ama. No speaker → wait |
| Live payouts need a real address | Done | `@taska.demo` placeholders are not paid when NWC is on |
| Connect AI + database | Done | Blank response → `generateAiResponse`. Set `AI_API_KEY` for a live model |
| Connect Alby Hub in production | To do | Paste `NWC_URL` on Vercel. Until then `/api/health` shows `"lightning":"mock"` |

### 2. Frontend Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Build the website | Done | `app/page.tsx` — Rita, Lightning in the loop, keys not in Taska |
| Company dashboard | Done | `app/employer/` — credits, upload, assigned speaker name on the list |
| Speaker dashboard | Done | `app/dashboard/` |
| Evaluation page | Done | `app/dashboard/evaluations/[id]`, three neighbor questions |
| Admin dashboard | Partly | Queue, invites, retry failed payouts. Still missing waiting / approved / rejected totals on `app/admin/` |
| Company credit balance | Done | `app/employer/credits` (Pay Lightning) |
| Progress and results | Done | Status + validated result |
| Earnings | Done | Lightning Sent or Failed, sat amounts |
| Connect UI to backend | Done | Forms call Server Actions |
| Responsive layout | Partly | Works on a phone. Signed-in header wraps. Compact nav in `components/site-header.tsx` |
| Copy Lightning invoice | To do | Invoice string is on the credits page. A copy button (QR later) would help companies pay |
| Form errors | Done | Required fields + server errors |
| Demo logins for assignment | Done | Login: Rita, Chinedu · Yoruba, Ama · Twi |

### 3. AI/ML Developer

| Task | Status | Where to start |
| --- | --- | --- |
| Research models / SDKs | To do | Keep API keys in server env |
| Test African-language support | To do | Languages in `lib/catalog.ts`. Start with Swahili |
| AI-assisted task generation | Partly | `generateAiResponse` fills a blank company response. Plug in `AI_API_KEY`. Keep the paste field |
| AI response evaluation | To do | A pre-check that answers the same three questions before the speaker |
| Fluency, accuracy, local context | To do | Those three questions |
| Compare AI vs human | To do | “AI said Yes, local speaker said No” on company and reviewer pages |
| Document models | To do | Add `docs/ai.md` |

### 4. Documentation Lead

| Task | Status | Where to start |
| --- | --- | --- |
| Document the problem | Done | Judge section at the top of this README |
| Document the solution | Done | One loop: invoice → speaker → reviewer → sats |
| Document users | Done | AI teams shipping to African markets, local speakers, expert reviewers |
| Maintain the README | Done | This file. Update Status when you ship |
| System architecture | Partly | `docs/architecture.md` still mentions the old marketplace in places. Core Lightning notes are current |
| Document the AI component | To do | With AI/ML (`docs/ai.md`) |
| Document data-quality | Done | Three questions, better answer after a No, reviewer confirms |
| Document how the platform works | Done | This README + `docs/team.md` |
| Screenshots | To do | `docs/screenshots/` |
| Final technical docs | To do | |
| Help the pitch | Done | Use the judge section and the Swahili M-Pesa demo below |

### 5. Group Lead / Project Lead

| Task | Status | Notes |
| --- | --- | --- |
| Coordinate the team | Ongoing | Tables above |
| Track progress | Ongoing | Update Status as work lands |
| Make sure parts integrate | Partly | One evaluation path. Old marketplace code is unused and still in the repo |
| Resolve blockers | To do | Connect Alby Hub (`NWC_URL` on Vercel). Real Lightning addresses on Rita and the reviewer for a live sats demo. Decide whether to delete old `/tasks` code |
| Keep focus | Ongoing | Local people paid in sats to catch a bad African-language AI answer |
| Final testing | To do | Demo below after every merge. `npx tsc --noEmit` must pass |
| Final demo / pitch | To do | One loop. Assignment is a 30-second extra, not a second product |
| Ready for submission | Partly | Live app + GitHub. Confirm `DEMO_LOGIN`. Live bitcoin needs Hub connected |

## Local development

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env
npm install
npm run db
```

Leave that process running (PGlite on port 5432). In a second terminal:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000.

On Windows, stop `npm run dev` before `npx prisma generate` or `npx prisma migrate deploy`.

Production uses hosted Postgres (`DATABASE_URL`). Docker Compose can start Postgres 16:

```bash
docker compose up -d
```

URL: `postgresql://taska:taska@localhost:5432/taska?schema=public`.

## Production

Live site: https://taska-beta.vercel.app

Vercel + Neon (`DATABASE_URL`). After schema changes:

```bash
vercel env run -e production -- npx prisma migrate deploy
vercel deploy --prod
```

Do **not** run `scripts/seed-demo.ts` against production unless you intend to wipe accounts.

Rename or move local `.env` before `vercel env run`, or it will talk to your laptop database.

## Demo

Password for every demo account: `demo1234`

| Role | Email |
| --- | --- |
| Rita (Swahili, Kenya) | rita@taska.demo |
| Chinedu (Yoruba / Hausa, Nigeria) | chinedu@taska.demo |
| Ama (Twi, Ghana) | ama@taska.demo |
| Company | employer@taska.demo |
| Reviewer | admin@taska.demo |
| Amina (also Swahili) | worker@taska.demo |

The login page has buttons when `DEMO_LOGIN=true`.

**Main loop (show this):**

1. **Company** — credits are loaded. **Get an answer checked**, Swahili, Kenya / M-Pesa. Hold 918 sats. The list should say **Rita Mwangi**.
2. **Rita** — three questions. A No needs a better answer.
3. **Reviewer** — agree, pay the speaker (or send it back).
4. **Company** — validated result. Rita and the reviewer see Lightning Sent and the sats.

**Assignment extra (only if asked):** company sends Yoruba → Chinedu, Twi → Ama.

Set `DEMO_LOGIN=false` before a fully public launch if you do not want the demo buttons.

## Project structure

```
app/actions/evaluations.ts   every evaluation status change
app/employer/                company pages
app/dashboard/               speaker pages
app/admin/                   reviewer pages
components/                  UI
lib/                         auth helpers, catalog, validation, pricing
services/                    assignment, ai, reports, settlement, Lightning
prisma/                      schema, migrations, seed
docs/team.md                 how each code module connects
```

An older task marketplace is still in the repo (`app/tasks`, `app/workers`, …) and is not linked. Speaker **Profile** is where the Lightning address lives.

## Lightning

Taska does not store wallet keys. Companies prepay by paying an invoice. That budget is held, then spent on approve. Settlement pays 500 + 400 to Lightning addresses.

**Live:** `NWC_URL` = `nostr+walletconnect://…` from [Alby Hub](https://albyhub.com/). Bitcoin sits in the Hub. Permissions: make invoices and pay invoices. Keep a Hub balance so payouts can leave.

**Demo:** no `NWC_URL` → `lnmock1`. No bitcoin moves.

Failed payouts retry from the review queue without paying a Sent row twice. Live NWC will not pay `@taska.demo` placeholders.

Never put the NWC secret in the frontend or git.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Session signing secret |
| `AUTH_URL` | Public app URL |
| `NWC_URL` | Alby Hub connection. Turns on live invoices and payouts |
| `EVALUATOR_PAYOUT_SATS` | Speaker payout (default 500) |
| `REVIEWER_PAYOUT_SATS` | Reviewer payout (default 400) |
| `PLATFORM_FEE_BPS` | Fee in basis points (default 200 = 2%) |
| `REVIEWER_LIGHTNING_ADDRESS` | Optional fallback if the reviewer has no saved address. Must be real when NWC is on |
| `AI_API_KEY` | Optional. Without it, a local demo reply is used |
| `AI_BASE_URL` | Optional. Defaults to `https://api.openai.com/v1` |
| `AI_MODEL` | Optional. Defaults to `gpt-4o-mini` |
| `BTC_USD_PRICE` | Display only |
| `DEMO_LOGIN` | Demo account buttons |
| `DEMO_PASSWORD` | Password for seeded demo accounts |

Never commit `.env`. Never put Lightning keys or seeds in the frontend or the database.

## Scripts

- `npm run dev` — app
- `npm run db` — local Postgres
- `npm run db:seed` — demo data
- `npm run build` — production build
- `npm run lint` — lint

## License

MIT. See [LICENSE](LICENSE).
