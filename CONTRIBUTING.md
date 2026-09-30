# Contributing

Taska is an early open-source MVP. The useful change is one that keeps this path working:

task → work → review → Lightning payment.

## Setup

Follow the local development steps in the README. Do not commit `.env`, `data/`, or `uploads/`.

## Pull requests

- Keep the diff focused.
- Use TypeScript and the existing folder layout.
- Validate input on the server.
- Do not add a custodial wallet, private keys, or a second payment rail in the core flow.
- New countries and languages belong in `lib/catalog.ts`, not in payment code.

## Lightning

Live payments use Alby Hub through `NWC_URL` (Nostr Wallet Connect). Mock is for local demo only. Read credentials from server environment variables only.

Invoices created by the mock provider are not payable on a real network.

## Project direction

Later work can include verified skills, CV parsing, more task types, employer verification, and local cash-out. Those should sit behind the same task and payment models. They are not required for the MVP.
