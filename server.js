import 'dotenv/config'
import express from 'express'
import { Mppx, tempo, discovery } from 'mppx/express'
import { Store } from 'mppx/server'
import { landing } from './landing.js'
import { safeFetch, assertPublicUrl, parsePaymentChallenge, htmlToText, httpErr } from './lib.js'

const store = process.env.DATABASE_URL
  ? Store.postgres(new (await import('pg')).default.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }))
  : Store.memory()

const mppx = Mppx.create({
  methods: [tempo.charge({ recipient: process.env.RECIPIENT, testnet: true, store })],
  secretKey: process.env.MPP_SECRET_KEY,
})

const app = express()
app.set('trust proxy', true)

const payPreflight = mppx.charge({ amount: '0.02', description: 'Preflight check of a URL before an agent pays it' })
const paySafeRead = mppx.charge({ amount: '0.01', description: 'Fetch a web page as clean text with prompt-injection scan' })

app.get('/api/preflight', payPreflight, async (req, res, next) => {
  try {
    const target = String(req.query.url || '')
    const base = (await assertPublicUrl(target)).origin
    const main = await safeFetch(target, { maxBytes: 20_000 })
    const [openapi, llms] = await Promise.all([
      safeFetch(base + '/openapi.json', { maxBytes: 500_000 }).catch(() => null),
      safeFetch(base + '/llms.txt', { maxBytes: 50_000 }).catch(() => null),
    ])
    const challenge = parsePaymentChallenge(main.res.headers.get('www-authenticate'))
    let offers = null
    if (openapi?.res.ok) try { const doc = JSON.parse(openapi.body); offers = Object.entries(doc.paths || {}).flatMap(([p, ops]) => Object.entries(ops).filter(([, o]) => o?.['x-payment-info']).map(([m, o]) => ({ path: p, method: m.toUpperCase(), offers: o['x-payment-info'].offers ?? o['x-payment-info'] }))) } catch {}
    const checks = {
      https: new URL(main.finalUrl).protocol === 'https:',
      returns402: main.res.status === 402,
      validPaymentChallenge: !!challenge?.method,
      hasOpenApi: !!openapi?.res.ok,
      advertisesPrice: !!offers?.length,
      hasLlmsTxt: !!llms?.res.ok,
      fastResponse: main.ms < 2000,
      noRedirectChain: main.hops === 0,
    }
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100)
    res.json({
      url: main.finalUrl, status: main.res.status, latencyMs: main.ms, score,
      verdict: score >= 80 ? 'safe-to-pay' : score >= 50 ? 'proceed-with-caution' : 'avoid',
      checks, challenge: challenge && { method: challenge.method, intent: challenge.intent, realm: challenge.realm, amount: challenge.request?.amount, currency: challenge.request?.currency, recipient: challenge.request?.recipient, expires: challenge.expires },
      declaredOffers: offers,
    })
  } catch (e) { next(e) }
})

app.get('/api/safe-read', paySafeRead, async (req, res, next) => {
  try {
    const r = await safeFetch(String(req.query.url || ''), { maxBytes: 1_000_000 })
    const ct = r.res.headers.get('content-type') || ''
    if (!/text|html|json|xml/.test(ct)) throw httpErr(415, `unsupported content-type ${ct}`)
    const t = htmlToText(r.body)
    res.json({ url: r.finalUrl, status: r.res.status, title: t.title, injectionRisk: t.risk, injectionSignals: t.flags, hiddenInstructionsDetected: t.hiddenInjection, links: t.links, chars: t.text.length, text: t.text.slice(0, 20000) })
  } catch (e) { next(e) }
})

discovery(app, mppx, {
  info: { title: 'Agent Preflight', version: '1.0.0', description: 'Safety checks for agents before they pay or read an unknown URL.' },
  routes: [
    { handler: payPreflight, method: 'get', path: '/api/preflight' },
    { handler: paySafeRead, method: 'get', path: '/api/safe-read' },
  ],
})

app.get('/llms.txt', (_req, res) => res.type('text/plain').send(`# Agent Preflight
> Safety checks for AI agents. Pay per request over MPP (HTTP 402), no API keys.

## Endpoints
- GET /api/preflight?url=<url>: $0.02. Checks whether an API is safe to pay: HTTPS, valid MPP 402 challenge, price and recipient, /openapi.json, /llms.txt, latency. Returns a 0-100 score and verdict.
- GET /api/safe-read?url=<url>: $0.01. Fetches a web page as clean text and scans for prompt-injection and hidden instructions before your agent reads it.

## Payment
MPP, Tempo testnet (pathUSD). Discovery: /openapi.json
`))
app.get('/', (_req, res) => res.type('html').send(landing))

app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'error' }))

const port = process.env.PORT || 3100
if (!process.env.VERCEL) app.listen(port, () => console.log(`http://localhost:${port}`))
export default app
