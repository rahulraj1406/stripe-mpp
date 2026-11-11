# Agent Preflight
Pay-per-request safety checks for AI agents, charged over MPP (HTTP 402) on Tempo testnet.
- `GET /api/preflight?url=` ($0.02): is this API safe to pay? Checks HTTPS, valid 402 challenge, price/recipient, openapi, llms.txt, latency.
- `GET /api/safe-read?url=` ($0.01): page as clean text plus prompt-injection scan.
Discovery: `/openapi.json`, `/llms.txt`. Env: `MPP_SECRET_KEY`, `RECIPIENT`, `DATABASE_URL` (Postgres replay store, required on Vercel).
Validate: `npx mppx validate <url>`
