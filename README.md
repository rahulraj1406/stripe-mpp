# Agent Preflight

Pay-per-call safety checks for AI agents, charged over the **Machine Payments Protocol (MPP)**. An agent calls an endpoint, gets an HTTP `402 Payment Required` with a price, pays in the same request, and gets the result back with a receipt. No API keys, no accounts, no checkout page.

Live: https://stripe-mpp.vercel.app (Tempo **testnet**, so no real money moves)

## What problem it solves
Agents increasingly pay unknown services and read unknown web pages on their own. Agent Preflight is the check they run first: is this paid API legitimate, is this domain trustworthy, does this page try to hijack the agent?

## Endpoints

| Route | Price | What it returns |
|---|---|---|
| `GET /api/preflight?url=` | $0.02 | Is a paid API safe to pay? Checks HTTPS, a valid `402` challenge, price and recipient, `/openapi.json`, `/llms.txt`, latency and redirects. Score 0-100 and a verdict: `safe-to-pay`, `proceed-with-caution` or `avoid`. |
| `GET /api/domain-report?domain=` | $0.01 | DNS records, SPF, TLS certificate (validity, expiry, protocol) and security headers (HSTS, CSP, nosniff). Score and grade A-D. |
| `GET /api/safe-read?url=` | $0.01 | The page as clean text, plus a prompt-injection scan (hidden instructions, "ignore previous instructions" patterns). Risk: low, medium or high. |
| `GET /api/demo?domain=` | free | Sample domain report for `github.com`, `stripe.com`, `example.com` only. Cached 5 minutes. Powers the landing-page demo. |
| `GET /openapi.json` | free | Discovery document with `x-payment-info` prices. |
| `GET /llms.txt` | free | Plain-text description for agents. |

## How a paid call works
1. Agent requests `GET /api/domain-report?domain=github.com`.
2. Server answers `402` with a `WWW-Authenticate: Payment` challenge naming the price, currency and recipient.
3. Agent pays on Tempo and retries with a signed credential.
4. Server verifies it, returns the JSON result and a `Payment-Receipt` header.

Try it from a terminal:

```bash
npx mppx account create
npx mppx account fund --network testnet
npx mppx "https://stripe-mpp.vercel.app/api/domain-report?domain=github.com" --network testnet
```

## Architecture
- `server.js`: Express app. `mppx` middleware (`mppx.charge`) gates routes; `discovery()` generates `/openapi.json`.
- `lib.js`: safe URL fetching, MPP challenge parsing, HTML-to-text and injection scan, TLS and DNS lookups.
- `landing.js`: the landing page (served at `/`).
- Replay protection: Postgres store (Neon) via `Store.postgres`, required on Vercel because instances share no memory. Falls back to an in-memory store locally.
- Payments: `tempo.charge({ testnet: true })`, pathUSD on Tempo testnet.

## Security
- Every outbound fetch passes `assertPublicUrl`: only `http(s)`, ports 80/443, no credentials in URLs, DNS resolved and checked against private, loopback and link-local ranges on every redirect hop.
- Response size (1 MB), time (8 s) and redirect count (3) are capped.
- The TLS check connects to the validated IP, not a second DNS lookup.
- The free demo is allowlisted so it can't be used as a free scanner.

## Run locally
```bash
npm install
cp .env.example .env   # fill in values
npm start              # http://localhost:3100
npm run smoke          # checks routes and runs `mppx validate`
```

Environment variables:

| Name | Purpose |
|---|---|
| `MPP_SECRET_KEY` | Signs challenges and receipts. Generate with `openssl rand -hex 32`. Keep server-side. |
| `RECIPIENT` | Wallet address that receives payments. |
| `DATABASE_URL` | Postgres connection string (replay store). Required on Vercel. |
| `MPP_REALM` | Optional. Hostname used in challenges; defaults to `stripe-mpp.vercel.app` on Vercel. |

## Deploy and verify
Deployed on Vercel from `main`. Work on `develop` (preview deployments) and merge when `npm run smoke -- <preview-url>` passes. The tag `v1-submitted` marks the version submitted to the hackathon.

```bash
npx mppx validate https://stripe-mpp.vercel.app
```

## Ideas to build next
- Sessions or a subscription plan for agents that call constantly.
- Accept a Stripe card (Shared Payment Token) or Tempo mainnet alongside testnet.
- An MCP server wrapping the endpoints so agents use them as tools.
- Store results per URL to build a reputation history.

## Status
Testnet only. Payments move free test money, not real funds.
