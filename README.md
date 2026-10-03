# Taska

**Hack4Freedom Nairobi 2026**

Taska helps AI startups and chatbot builders test whether their AI actually understands the people they are building for.

[**Try it → taska-beta.vercel.app**](https://taska-beta.vercel.app)

---

## Overview

A company can send us a small number of AI responses and choose the language and situation they want tested.

People who understand that language and context then check the responses. Another person reviews their work, and the company gets the results.

**Company → Evaluator → Reviewer → Results**

We are starting with African languages and local situations because AI can sometimes sound correct while still getting the meaning wrong.

Taska also uses Bitcoin Lightning to make it easier to pay people for these small pieces of work.

---

## Problem

AI is being used more and more across Africa, but it does not always understand how people actually speak or communicate.

For example, an AI might:

- Give a Swahili answer that sounds unnatural
- Understand the words but miss the meaning
- Give an answer that does not fit the local situation
- Work well in English but poorly in an African language

A small AI startup may only need 20, 50, or 100 responses tested. Finding the right people to test them quickly can be difficult.

There is also the problem of paying people for small amounts of work. Sending very small payments across countries can be expensive or inconvenient.

---

## Solution

Taska makes it simple for AI builders to get their responses tested by people who understand the language and situation.

### How it works

**Company**

The company sends AI responses to Taska and chooses what they want tested.

**Evaluator**

An evaluator checks the response:

- Is it correct?
- Does it sound natural?
- Does it make sense in this situation?

If the answer is wrong, they can explain what should be changed.

**Reviewer**

Another person checks the evaluation before it is sent back to the company.

**Company**

The company gets the results and can see where its AI needs improvement.

### Bitcoin Lightning

The work can be very small. An evaluator might only earn a few cents or a small amount for checking a few responses.

Taska uses **Bitcoin Lightning** to make these small payments easier and faster.

Companies do not have to use Bitcoin to use Taska. They can pay Taska normally, while Taska can use Lightning to pay the people doing the work.

We also give companies an incentive, ie a 10% discount, when they choose to pay through Lightning.

Evaluators and companies sign up publicly (**Sign me up** / **For companies**). Reviewers join by invite.

When a reviewer agrees, one check costs **918 sats**: 500 to the evaluator, 400 to the reviewer, and 18 (2%) stays in Taska's till. Rejected work is not charged. The smallest credit pack is **1,000 sats** — enough for one check.

```text
Company adds credit
   ↓
Company submits AI responses
   ↓
Evaluator checks the response
   ↓
Reviewer checks the submission
   ↓
Approved?
   ├── No  → Work is sent back. Credits come back.
   └── Yes → Lightning pays the evaluator and reviewer
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, Server Actions |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL, Prisma 6 |
| Local Database | PGlite |
| Production Database | Neon |
| Authentication | Auth.js, JWT sessions, bcrypt |
| Validation | Zod 4 |
| AI | OpenAI-compatible API |
| Payments | Bitcoin Lightning via Breez SDK Spark |
| Hosting | Vercel |
| Code | GitHub |

---

## Repository & Links

**GitHub:**  
https://github.com/rxymitchy/taska

**Live Demo:**  
https://taska-beta.vercel.app

**Health:**  
https://taska-beta.vercel.app/api/health

---

## Status

- Core platform is functional
- AI evaluation workflow is working
- Bitcoin Lightning payments are live through Breez SDK Spark
- Users can receive payments as they complete evaluation tasks
- Authentication and database features are being refined
- The project is currently in beta

Health at `/api/health` should report `"lightning":"breez"`.

---

## Next Steps

- Expand support for more African languages and local language varieties
- Improve evaluator matching and task assignment
- Refine the evaluation and review process
- Improve company-facing reports and feedback
- Add support for more AI models and APIs
- Support larger evaluation batches for companies
- Improve the platform based on feedback from early users
- Explore an API for companies that want to run evaluations automatically

In the long run, we want Taska to make it easy for AI builders to answer one simple question:

> **Does my AI actually understand the people I'm building it for?**

---

## Getting started

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
git clone https://github.com/rxymitchy/taska.git
cd taska
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

Open [http://localhost:3000](http://localhost:3000).

For local PostgreSQL instead of PGlite:

```bash
docker compose up -d
```

```text
postgresql://taska:taska@localhost:5432/taska?schema=public
```

On Windows, stop `npm run dev` before `npx prisma generate` or `npx prisma migrate deploy` if files are locked.

### Environment

Copy `.env.example` to `.env`. The important ones:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public&pgbouncer=true&connection_limit=1
AUTH_SECRET=replace-with-a-long-random-string
AUTH_URL=http://localhost:3000

# Live Lightning. Leave empty for mock invoices.
# BREEZ_API_KEY=
# BREEZ_MNEMONIC=
# BREEZ_NETWORK=mainnet

EVALUATOR_PAYOUT_SATS=500
REVIEWER_PAYOUT_SATS=400
PLATFORM_FEE_BPS=200

# Optional AI. Without a key, Taska uses a local fallback reply.
# AI_API_KEY=
# AI_BASE_URL=https://api.groq.com/openai/v1
# AI_MODEL=openai/gpt-oss-20b
```

Never commit `.env`. Never put the Breez key or mnemonic in Git, the frontend, or the database. Paste a Breez API key as one line — do not wrap it in `BEGIN CERTIFICATE` headers.

### Scripts

```bash
npm run dev          # Start the app
npm run db           # Start the local database
npm run db:seed      # Seed local development data
npm run db:samples   # Add extra sample evaluations
npm run build        # Production build
npm run lint         # Run linting
```

---

## Architecture

```text
Company  →  prepaid credits
                ↓
         Evaluation created (hold 918 sats)
                ↓
         Evaluator assigned by language and country
                ↓
         Human check + optional AI pre-check
                ↓
         Reviewer agrees or sends it back
                ↓
    Spend credits    or    return the hold
                ↓
         Breez pays evaluator (500) and reviewer (400)
```

`LightningService` is what the payment code calls. Live Breez is used when `BREEZ_API_KEY` and `BREEZ_MNEMONIC` are set. Otherwise the mock provider writes `lnmock1` invoices and does not move bitcoin.

Taska does not store wallet keys in the database. The till seed stays in server environment variables. A company's **Available** credit is a ledger, not a second wallet. Placeholder pay addresses are not paid when Lightning is live.

The older task marketplace (`app/tasks`, `app/workers`) is still in the repository and is not linked from the current product.

---

## Project structure

```text
app/
  actions/       Server Actions (evaluations, credits, upload, auth)
  employer/      Company dashboard, credits, upload, results
  dashboard/     Evaluator dashboard
  admin/         Review queue, till, invites
  login/         Demo buttons and password login
  signup/        Evaluator or company

components/      Shared UI

lib/
  pricing.ts     500 / 400 / 918 sats
  credits.ts     Hold, spend, refund
  catalog.ts     Languages and countries

services/
  ai/            Draft answers and pre-check
  assignment/    Language matching
  reports/       Company results and export
  settlement/    Lightning payouts
  lightning/     Breez Spark or mock

prisma/          Schema, migrations, seed
docs/            Team modules, architecture, AI notes
```

---

## Usage

### For companies

- Add credit for the checks you want to run
- Lightning is optional if you already have a wallet; evaluators still get paid over Lightning
- Check one answer, or upload a CSV / JSON file
- See the validated result after a reviewer agrees
- Download the validated dataset

### For evaluators

- Save a real Lightning address on **Profile**
- Open assigned work and answer the three questions
- Get paid when the reviewer agrees

### For reviewers

- Open the review queue
- See **Bitcoin in the till**
- Agree (pay) or send the work back
- Invite another reviewer

---

## Lightning

Taska uses **Breez SDK Spark** to pay evaluators and reviewers, and to take a Lightning invoice when a company already has a wallet.

A new environment needs a Breez Spark API key (they email it after a short form):

```bash
curl -d "fullname=Taska" -d "company=Taska" -d "email=YOUR_EMAIL" -d "message=Hack4Freedom Taska Lightning payouts" \
  https://breez.technology/contact/apikey
```

Write the 12 words down offline first. On Vercel the wallet cache lives under `/tmp/breez` and is rebuilt from the mnemonic.

If `BREEZ_API_KEY` or `BREEZ_MNEMONIC` is not set, Taska uses a mock provider. No real bitcoin moves. Local health reports `"lightning":"mock"`.

---

## Documentation

- [`docs/team.md`](docs/team.md) — module ownership and how to run the product locally
- [`docs/architecture.md`](docs/architecture.md) — request path and data model
- [`docs/ai.md`](docs/ai.md) — generation, pre-check, and model notes
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to open a pull request

---

## Contributing

PRs welcome. Keep this path working: **company sends work → evaluator → reviewer → Lightning payout**.

1. Fork the repository
2. Create a feature branch
3. Run `npx tsc --noEmit` and walk the company → evaluator → reviewer path
4. Open a pull request into `main`

Do not add a custodial wallet, private keys, or a second payment rail in the core flow. New countries and languages belong in `lib/catalog.ts`.

---

## License

MIT. See [LICENSE](LICENSE).
