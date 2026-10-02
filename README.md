# Taska

**Is AI speaking your language correctly?**

Help train it. Get paid while you do.

AI can sound fluent and still get things wrong. A greeting can feel off. Slang can miss. An answer about paying a bill can skip how people actually pay in that country.

Taska is how a company gets an AI answer checked by someone who actually speaks the language — and how that person gets paid in bitcoin, instantly, over Lightning.

[**Try it → taska-beta.vercel.app**](https://taska-beta.vercel.app)

---

## The short version

1. A company pays a Lightning invoice and sends an AI answer (or a CSV of them).
2. Taska assigns the work to a speaker of that language — Rita for Swahili, Chinedu for Yoruba, Ama for Twi.
3. The speaker answers three questions. If anything is No, they write a better answer.
4. A reviewer agrees or sends it back.
5. On approve, bitcoin goes to the speaker and the reviewer. Rejected work is not charged.

That's the whole job. Sign up as a speaker or a company. Reviewers are invited.

---

## The problem

AI assistants already answer people in Nairobi, Lagos, and Accra. A lot of those answers are fluent and still wrong — a polite Swahili sentence that would send someone through the wrong M-Pesa steps.

Most evaluation platforms are built for English, for offices, and for payouts that sit until they hit a minimum. Speakers of African languages should not have to wait on a bank, a PayPal balance, or a platform that holds their money.

Taska exists to close that gap.

---

## What Taska does

Taska combines:

- Human checks for accuracy, naturalness, and local context
- Assignment by language and country
- Company prepaid credits
- Instant Lightning payouts
- An optional AI draft and pre-check that never approves or pays

All in one path: invoice → speaker → reviewer → payment.

---

## How it works

A company sends a question in the language people actually use — slang, a greeting, how something works here. They paste the AI answer, or leave it blank and Taska generates one.

A local speaker checks:

- **Accuracy** — Is the answer correct?
- **Naturalness** — Does it sound like something people actually say?
- **Local context** — Does it make sense for people in that place?

If something is wrong, they write it the way people really talk.

A reviewer then checks the submission. If they agree, payment is released. If not, the work comes back and nobody is charged.

Work is matched by language and country:

| Language / place     | Speaker |
| -------------------- | ------- |
| Swahili / Kenya      | Rita    |
| Yoruba / Nigeria     | Chinedu |
| Twi / Ghana          | Ama     |

If there is no available speaker for a language, the work waits.

---

## Who uses Taska

| Role         | What they do                                                     |
| ------------ | ---------------------------------------------------------------- |
| **Company**  | Sends AI responses to be checked and pays for completed work     |
| **Speaker**  | Checks responses in their language and improves them when needed |
| **Reviewer** | Checks the speaker's work before payment is released             |

Speakers and companies sign up publicly (**Sign me up** / **For companies**). Reviewers join by invite.

---

## Get paid as you go

Payments are **bitcoin, sent over Lightning**.

When a reviewer agrees, money leaves right then and lands in a wallet on the speaker's phone in seconds — like mobile money, not a bank transfer that waits. There is no minimum balance. Taska never holds their money or their wallet keys.

Rejected work is not charged.

```text
Company pays a Lightning invoice
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
   ├── No  → Task is sent back. Credits come back.
   └── Yes → Payment is released
                Company is charged 918 sats
                Speaker  → 500 sats
                Reviewer → 400 sats
                Taska    →  18 sats (2% fee)
```

The 2% is added on top of what the company pays. The speaker and reviewer still get the full 500 and 400. The leftover 18 sats stays in Taska's till.

The smallest credit pack is **1,000 sats** — enough for one check.

---

## Features

### Human language checks

- Three questions: accuracy, naturalness, local context
- A better-answer field when anything is No
- Reviewer approval before anyone is paid
- CSV / JSON upload (up to 200 rows) and a validated dataset download

### Assignment

- Language and country matching
- Work waits if no speaker is available
- Public speaker and company signup
- Invite-only reviewers

### Lightning (Breez SDK Spark)

- Company prepaid invoices
- Credits held when work is created, spent on approve, returned on reject
- Payouts to the Lightning address on a speaker or reviewer profile
- Failed payouts can be retried without paying a Sent row twice
- Till balance on the review queue

### Optional AI

- Fills a blank company answer
- Pre-check using the same three questions
- Shown beside the human result — not an approval signal and not a payment trigger

---

## Status

**Live at [taska-beta.vercel.app](https://taska-beta.vercel.app).** Production Lightning is Breez Spark. Health at `/api/health` should report `"lightning":"breez"`.

What works today:

- Speaker, company, and reviewer roles
- Signup, login, and password reset
- Language assignment (Rita / Chinedu / Ama)
- Credits, invoices, holds, and Lightning payouts
- Single evaluations and CSV / JSON upload
- Validated CSV / JSON export
- Reviewer invites and payout retry
- AI draft + optional pre-check
- Demo accounts and sample evaluations

What's still open:

- Copy button and QR for Lightning invoices
- A more compact signed-in header on small screens
- Reviewer summary totals
- Screenshots and the pitch deck / demo video

---

## Demo

**Password for every demo account:** `demo1234`

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
3. Log in as **Rita** and review the response. Write a better answer if needed.
4. Log in as **Reviewer** and approve or reject.
5. Log back in as **Company** to see the validated result.

Sample prompts in the demo: `Niaje, uko poa?` (Swahili), a Yoruba school-fee transfer, and a Twi mobile-money bill.

Do not run `npm run db:seed:demo` against production unless you intend to reset the demo data.

---

## Tech stack

| Layer               | Technology                                                   |
| ------------------- | ------------------------------------------------------------ |
| Framework           | Next.js 16, App Router, Server Actions                       |
| UI                  | React 19, Tailwind CSS 4                                     |
| Language            | TypeScript                                                   |
| Database            | PostgreSQL through Prisma 6                                  |
| Local database      | PGlite                                                       |
| Production database | Neon                                                         |
| Auth                | Auth.js, JWT sessions (1 hour), bcrypt, password-reset email |
| Validation          | Zod 4                                                        |
| AI                  | OpenAI-compatible API (optional)                             |
| Payments            | Bitcoin Lightning via Breez SDK Spark                        |
| Hosting             | Vercel + Neon                                                |

---

## Architecture

```text
Company  →  Lightning invoice  →  prepaid credits
                ↓
         Evaluation created (hold 918 sats)
                ↓
         Speaker assigned by language
                ↓
         Human check + optional AI pre-check
                ↓
         Reviewer agrees or sends it back
                ↓
    Spend credits    or    return the hold
                ↓
         Breez pays speaker (500) and reviewer (400)
```

`LightningService` is what the payment code calls. Live Breez is used when `BREEZ_API_KEY` and `BREEZ_MNEMONIC` are set. Otherwise the mock provider writes `lnmock1` invoices and does not move bitcoin.

Taska does not store wallet keys in the database. The till seed stays in server environment variables. A company's **Available** credit is a ledger, not a second wallet. Demo addresses such as `@taska.demo` are not paid when Lightning is live.

The older task marketplace (`app/tasks`, `app/workers`) is still in the repository and is not linked from the current product.

---

## Project structure

```text
app/
  actions/       Server Actions (evaluations, credits, upload, auth)
  employer/      Company dashboard, credits, upload, results
  dashboard/     Speaker dashboard
  admin/         Review queue, till, invites
  login/         Demo buttons and password login
  signup/        Speaker or company

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

# Optional AI. Without a key, Taska uses a local demo reply.
# AI_API_KEY=
# AI_BASE_URL=https://api.groq.com/openai/v1
# AI_MODEL=openai/gpt-oss-20b

DEMO_LOGIN=true
DEMO_PASSWORD=demo1234
```

Never commit `.env`. Never put the Breez key or mnemonic in Git, the frontend, or the database. Paste a Breez API key as one line — do not wrap it in `BEGIN CERTIFICATE` headers.

### Scripts

```bash
npm run dev          # Start the app
npm run db           # Start the local database
npm run db:seed      # Seed demo accounts and data
npm run db:samples   # Add extra sample evaluations
npm run build        # Production build
npm run lint         # Run linting
```

---

## Usage

### For companies

- Add credit and pay the Lightning invoice
- Check one answer, or upload a CSV / JSON file
- See the validated result after a reviewer agrees
- Download the validated dataset

### For speakers

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

Taska uses **Breez SDK Spark** to create invoices and pay Lightning addresses.

A new environment needs a Breez Spark API key (they email it after a short form):

```bash
curl -d "fullname=Taska" -d "company=Taska" -d "email=YOUR_EMAIL" -d "message=Hack4Freedom Taska Lightning payouts" \
  https://breez.technology/contact/apikey
```

Write the 12 words down offline first. On Vercel the wallet cache lives under `/tmp/breez` and is rebuilt from the mnemonic.

If `BREEZ_API_KEY` or `BREEZ_MNEMONIC` is not set, Taska uses a mock provider. No real bitcoin moves. Local health reports `"lightning":"mock"`.

---

## Documentation

- [`docs/team.md`](docs/team.md) — module ownership and the demo path
- [`docs/architecture.md`](docs/architecture.md) — request path and data model
- [`docs/ai.md`](docs/ai.md) — generation, pre-check, and model notes
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to open a pull request

---

## Contributing

PRs welcome. Keep this path working: **task → work → review → Lightning payment**.

1. Fork the repository
2. Create a feature branch
3. Run `npx tsc --noEmit` and the demo flow
4. Open a pull request into `main`

Do not add a custodial wallet, private keys, or a second payment rail in the core flow. New countries and languages belong in `lib/catalog.ts`.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Links

- **Live app:** [taska-beta.vercel.app](https://taska-beta.vercel.app)
- **Health:** [taska-beta.vercel.app/api/health](https://taska-beta.vercel.app/api/health)
- **Code:** [github.com/rxymitchy/taska](https://github.com/rxymitchy/taska)
- **Issues:** [github.com/rxymitchy/taska/issues](https://github.com/rxymitchy/taska/issues)
