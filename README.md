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
