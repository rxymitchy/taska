# Taska

**Check AI answers with people who actually speak the language — and pay them for it.**

Live: [taska-beta.vercel.app](https://taska-beta.vercel.app) · Hack4Freedom 2026 · [GitHub](https://github.com/rxymitchy/taska)

## The problem

AI can sound fluent and still get things wrong.

A greeting can feel unnatural. Slang can be completely off. An answer about paying a bill can miss how people actually pay in that country.

Taska gives companies a simple way to check AI responses with people who actually speak the language.

## How Taska works

A company sends an AI response to Taska. A local speaker checks it for:

- **Accuracy** — Is the answer correct?
- **Naturalness** — Does it sound like something people actually say?
- **Local context** — Does it make sense for people in that place?

If something is wrong, the speaker writes a better answer.

A reviewer then checks the submission before payment is released.

Work is matched by language and country. For example:

- Swahili / Kenya → Rita
- Yoruba / Nigeria → Chinedu
- Twi / Ghana → Ama

If there is no available speaker for a language, the work waits.

## Get paid as you go

Payments are made in **Bitcoin over Lightning**.

When work is approved, payment goes directly to the speaker and reviewer’s wallets in seconds. There is no minimum balance or waiting for a payout, and Taska never holds their money.

Rejected work is not charged.

## The payment flow

```text
Company
   ↓
Pays a Lightning invoice
   ↓
Credits are added
   ↓
Company submits AI responses
   ↓
Task is assigned to a speaker
   ↓
Speaker checks the response
   ↓
Reviewer checks the submission
   ↓
Approved?
   ├── No → Task is sent back
   └── Yes
        ↓
   Payment is released
        ↓
   Speaker → 500 sats
   Reviewer → 400 sats
   Taska → 18 sats (2% fee)
        ↓
   Company sees the validated result
```

## Who uses Taska?

| Role         | What they do                                                     |
| ------------ | ---------------------------------------------------------------- |
| **Company**  | Sends AI responses to be checked and pays for completed work     |
| **Speaker**  | Checks responses in their language and improves them when needed |
| **Reviewer** | Checks the speaker's work before payment is released             |

Speakers and companies can sign up publicly. Reviewers are invited.

## Demo

**Demo password:** `demo1234`

| Account  | Role     | Language                 |
| -------- | -------- | ------------------------ |
| Rita     | Speaker  | Swahili / Kenya          |
| Chinedu  | Speaker  | Yoruba / Hausa / Nigeria |
| Ama      | Speaker  | Twi / Ghana              |
| Company  | Company  | —                        |
| Reviewer | Reviewer | —                        |
| Amina    | Speaker  | Swahili                  |

The login page includes demo buttons when `DEMO_LOGIN=true`.

### Try the main flow

1. Log in as **Company** and open a Swahili evaluation.
2. See that it has been assigned to **Rita**.
3. Log in as **Rita** and review the response.
4. Submit a better answer if needed.
5. Log in as **Reviewer** and approve or reject the submission.
6. Log back in as **Company** to see the validated result.

You can also open the Chinedu and Ama accounts to see the other languages.

## Sample evaluations

The demo includes examples covering greetings and local payment instructions:

| Language | Example                                                  |
| -------- | -------------------------------------------------------- |
| Swahili  | `Niaje, uko poa?` · M-Pesa bill · M-Pesa without a phone |
| Yoruba   | `Bawo ni, ṣé o wa okay?` · School fee by transfer        |
| Twi      | `Ɛte sɛn? Woyɛ okay?` · Mobile money bill                |

These are demo samples. Companies can submit additional evaluations through the app.

# Team Progress

Status: **Done** means it works today. **Partly** means some of it exists but still needs work. **To do** means it has not been started.

## 1. Backend Developer

| Task                           | Status | Where to start                                            |
| ------------------------------ | ------ | --------------------------------------------------------- |
| Build the backend/API          | Done   | Server Actions in `app/actions/evaluations.ts`            |
| Create the database            | Done   | `prisma/schema.prisma`, `prisma/migrations/`              |
| User registration and login    | Done   | `app/actions/auth.ts`, `auth.ts`                          |
| Manage users and roles         | Done   | Speaker, company, reviewer. Reviewers use `/admin/invite` |
| Create and assign work         | Done   | Language + country in `services/assignment/index.ts`      |
| CSV/JSON upload                | Done   | `app/actions/upload.ts`                                   |
| Receive and store submissions  | Done   | `submitHumanEvaluation`, `EvaluationSubmission`           |
| Manage task status             | Done   | `app/actions/evaluations.ts`                              |
| Store AI evaluation results    | Done   | Human and optional AI rubric results + model are stored   |
| Dataset export                 | To do  | Add download of validated rows from `buildCompanyReport`  |
| Lightning payments             | Done   | Credits, 500 / 400 / 2%. `services/lightning/`            |
| Retry failed payouts           | Done   | Reviewer queue                                            |
| Assign by language             | Done   | Swahili → Rita, Yoruba → Chinedu, Twi → Ama               |
| Connect AI + database          | Done   | Generation + optional rubric pre-check; see `docs/ai.md`  |
| Connect Alby Hub in production | To do  | Add `NWC_URL` to Vercel                                   |

## 2. Frontend Developer

| Task                   | Status | Where to start                                                       |
| ---------------------- | ------ | -------------------------------------------------------------------- |
| Build the website      | Done   | `app/page.tsx`                                                       |
| Company dashboard      | Done   | `app/employer/`                                                      |
| Speaker dashboard      | Done   | `app/dashboard/`                                                     |
| Evaluation page        | Done   | `app/dashboard/evaluations/[id]`                                     |
| Admin dashboard        | Partly | Queue, invites and payout retry work; summary totals still need work |
| Company credit balance | Done   | `app/employer/credits`                                               |
| Progress and results   | Done   | Status + validated result                                            |
| Earnings               | Done   | Lightning Sent or Failed + sat amounts                               |
| Connect UI to backend  | Done   | Forms call Server Actions                                            |
| Responsive layout      | Partly | Works on mobile; signed-in header still needs compacting             |
| Copy Lightning invoice | To do  | Add a copy button; QR can come later                                 |
| Form errors            | Done   | Required fields + server errors                                      |
| Demo logins            | Done   | Rita, Chinedu and Ama                                                |

## 3. AI/ML Developer

| Task                                | Status | Where to start                                      |
| ----------------------------------- | ------ | --------------------------------------------------- |
| Research models / SDKs              | To do  | Keep API keys in server environment                 |
| Test African-language support       | To do  | Languages in `lib/catalog.ts`; start with Swahili   |
| AI-assisted task generation         | Partly | `generateAiResponse` fills a blank company response |
| AI response evaluation              | To do  | Pre-check using the same three questions            |
| Fluency, accuracy and local context | To do  | Three evaluation questions                          |
| Compare AI vs human                 | To do  | Show differences on company and reviewer pages      |
| Document AI models                  | To do  | `docs/ai.md`                                        |

## 4. Documentation Lead

| Task                   | Status | Where to start                                                |
| ---------------------- | ------ | ------------------------------------------------------------- |
| Document the problem   | Done   | README + homepage                                             |
| Document the solution  | Done   | Invoice → speaker → reviewer → payment                        |
| Document users         | Done   | Companies, speakers and reviewers                             |
| Maintain README        | Done   | This file                                                     |
| System architecture    | Partly | `docs/architecture.md` needs cleanup from the old marketplace |
| Document AI component  | To do  | `docs/ai.md`                                                  |
| Document data quality  | Done   | Three questions + reviewer confirmation                       |
| Document platform flow | Done   | README + `docs/team.md`                                       |
| Screenshots            | To do  | `docs/screenshots/`                                           |
| Final technical docs   | To do  | —                                                             |
| Pitch PowerPoint       | To do  | Problem, Taska flow and Lightning payments                    |
| Pitch / demo video     | To do  | Record the walkthrough using the demo flow                    |

## 5. Group Lead / Project Lead

The project lead keeps the team moving but does not own a separate product module.

| Task                   | Status  | Notes                                   |
| ---------------------- | ------- | --------------------------------------- |
| Call meetings          | Ongoing | Keep meetings short and focused         |
| Check in with everyone | Ongoing | Make sure nobody is blocked             |
| Progress updates       | Ongoing | Update this README when work is shipped |
| Keep focus             | Ongoing | Focus on language work that gets paid   |

# What is built

- Three roles: speaker, company and reviewer
- Public speaker/company signup
- Reviewer invitations
- Language and country-based task assignment
- Company credits
- Lightning invoices
- Single evaluations
- CSV/JSON uploads up to 200 rows
- Speaker evaluation with three checks
- Better-answer flow when a response is marked incorrect
- Reviewer approval and rejection
- Lightning payouts
- Failed payout retry
- AI-generated draft responses
- Company results
- Demo accounts and sample data
- Signup confirmation emails
- Forgot password reset emails
- Responsive dashboards

# Tech stack

| Layer               | Technology                                                   |
| ------------------- | ------------------------------------------------------------ |
| Framework           | Next.js 16, App Router, Server Actions                       |
| UI                  | React 19, Tailwind CSS 4                                     |
| Language            | TypeScript                                                   |
| Database            | PostgreSQL through Prisma 6                                  |
| Local database      | PGlite                                                       |
| Production database | Neon                                                         |
| Auth                | Auth.js, JWT sessions (1 hour), bcrypt, password reset email |
| Validation          | Zod 4                                                        |
| AI                  | OpenAI-compatible API                                        |
| Payments            | Bitcoin Lightning + Nostr Wallet Connect                     |
| Hosting             | Vercel + Neon                                                |

# Project structure

```text
app/
  actions/       Server Actions
  employer/      Company dashboard
  dashboard/     Speaker dashboard
  admin/         Reviewer dashboard

components/      Shared UI

lib/
  auth helpers
  catalog
  validation
  pricing

services/
  ai/             AI generation
  assignment/     Language assignment
  reports/        Company reports
  settlement/     Lightning payouts
  lightning/      Lightning provider

prisma/
  schema
  migrations
  seed

docs/
  team.md
  architecture.md
  ai.md
```

An older task marketplace is still in the repository (`app/tasks`, `app/workers`, etc.) but is not linked to the current product. The speaker **Profile** page stores their Lightning address.

# Local development

Requirements: **Node.js 22+** and **npm**.

```bash
cp .env.example .env
npm install
npm run db
```

Leave the database process running. In a second terminal:

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

For local PostgreSQL instead of PGlite:

```bash
docker compose up -d
```

Local PostgreSQL connection:

```text
postgresql://taska:taska@localhost:5432/taska?schema=public
```

On Windows, stop `npm run dev` before running `npx prisma generate` or `npx prisma migrate deploy` if files are locked.

# Production

Live site:

https://taska-beta.vercel.app

Taska uses **Vercel + Neon** in production.

After schema changes:

```bash
vercel env run -e production -- npx prisma migrate deploy
vercel deploy --prod
```

Do not run `scripts/seed-demo.ts` against production unless you intend to reset the demo data.

# Lightning payments

Taska uses **Nostr Wallet Connect (NWC)** to connect to a Lightning wallet such as Alby Hub.

Taska does not store wallet keys.

Companies prepay by paying a Lightning invoice. That credit is reserved when work is created and spent when the work is approved.

The current payment split is:

```text
Speaker     500 sats
Reviewer    400 sats
Taska        18 sats
--------------------
Total       918 sats
```

The Taska fee is 2%.

## Live Lightning

Set `NWC_URL` to a valid Nostr Wallet Connect connection from your Lightning wallet.

The wallet needs permission to create invoices and make payments.

Speaker and reviewer Lightning addresses must be real when live payments are enabled. Demo addresses such as `@taska.demo` are not paid through a live wallet.

## Demo Lightning

If `NWC_URL` is not set, Taska uses a mock Lightning provider.

No real Bitcoin moves.

The health endpoint reports:

```text
/api/health
```

Example:

```json
{
  "ok": true,
  "db": true,
  "lightning": "mock"
}
```

When a live NWC wallet is connected, `lightning` reports `nwc`.

Failed payouts can be retried from the reviewer queue. A payout that has already been sent will not be sent twice.

Never put the NWC connection or wallet secrets in the frontend, database, or Git.

# Environment variables

| Variable                     | Purpose                            |
| ---------------------------- | ---------------------------------- |
| `DATABASE_URL`               | PostgreSQL connection              |
| `AUTH_SECRET`                | Session signing secret             |
| `AUTH_URL`                   | Public app URL                     |
| `RESEND_API_KEY`             | Signup and password-reset emails   |
| `EMAIL_FROM`                 | Email sender                       |
| `NWC_URL`                    | Lightning wallet connection        |
| `EVALUATOR_PAYOUT_SATS`      | Speaker payout, default 500        |
| `REVIEWER_PAYOUT_SATS`       | Reviewer payout, default 400       |
| `PLATFORM_FEE_BPS`           | Taska fee, default 200 = 2%        |
| `REVIEWER_LIGHTNING_ADDRESS` | Optional reviewer fallback address |
| `AI_API_KEY`                 | Optional AI provider key           |
| `AI_BASE_URL`                | Optional AI API base URL           |
| `AI_MODEL`                   | Optional AI model                  |
| `BTC_USD_PRICE`              | Display-only BTC price             |
| `DEMO_LOGIN`                 | Enable demo account buttons        |
| `DEMO_PASSWORD`              | Password for seeded demo accounts  |

Never commit `.env`.

# Scripts

```bash
npm run dev          # Start the app
npm run db           # Start the local database
npm run db:seed      # Seed demo accounts and data
npm run db:samples   # Add extra sample evaluations
npm run build        # Production build
npm run lint         # Run linting
```

# Documentation

- `docs/team.md` — team responsibilities and module ownership
- `docs/architecture.md` — system architecture
- `docs/ai.md` — AI component and model research

# License

MIT. See [LICENSE](LICENSE).
