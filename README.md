# Taska

Small tasks. African talent. Instant payments.

Taska is a work platform for AI and data microtasks. Businesses post clearly defined tasks. African workers complete them. Approved work is paid across borders with Bitcoin Lightning.

Lightning is the payment rail. The product is the work.

## Problem

Small digital tasks are hard to pay for across borders. A few hundred sats is too small for ordinary bank transfers, and a marketplace that holds the money becomes a wallet. Workers also get judged on a CV instead of work they have actually finished.

## Solution

A business posts a task with a reward, a language, and instructions. A worker completes it. A reviewer approves or rejects it. Approval sends a Lightning payment to the worker's own destination. Taska does not custody funds and does not store wallet keys.

The first task type is **AI response evaluation**: compare two answers and choose the more helpful one.

## How Lightning is used

1. The worker saves a Lightning address or invoice on their profile.
2. When a submission is approved, the server asks `LightningService` to create an invoice and pay it.
3. The payment hash, invoice, and amount are stored as history.
4. The worker sees "+500 sats" and "Paid via Lightning".

`LIGHTNING_PROVIDER=mock` uses `MockLightningProvider`. Those invoices start with `lnmock1` and do not move real bitcoin. They exist so the full task → review → payment flow can be demonstrated.

## Architecture

```
app/            pages, server actions, route handlers
components/     UI
lib/            auth helpers, catalog, validation
services/       reviews, payments, Lightning
prisma/         schema and seed
```

Country and language are separate profile fields. New countries or languages are added in `lib/catalog.ts`. Payment providers implement `LightningProvider` in `services/lightning/types.ts`.

Roles: `worker`, `employer`, `admin`.

See [docs/architecture.md](docs/architecture.md) for the data model and how to replace the mock Lightning provider.

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

`npm run db` is for local development. Production should use a hosted Postgres and set `DATABASE_URL`. Docker Compose in this repo starts Postgres 16 if you prefer that:

```bash
docker compose up -d
```

The Docker database URL is `postgresql://taska:taska@localhost:5432/taska?schema=public`.

## Demo

Password for every demo account: `demo1234`

| Role | Email |
| --- | --- |
| Worker | worker@taska.demo |
| Employer | employer@taska.demo |
| Reviewer | admin@taska.demo |

The login page can enter these when `DEMO_LOGIN=true`.

Suggested demo, about three minutes:

1. Open the landing page.
2. Choose Find Tasks.
3. Log in as the worker.
4. Open **Evaluate AI Responses**.
5. Start the task, compare the two responses, and submit.
6. The screen moves through review, approval, and a Lightning payment.
7. Open the dashboard. Earnings and payment history include the new payment.

The employer account can post a task. The reviewer account can approve or reject the pending submission under Review. Approval pays the worker. Rejection does not.

Turn off one-click demo login with `DEMO_LOGIN=false` before a public deployment.

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

Never put Lightning keys, seeds, or wallet credentials in the frontend or in the database. The mock provider does not use keys.

## Scripts

- `npm run dev` — app
- `npm run db` — local Postgres
- `npm run db:seed` — demo data
- `npm run build` — production build
- `npm run lint` — lint

## License

MIT. See [LICENSE](LICENSE).
